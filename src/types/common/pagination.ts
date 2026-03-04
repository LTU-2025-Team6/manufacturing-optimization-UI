/**
 * Default page size used across the application.
 */
export const DEFAULT_PAGE_SIZE = 5;

/**
 * Generic paginated response wrapper.
 */
export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Request parameters for pagination.
 */
export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}
