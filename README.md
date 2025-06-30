 ### react-predictive-search
 A fully‑typed React + TypeScript predictive/autocomplete search component
 with typo‑tolerant fuzzy matching, keyboard navigation, recent‑search history,
 dynamic suggestions, and pluggable data‑sources (static, Algolia, Elasticsearch).
 -----------------------------------------------------------------------------

 ### Project Structure (all in this file for brevity)
   ## src/
    - types.ts            — reusable types
    - dataSources.ts      — DataSource interface + 3 concrete impls
    - history.ts          — recent‑search persistence helpers
    - usePredictive.ts    — core hook that powers the component
    - PredictiveSearch.tsx— UI component
    - index.ts            — public API
    - demo.tsx            — minimal demo app
 -----------------------------------------------------------------------------

 ### Creating Your Own DataSource
```const customSource: DataSource<SearchItem> = {
  async search(query) {
    const response = await fetch(`/api/search?q=${query}`);
    return await response.json(); // must match SearchItem[]
  }
};
```

### Usage Example

```
import {
  PredictiveSearch,
  createStaticDataSource,
  SearchItem,
} from "react-predictive-search";

const items: SearchItem[] = [
  { id: 1, label: "Apple", category: "Fruits" },
  { id: 2, label: "Banana", category: "Fruits" },
  { id: 3, label: "Antelope", category: "Animals" },
  { id: 4, label: "Avocado", category: "Fruits" },
];

const dataSource = createStaticDataSource(items);

export default function App() {
  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Search Example</h1>
      <PredictiveSearch
        dataSource={dataSource}
        placeholder="Search for a fruit or animal"
        onSelect={(item) => alert(`You selected: ${item.label}`)}
      />
    </div>
  );
}
```

###  API Reference

| Prop          | Type                | Description                     |
| ------------- | ------------------- | ------------------------------- |
| `dataSource`  | `DataSource<T>`     | Search logic provider           |
| `placeholder` | `string`            | Input placeholder               |
| `onSelect`    | `(item: T) => void` | Called when an item is selected |
| `className`   | `string`            | Additional wrapper styling      |


### Data Source Creators
 ### Static
```const source = createStaticDataSource(items);```

 ### Algolia
```const source = createAlgoliaDataSource("APP_ID", "API_KEY", "INDEX_NAME");```

 ### Elasticsearch
```const source = createElasticsearchDataSource("http://localhost:PORT/index-name");```