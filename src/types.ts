export interface SearchItem {
  id: string | number;
  label: string;
  [key: string]: any;
}

export interface DataSource<T extends SearchItem = SearchItem> {
  search(query: string): Promise<T[]>;
}