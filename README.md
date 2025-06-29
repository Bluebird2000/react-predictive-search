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