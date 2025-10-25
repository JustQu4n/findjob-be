import { PaginatedResult, PaginationMeta } from 'src/common/dto';

/**
 * Tạo pagination response
 */
export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);

  const pagination: PaginationMeta = {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  return {
    data,
    pagination,
  };
}

/**
 * Tính skip value cho pagination
 */
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}
