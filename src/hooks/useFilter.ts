import { useState, useMemo, useCallback } from "react";

type FilterValue = string | number | boolean | string[] | number[];

interface FilterConfig<T> {
  key: keyof T;
  type: "equals" | "includes" | "range" | "custom";
  customFilter?: (item: T, value: FilterValue) => boolean;
}

interface UseFilterReturn<T> {
  filters: Record<string, FilterValue>;
  setFilter: (key: string, value: FilterValue) => void;
  removeFilter: (key: string) => void;
  clearFilters: () => void;
  filteredData: T[];
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

export function useFilter<T extends Record<string, any>>(
  data: T[],
  filterConfigs: Record<string, FilterConfig<T>>
): UseFilterReturn<T> {
  const [filters, setFilters] = useState<Record<string, FilterValue>>({});

  const filteredData = useMemo(() => {
    if (Object.keys(filters).length === 0) {
      return data;
    }

    return data.filter((item) => {
      return Object.entries(filters).every(([filterKey, filterValue]) => {
        // 빈 값은 필터링하지 않음
        if (
          filterValue === "" ||
          filterValue === null ||
          filterValue === undefined
        ) {
          return true;
        }

        const config = filterConfigs[filterKey];
        if (!config) {
          return true;
        }

        const itemValue = item[config.key];

        switch (config.type) {
          case "equals":
            return itemValue === filterValue;

          case "includes":
            if (Array.isArray(filterValue)) {
              return filterValue.includes(itemValue);
            }
            if (
              typeof itemValue === "string" &&
              typeof filterValue === "string"
            ) {
              return itemValue
                .toLowerCase()
                .includes(filterValue.toLowerCase());
            }
            return itemValue === filterValue;

          case "range":
            if (Array.isArray(filterValue) && filterValue.length === 2) {
              const [min, max] = filterValue;
              return itemValue >= min && itemValue <= max;
            }
            return true;

          case "custom":
            if (config.customFilter) {
              return config.customFilter(item, filterValue);
            }
            return true;

          default:
            return true;
        }
      });
    });
  }, [data, filters, filterConfigs]);

  const setFilter = useCallback((key: string, value: FilterValue) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const removeFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== null && value !== undefined
  );

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "" && value !== null && value !== undefined
  ).length;

  return {
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    filteredData,
    hasActiveFilters,
    activeFilterCount,
  };
}

// 미리 정의된 필터 타입들
export const createStatusFilter = <T extends { status: string }>(
  statuses: string[]
): FilterConfig<T> => ({
  key: "status",
  type: "includes",
});

export const createCategoryFilter = <T extends { category: string }>(
  categories: string[]
): FilterConfig<T> => ({
  key: "category",
  type: "includes",
});

export const createDateRangeFilter = <
  T extends { created_at: string }
>(): FilterConfig<T> => ({
  key: "created_at",
  type: "custom",
  customFilter: (item, value) => {
    if (!Array.isArray(value) || value.length !== 2) return true;

    const [startDate, endDate] = value as string[];
    const itemDate = new Date(item.created_at);
    const start = new Date(startDate);
    const end = new Date(endDate);

    return itemDate >= start && itemDate <= end;
  },
});

// 복합 필터 및 검색을 위한 훅
export function useFilterAndSearch<T extends Record<string, any>>(
  data: T[],
  filterConfigs: Record<string, FilterConfig<T>>,
  searchFields: string[] = ["name", "title"]
) {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
  } = useFilter(data, filterConfigs);

  const filteredAndSearchedData = useMemo(() => {
    let result = data;

    // 먼저 필터 적용
    if (hasActiveFilters) {
      result = result.filter((item) => {
        return Object.entries(filters).every(([filterKey, filterValue]) => {
          if (
            filterValue === "" ||
            filterValue === null ||
            filterValue === undefined
          ) {
            return true;
          }

          const config = filterConfigs[filterKey];
          if (!config) return true;

          const itemValue = item[config.key];

          switch (config.type) {
            case "equals":
              return itemValue === filterValue;
            case "includes":
              if (Array.isArray(filterValue)) {
                return filterValue.includes(itemValue);
              }
              return itemValue
                ?.toString()
                .toLowerCase()
                .includes(filterValue.toString().toLowerCase());
            case "custom":
              return config.customFilter
                ? config.customFilter(item, filterValue)
                : true;
            default:
              return true;
          }
        });
      });
    }

    // 그 다음 검색 적용
    if (searchTerm.trim()) {
      const searchQuery = searchTerm.trim().toLowerCase();
      result = result.filter((item) => {
        return searchFields.some((field) => {
          const fieldValue = item[field];
          if (fieldValue == null) return false;
          return fieldValue.toString().toLowerCase().includes(searchQuery);
        });
      });
    }

    return result;
  }, [
    data,
    filters,
    searchTerm,
    filterConfigs,
    searchFields,
    hasActiveFilters,
  ]);

  const clearAll = useCallback(() => {
    clearFilters();
    setSearchTerm("");
  }, [clearFilters]);

  const hasActiveSearchOrFilter =
    hasActiveFilters || searchTerm.trim().length > 0;

  return {
    // 검색 관련
    searchTerm,
    setSearchTerm,

    // 필터 관련
    filters,
    setFilter,
    removeFilter,
    clearFilters,

    // 결과 및 상태
    filteredData: filteredAndSearchedData,
    hasActiveFilters,
    activeFilterCount,
    hasActiveSearchOrFilter,

    // 초기화
    clearAll,
  };
}
