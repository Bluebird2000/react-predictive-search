const LS_KEY = "react-predictive-search-history";
interface HistoryRecord {
  q: string;
  ts: number;
}

export function saveQueryToHistory(query: string) {
  if (typeof window === "undefined" || !query) return;
  const entry: HistoryRecord = { q: query, ts: Date.now() };
  const arr: HistoryRecord[] = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  const without = arr.filter((r) => r.q !== query);
  without.unshift(entry);
  localStorage.setItem(LS_KEY, JSON.stringify(without.slice(0, 15)));
}

export function getHistory(limit = 5): string[] {
  try {
    const arr: HistoryRecord[] = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    return arr
      .sort((a, b) => b.ts - a.ts)
      .slice(0, limit)
      .map((r) => r.q);
  } catch {
    return [];
  }
}