import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

// Patch Repository.save to set UUID primary keys if missing
const origSave = (Repository.prototype as any).save;
(Repository.prototype as any).save = function patchedSave(entityOrEntities: any, ...args: any[]) {
  try {
    const repo: Repository<any> = this as any;
    const setUuid = (entity: any) => {
      if (!entity) return;
      const metadata = repo.metadata;
      if (!metadata) return;
      for (const column of metadata.columns) {
        if (column.isPrimary && column.type === 'uuid') {
          const prop = column.propertyName as string;
          if (!entity[prop]) entity[prop] = uuidv4();
        }
      }
    };

    if (Array.isArray(entityOrEntities)) {
      entityOrEntities.forEach(setUuid);
    } else {
      setUuid(entityOrEntities);
    }
  } catch (err) {
    // swallow patch errors to avoid breaking app startup
    // console.warn('UUID patch error', err);
  }

  return origSave.call(this, entityOrEntities, ...args);
};
