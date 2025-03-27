import { useMemo } from "react";
import { useGetTasksQuery } from "../api/articlesApi";

export const useGetTasks = (page: number = 1, limit: number = 10) => {
  const { data, isLoading, isFetching, isError } = useGetTasksQuery({ page, limit });

  return useMemo(() => ({ data, isLoading, isFetching, isError }), [data, isLoading, isFetching, isError]);
};
