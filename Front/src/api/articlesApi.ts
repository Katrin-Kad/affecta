import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type Article = {
    _id: string;
    title: string;
    shortDescription: string;
    content: string;
    tags: string[];
    isExercise: boolean;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
    author: string;
    image: string;
};

export type ArticlesResponse = Article[];

export const articlesApi = createApi({
    reducerPath: 'articlesApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8080/api' }),
    endpoints: (builder) => ({
        getArticles: builder.query<ArticlesResponse, { page?: number; limit?: number }>({
            query: ( params ) => ({
                url: 'articles',
                params,
            }),
        }),
        getTasks: builder.query<ArticlesResponse, { page?: number; limit?: number }>({
            query: ( params ) => ({
                url: 'articles/exercise',
                params,
            }),
        }),
    }),
});

export const { useGetArticlesQuery, useGetTasksQuery } = articlesApi;
