import { useState, useMemo, useCallback } from "react";

interface UseSearchOptions {
  searchFields?: string[];
  caseSensitive?: boolean;
  debounceMs?: number;
}

interface UseSearchReturn<T> {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredData: T[];
  clearSearch: () => void;
  hasActiveSearch: boolean;
}

export function useSearch<T extends Record<string, any>>(
  data: T[],
  options: UseSearchOptions = {}
): UseSearchReturn<T> {
  const {
    searchFields = ["name", "title", "description"],
    caseSensitive = false,
    debounceMs = 0,
  } = options;

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // 디바운스 처리
  const updateSearchTerm = useCallback(
    (term: string) => {
      setSearchTerm(term);

      if (debounceMs > 0) {
        const timer = setTimeout(() => {
          setDebouncedSearchTerm(term);
        }, debounceMs);

        return () => clearTimeout(timer);
      } else {
        setDebouncedSearchTerm(term);
      }
    },
    [debounceMs]
  );

  const activeSearchTerm = debounceMs > 0 ? debouncedSearchTerm : searchTerm;

  const filteredData = useMemo(() => {
    if (!activeSearchTerm.trim()) {
      return data;
    }

    const searchQuery = caseSensitive
      ? activeSearchTerm.trim()
      : activeSearchTerm.trim().toLowerCase();

    return data.filter((item) => {
      return searchFields.some((field) => {
        const fieldValue = item[field];
        if (fieldValue == null) return false;

        const stringValue = String(fieldValue);
        const searchableValue = caseSensitive
          ? stringValue
          : stringValue.toLowerCase();

        return searchableValue.includes(searchQuery);
      });
    });
  }, [data, activeSearchTerm, searchFields, caseSensitive]);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
  }, []);

  const hasActiveSearch = activeSearchTerm.trim().length > 0;

  return {
    searchTerm,
    setSearchTerm: updateSearchTerm,
    filteredData,
    clearSearch,
    hasActiveSearch,
  };
}

// 다중 필드 고급 검색을 위한 훅
export function useAdvancedSearch<T extends Record<string, any>>(
  data: T[],
  searchConfig: Record<string, UseSearchOptions>
) {
  const [searches, setSearches] = useState<Record<string, string>>({});

  const filteredData = useMemo(() => {
    let result = data;

    Object.entries(searches).forEach(([key, searchTerm]) => {
      if (searchTerm.trim()) {
        const config = searchConfig[key] || {};
        const { searchFields = [key], caseSensitive = false } = config;

        const searchQuery = caseSensitive
          ? searchTerm.trim()
          : searchTerm.trim().toLowerCase();

        result = result.filter((item) => {
          return searchFields.some((field) => {
            const fieldValue = item[field];
            if (fieldValue == null) return false;

            const stringValue = String(fieldValue);
            const searchableValue = caseSensitive
              ? stringValue
              : stringValue.toLowerCase();

            return searchableValue.includes(searchQuery);
          });
        });
      }
    });

    return result;
  }, [data, searches, searchConfig]);

  const setSearch = useCallback((key: string, value: string) => {
    setSearches((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearSearch = useCallback((key?: string) => {
    if (key) {
      setSearches((prev) => ({
        ...prev,
        [key]: "",
      }));
    } else {
      setSearches({});
    }
  }, []);

  const hasActiveSearch = Object.values(searches).some(
    (term) => term.trim().length > 0
  );

  return {
    searches,
    setSearch,
    filteredData,
    clearSearch,
    hasActiveSearch,
  };
}
