import { useMemo } from "react";
import { useGetTestsQuery } from "../api/testsApi";

export const useGetTests = (page: number = 1, limit: number = 10) => {
  const { data, isLoading, isFetching, isError } = useGetTestsQuery({ page, limit });

  return useMemo(() => ({ data, isLoading, isFetching, isError }), [data, isLoading, isFetching, isError]);
};
