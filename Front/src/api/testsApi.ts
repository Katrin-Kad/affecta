import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type Option = {
    optionText: string;
    points: number;
  };
  
  export type Question = {
    questionText: string;
    options: Option[];
  };
  
  export type Result = {
    minPoints: number;
    maxPoints: number;
    description: string;
  };
  
  export type Test = {
    _id: string;
    title: string;
    shortDescription: string;
    isArchived: boolean;
    tags: string[];
    image: string;
    questions: Question[];
    results: Result[];
    createdAt?: string;
    updatedAt?: string;
  };  

export type TestsResponse = Test[];

export const testsApi = createApi({
    reducerPath: 'testsApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8080/api' }),
    endpoints: (builder) => ({
        getTests: builder.query<TestsResponse, { page?: number; limit?: number }>({
            query: ( params ) => ({
                url: 'tests',
                params,
            }),
        }),
    }),
});

export const { useGetTestsQuery } = testsApi;
