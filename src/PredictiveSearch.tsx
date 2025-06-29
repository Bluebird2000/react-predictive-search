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
  } = usePredictive(dataSource);

  const handleSelect = (item: T) => {
    select(item);
    onSelect?.(item);
  };

  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => query && setActiveIndex(-1)}
        className="w-full rounded-2xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {isOpen && results.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-lg">
          {results.map((item, idx) => (
            <li
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
    </div>
  );
}
