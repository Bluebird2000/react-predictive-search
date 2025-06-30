import React from "react";
import { DataSource, SearchItem } from "./types";
import { usePredictive } from "./usePredictive";

export function PredictiveSearch<T extends SearchItem = SearchItem>({
  dataSource,
  placeholder = "Search…",
  onSelect,
  className = "",
}: {
  dataSource: DataSource<T>;
  placeholder?: string;
  onSelect?: (item: T) => void;
  className?: string;
}) {
  const {
    query,
    setQuery,
    results,
    isOpen,
    activeIndex,
    setActiveIndex,
    onKeyDown,
    select,
    clearQuery,
    loading,
    error,
  } = usePredictive(dataSource);

  const handleSelect = (item: T) => {
    select(item);
    onSelect?.(item);
  };

  return (
    <div
      className={`relative w-full max-w-md ${className}`}
      role="combobox"
      aria-expanded={isOpen}
    >
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => query && setActiveIndex(-1)}
        aria-activedescendant={
          activeIndex >= 0 ? `result-${activeIndex}` : undefined
        }
        className="w-full rounded-2xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {query && (
        <button
          onClick={clearQuery}
          className="absolute right-3 top-2.5 text-sm text-gray-500"
        >
          ×
        </button>
      )}
      {isOpen && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-lg">
          {loading && (
            <li className="px-4 py-2 text-gray-500 italic">Loading...</li>
          )}
          {!loading && results.length === 0 && (
            <li className="px-4 py-2 text-gray-500 italic">No results found</li>
          )}
          {results.map((item, idx) => (
            <li
              id={`result-${idx}`}
              key={item.id}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item);
              }}
              className={`cursor-pointer px-4 py-2 transition-colors duration-100 ${
                idx === activeIndex ? "bg-indigo-100" : "hover:bg-gray-100"
              }`}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
