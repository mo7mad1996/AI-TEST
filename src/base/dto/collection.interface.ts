export interface ICollection<Entity extends object> {
  total: number;
  page: number;
  per_page: number;
  pagesCount: number;
  objects: Entity[];
}
