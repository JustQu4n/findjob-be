# Pagination System

## Overview

Hệ thống phân trang chung được sử dụng trong toàn bộ dự án để đảm bảo tính nhất quán.

## Components

### 1. PaginationDto

DTO base class cho tất cả các query có phân trang.

**Location:** `src/common/dto/pagination.dto.ts`

**Fields:**
```typescript
{
  page?: number;    // Default: 1, Min: 1
  limit?: number;   // Default: 10, Min: 1, Max: 100
}
```

**Validation:**
- `page`: Phải là số nguyên >= 1
- `limit`: Phải là số nguyên từ 1 đến 100

**Usage:**
```typescript
import { PaginationDto } from 'src/common/dto';

export class QueryJobPostDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;
  
  // ... other fields
}
```

### 2. PaginationMeta

Interface cho metadata của pagination.

```typescript
interface PaginationMeta {
  total: number;           // Tổng số items
  page: number;            // Trang hiện tại
  limit: number;           // Số items mỗi trang
  totalPages: number;      // Tổng số trang
  hasNextPage: boolean;    // Có trang tiếp theo?
  hasPreviousPage: boolean;// Có trang trước?
}
```

### 3. PaginatedResult<T>

Generic interface cho response có phân trang.

```typescript
interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}
```

**Example Response:**
```json
{
  "data": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Helper Functions

### createPaginatedResult()

Tạo pagination response một cách dễ dàng.

**Location:** `src/common/utils/helpers/pagination.helper.ts`

**Signature:**
```typescript
function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T>
```

**Usage:**
```typescript
import { createPaginatedResult } from 'src/common/utils/helpers';

const [data, total] = await repository.findAndCount();
return createPaginatedResult(data, total, page, limit);
```

### calculateSkip()

Tính skip value cho database query.

**Signature:**
```typescript
function calculateSkip(page: number, limit: number): number
```

**Usage:**
```typescript
import { calculateSkip } from 'src/common/utils/helpers';

const skip = calculateSkip(page, limit);
queryBuilder.skip(skip).take(limit);
```

## Implementation Guide

### 1. Tạo Query DTO

```typescript
import { PaginationDto } from 'src/common/dto';

export class QueryProductDto extends PaginationDto {
  @IsOptional()
  @IsString()
  category?: string;
}
```

### 2. Implement Service Method

```typescript
import { PaginatedResult } from 'src/common/dto';
import { createPaginatedResult, calculateSkip } from 'src/common/utils/helpers';

async findAll(query: QueryProductDto): Promise<PaginatedResult<Product>> {
  const { page = 1, limit = 10, category } = query;
  const skip = calculateSkip(page, limit);
  
  const queryBuilder = this.repository.createQueryBuilder('product');
  
  if (category) {
    queryBuilder.where('product.category = :category', { category });
  }
  
  queryBuilder.skip(skip).take(limit);
  
  const [data, total] = await queryBuilder.getManyAndCount();
  
  return createPaginatedResult(data, total, page, limit);
}
```

### 3. Controller

```typescript
@Get()
async findAll(@Query() query: QueryProductDto) {
  return this.service.findAll(query);
}
```

## Examples

### Basic Pagination

**Request:**
```
GET /api/products?page=2&limit=20
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 2,
    "limit": 20,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": true
  }
}
```

### With Filters

**Request:**
```
GET /api/products?page=1&limit=10&category=electronics&search=laptop
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Validation Rules

### Default Values
- `page`: 1
- `limit`: 10

### Constraints
- `page`: min = 1
- `limit`: min = 1, max = 100

### Error Examples

**Invalid page (< 1):**
```json
{
  "statusCode": 400,
  "message": ["Trang phải lớn hơn hoặc bằng 1"],
  "error": "Bad Request"
}
```

**Invalid limit (> 100):**
```json
{
  "statusCode": 400,
  "message": ["Limit không được vượt quá 100"],
  "error": "Bad Request"
}
```

**Invalid type:**
```json
{
  "statusCode": 400,
  "message": ["Trang phải là số nguyên", "Limit phải là số nguyên"],
  "error": "Bad Request"
}
```

## Best Practices

### 1. Always Extend PaginationDto
```typescript
// ✅ Good
export class QueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;
}

// ❌ Bad - Don't redefine page/limit
export class QueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;
  
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}
```

### 2. Use Helper Functions
```typescript
// ✅ Good - DRY
const skip = calculateSkip(page, limit);
return createPaginatedResult(data, total, page, limit);

// ❌ Bad - Repetitive
const skip = (page - 1) * limit;
return {
  data,
  pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPreviousPage: page > 1,
  }
};
```

### 3. Type Your Returns
```typescript
// ✅ Good - Explicit typing
async findAll(query: QueryDto): Promise<PaginatedResult<Product>> {
  // ...
}

// ❌ Bad - No typing
async findAll(query: QueryDto) {
  // ...
}
```

### 4. Default Values in Query
```typescript
// ✅ Good - Destructure with defaults
const { page = 1, limit = 10 } = query;

// ⚠️ Also works but less clear
const page = query.page || 1;
const limit = query.limit || 10;
```

## Frontend Integration

### React Example

```typescript
import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    fetch(`/api/products?page=${page}&limit=10`)
      .then(res => res.json())
      .then(result => {
        setProducts(result.data);
        setPagination(result.pagination);
      });
  }, [page]);
  
  return (
    <div>
      {products.map(p => <div key={p.id}>{p.name}</div>)}
      
      {pagination && (
        <div>
          <button 
            disabled={!pagination.hasPreviousPage}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          
          <span>{pagination.page} / {pagination.totalPages}</span>
          
          <button 
            disabled={!pagination.hasNextPage}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

## Performance Tips

1. **Index Database Columns**: Index các columns thường dùng cho sorting và filtering
2. **Limit Max Page Size**: Đã set max limit = 100 để prevent large queries
3. **Cache Results**: Consider caching frequently accessed pages
4. **Count Query Optimization**: Đối với large datasets, xem xét cache total count

## Testing

### Unit Test Example

```typescript
import { createPaginatedResult, calculateSkip } from './pagination.helper';

describe('Pagination Helpers', () => {
  describe('calculateSkip', () => {
    it('should calculate skip correctly', () => {
      expect(calculateSkip(1, 10)).toBe(0);
      expect(calculateSkip(2, 10)).toBe(10);
      expect(calculateSkip(3, 20)).toBe(40);
    });
  });
  
  describe('createPaginatedResult', () => {
    it('should create paginated result with correct meta', () => {
      const data = [1, 2, 3];
      const result = createPaginatedResult(data, 25, 1, 10);
      
      expect(result.data).toEqual(data);
      expect(result.pagination.total).toBe(25);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(false);
    });
  });
});
```

## Migration Guide

Nếu bạn có code cũ sử dụng custom pagination:

**Before:**
```typescript
async findAll(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [data, total] = await this.repo.findAndCount({ skip, take: limit });
  
  return {
    items: data,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    }
  };
}
```

**After:**
```typescript
import { PaginationDto, PaginatedResult } from 'src/common/dto';
import { createPaginatedResult, calculateSkip } from 'src/common/utils/helpers';

async findAll(query: PaginationDto): Promise<PaginatedResult<Entity>> {
  const { page = 1, limit = 10 } = query;
  const skip = calculateSkip(page, limit);
  const [data, total] = await this.repo.findAndCount({ skip, take: limit });
  
  return createPaginatedResult(data, total, page, limit);
}
```

## Changelog

### Version 1.0.0
- Initial implementation
- PaginationDto với validation
- PaginationMeta interface
- PaginatedResult interface
- Helper functions: createPaginatedResult, calculateSkip
- Max limit set to 100
