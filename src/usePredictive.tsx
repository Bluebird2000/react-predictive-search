import React, { useState, useEffect, useRef, useCallback } from "react";
import { getHistory, saveQueryToHistory } from "./history";
import { DataSource, SearchItem } from "./types";

export function usePredictive<T extends SearchItem = SearchItem>(
  source: DataSource<T>,
  {
    debounce = 150,
    historyLimit = 5,
  }: { debounce?: number; historyLimit?: number } = {}
) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [history, setHistory] = useState<string[]>(getHistory(historyLimit));
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<NodeJS.Timeout>();

  const select = useCallback(
    (item: T) => {
      saveQueryToHistory(item.label);
      setHistory(getHistory(historyLimit));
      setQuery(item.label);
      setIsOpen(false);
    },
    [historyLimit]
  );

  useEffect(() => {
    if (!query.trim()) {
      setResults(
        history.map((q, i) => ({ id: `h${i}`, label: q } as unknown as T))
      );
      setIsOpen(true);
      return;
    }
  }, [query, history]);

  useEffect(() => {
    if (!query.trim()) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await source.search(query);
        setResults(res);
        setIsOpen(true);
      } catch (err) {
        setError("Search failed");
      } finally {
        setLoading(false);
      }
    }, debounce);
  }, [query, source, debounce]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent | React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + results.length) % results.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results[activeIndex]) {
          select(results[activeIndex]);
        }
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    },
    [isOpen, results, activeIndex, select]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKeyDown(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onKeyDown]);

  return {
    query,
    setQuery,
    results,
    isOpen,
    activeIndex,
    setActiveIndex,
    onKeyDown,
    select,
    loading,
    error,
  };
}
