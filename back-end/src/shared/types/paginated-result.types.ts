export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    perPage: number;
    pageCount: number;
  };
}
