import { EventSubscriber, EntitySubscriberInterface, InsertEvent } from 'typeorm';
import { randomUUID } from 'crypto';

@EventSubscriber()
export class UuidSubscriber implements EntitySubscriberInterface<any> {
  beforeInsert(event: InsertEvent<any>) {
    if (!event.entity) return;

    const metadata = event.metadata;
    for (const column of metadata.columns) {
      if (column.isPrimary && (column.type === 'uuid' || column.type === 'character varying' && column.propertyName.endsWith('_id'))) {
        const propName = column.propertyName as string;
        if (!event.entity[propName]) {
          event.entity[propName] = randomUUID();
        }
      }
    }
  }
}
