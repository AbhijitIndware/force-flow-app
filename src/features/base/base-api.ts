import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuthGuard } from '../utility';
import { apiBaseUrl } from '../apiBaseUrl';
import { IAddDistributorPayload, IAddStorePayload } from '../../types/baseType';

// Base api calling ---
export const baseApi = createApi({
    reducerPath: 'baseApi',
    // baseQuery: baseQueryWithAuthGuard,
    baseQuery: fetchBaseQuery({
        baseUrl: apiBaseUrl,
    }),
    tagTypes: ['Customer'],
    endpoints: (builder) => ({
        addDistributor: builder.mutation<any, IAddDistributorPayload>({
            query: body => ({
                url: '/method/salesforce_management.mobile_app_apis.dms_apis.distributor.create_distributor',
                method: 'POST',
                body,
            }),
        }),
        addStore: builder.mutation<any, IAddStorePayload>({
            query: body => ({
                url: '/method/salesforce_management.mobile_app_apis.dms_apis.store.create_store',
                method: 'POST',
                body,
            }),
        }),
    }),
});
export const { useAddDistributorMutation, useAddStoreMutation } = baseApi;
