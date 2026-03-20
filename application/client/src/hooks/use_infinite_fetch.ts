import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_LIMIT = 30;

function appendPaginationParams(apiPath: string, limit: number, offset: number) {
  const url = new URL(apiPath, window.location.origin);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));
  return `${url.pathname}${url.search}`;
}

interface Options {
  limit?: number;
}

interface ReturnValues<T> {
  data: Array<T>;
  error: Error | null;
  hasMore: boolean;
  isLoading: boolean;
  fetchMore: () => void;
}

export function useInfiniteFetch<T>(
  apiPath: string,
  fetcher: (apiPath: string) => Promise<T[]>,
  options: Options = {},
): ReturnValues<T> {
  const limit = options.limit ?? DEFAULT_LIMIT;
  const internalRef = useRef({ hasMore: true, isLoading: false, offset: 0 });

  const [result, setResult] = useState<Omit<ReturnValues<T>, "fetchMore">>({
    data: [],
    error: null,
    hasMore: apiPath !== "",
    isLoading: apiPath !== "",
  });

  const fetchMore = useCallback(() => {
    const { hasMore, isLoading, offset } = internalRef.current;
    if (apiPath === "" || isLoading || !hasMore) {
      return;
    }

    setResult((cur) => ({
      ...cur,
      isLoading: true,
    }));
    internalRef.current = {
      hasMore,
      isLoading: true,
      offset,
    };

    void fetcher(appendPaginationParams(apiPath, limit, offset)).then(
      (pageData) => {
        setResult((cur) => ({
          ...cur,
          data: [...cur.data, ...pageData],
          hasMore: pageData.length === limit,
          isLoading: false,
        }));
        internalRef.current = {
          hasMore: pageData.length === limit,
          isLoading: false,
          offset: offset + pageData.length,
        };
      },
      (error) => {
        setResult((cur) => ({
          ...cur,
          error,
          isLoading: false,
        }));
        internalRef.current = {
          hasMore,
          isLoading: false,
          offset,
        };
      },
    );
  }, [apiPath, fetcher, limit]);

  useEffect(() => {
    if (apiPath === "") {
      setResult(() => ({
        data: [],
        error: null,
        hasMore: false,
        isLoading: false,
      }));
      internalRef.current = {
        hasMore: false,
        isLoading: false,
        offset: 0,
      };
      return;
    }

    setResult(() => ({
      data: [],
      error: null,
      hasMore: true,
      isLoading: true,
    }));
    internalRef.current = {
      hasMore: true,
      isLoading: false,
      offset: 0,
    };

    fetchMore();
  }, [fetchMore]);

  return {
    ...result,
    fetchMore,
  };
}
