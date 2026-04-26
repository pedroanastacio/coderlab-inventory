export type SortParams<T = string> = {
  sortBy: T;
  sortOrder: SortOrder;
};

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}
