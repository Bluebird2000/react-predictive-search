import Fuse from "fuse.js";
import type { IFuseOptions } from "fuse.js";
import { algoliasearch } from "algoliasearch";
import { DataSource, SearchItem } from "./types";

export const createStaticDataSource = <T extends SearchItem = SearchItem>(
  data: T[],
  fuseOptions?: IFuseOptions<T>
): DataSource<T> => {
  const fuse = new Fuse(data, {
    includeScore: true,
    threshold: 0.45,
    keys: ["label"],
    ...(fuseOptions || {}),
  });

  return {
    async search(query: string) {
      if (!query) return [];
      return fuse
        .search(query)
        .map((r) => r.item)
        .slice(0, 10);
    },
  };
};

export const createAlgoliaDataSource = <T extends SearchItem = SearchItem>(
  appId: string,
  apiKey: string,
  indexName: string
): DataSource<T> => {
  const client = algoliasearch(appId, apiKey);
  return {
    async search(query: string) {
      if (!query) return [];
      const res = await client.initIndex(indexName).search<T>(query, {
        hitsPerPage: 10,
      });
      return res.hits;
    },
  };
};

export const createElasticsearchDataSource = <
  T extends SearchItem = SearchItem
>(
  endpoint: string
): DataSource<T> => {
  const cleanEndpoint = endpoint.replace(/\/$/, "");
  return {
    async search(query: string) {
      if (!query) return [];
      const res = await fetch(`${cleanEndpoint}/_search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: {
            multi_match: {
              query,
              fuzziness: "AUTO",
            },
          },
          size: 10,
        }),
      });
      const json = await res.json();
      return (
        json.hits?.hits?.map((h: any) => ({ id: h._id, ...h._source })) ?? []
      );
    },
  };
};
