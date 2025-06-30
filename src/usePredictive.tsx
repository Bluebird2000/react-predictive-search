import React, { useState, useEffect, useRef, useCallback } from "react";
import { getHistory, saveQueryToHistory } from "./history";
import { DataSource, SearchItem } from "./types";

export function usePredictive<T extends SearchItem = SearchItem>(
  source: DataSource<T>,
  {
    debounce = 150,
    historyLimit = 5,
    enablePartialMatchFallback = true,
  }: {
    debounce?: number;
    historyLimit?: number;
    enablePartialMatchFallback?: boolean;
  } = {}
) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [history, setHistory] = useState<string[]>(getHistory(historyLimit));
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
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

  const clearQuery = () => {
    setQuery("");
    setResults([]);
    setActiveIndex(-1);
    setIsOpen(false);
  };

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
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    timer.current = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await source.search(query);
        if (!controller.signal.aborted) {
          if (res.length === 0 && enablePartialMatchFallback) {
            // TODO: Try partial match logic (e.g., remove last word or char)
            const fallback = await source.search(
              query.slice(0, query.length - 1)
            );
            setResults(fallback);
          } else {
            setResults(res);
          }
          setIsOpen(true);
        }
      } catch (err) {
        if (!controller.signal.aborted) setError("Search failed");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, debounce);
  }, [query, source, debounce, enablePartialMatchFallback]);

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
        const item =
          results[activeIndex] || (results.length === 1 && results[0]);
        if (item) select(item);
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
    clearQuery,
    loading,
    error,
  };
}

