import { useMemo } from "react";
import { useGetArticlesQuery } from "../api/articlesApi";

export const useGetArticles = (page: number = 1, limit: number = 10) => {
  const { data, isLoading, isFetching, isError } = useGetArticlesQuery({ page, limit });

  return useMemo(() => ({ data, isLoading, isFetching, isError }), [data, isLoading, isFetching, isError]);
};
