"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface UseTableFiltersOptions<TSortKey extends string> {
  sortKeys: readonly TSortKey[];
  defaultSortOrder?: "asc" | "desc";
  pageParamKey?: string;
}

interface TableFiltersResult<TSortKey extends string> {
  currentSortBy: string;
  currentSortOrder: "asc" | "desc";
  sortLink: (column: TSortKey) => string;
  currentPage: number;
  safePage: number;
  totalPages: number;
  startIndex: number;
}

export function useTableFilters<TSortKey extends string>(
  totalItems: number,
  pageSize: number,
  options: UseTableFiltersOptions<TSortKey>
): TableFiltersResult<TSortKey> {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageParamKey = options.pageParamKey ?? "page";

  const currentSortBy = searchParams.get("sortBy") ?? "";
  const currentSortOrder = searchParams.get("sortOrder") === "desc" ? "desc" : "asc";
  const pageParam = Number(searchParams.get(pageParamKey) ?? "1");
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;

  const sortLink = useMemo(() => {
    return (column: TSortKey) => {
      const params = new URLSearchParams(searchParams.toString());
      const nextOrder =
        currentSortBy === column && currentSortOrder === "asc" ? "desc" : "asc";
      params.set("sortBy", column);
      params.set("sortOrder", nextOrder);
      const queryString = params.toString();
      return queryString ? `${pathname}?${queryString}` : pathname;
    };
  }, [currentSortBy, currentSortOrder, pathname, searchParams]);

  return {
    currentSortBy,
    currentSortOrder,
    sortLink,
    currentPage,
    safePage,
    totalPages,
    startIndex,
  };
}
