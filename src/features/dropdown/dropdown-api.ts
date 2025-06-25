import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { apiBaseUrl } from '../apiBaseUrl';
import { RCity, REmployee, RResponse, RState } from '../../types/dropdownType';

//Dropdown api calling ---
export const dropdownApi = createApi({
    reducerPath: 'dropdownApi',
    baseQuery: fetchBaseQuery({
        baseUrl: apiBaseUrl,
    }),
    tagTypes: [''],
    endpoints: (builder) => ({
        getState: builder.query<RState, void>({
            query: () => ({
                url: '/method/salesforce_management.mobile_app_apis.master_data.master_data_pa.get_state',
                method: 'GET',
            }),
        }),
        getZone: builder.query<RResponse, void>({
            query: () => ({
                url: '/method/salesforce_management.mobile_app_apis.master_data.master_data_pa.get_zone',
                method: 'GET',
            }),
        }),
        getCity: builder.query<RCity, void>({
            query: () => ({
                url: '/method/salesforce_management.mobile_app_apis.master_data.master_data_pa.get_city',
                method: 'GET',
            }),
        }),
        getEmployee: builder.query<REmployee, void>({
            query: () => ({
                url: '/method/salesforce_management.mobile_app_apis.master_data.master_data_pa.get_employee',
                method: 'GET',
            }),
        }),
        getDesignation: builder.query<RResponse, void>({
            query: () => ({
                url: '/method/salesforce_management.mobile_app_apis.master_data.master_data_pa.get_designation',
                method: 'GET',
            }),
        }),
        getDistributorGroup: builder.query<RResponse, void>({
            query: () => ({
                url: '/method/salesforce_management.mobile_app_apis.master_data.master_data_pa.get_distributor_group',
                method: 'GET',
            }),
        }),
        getDistributor: builder.query<RResponse, void>({
            query: () => ({
                url: '/method/salesforce_management.mobile_app_apis.master_data.master_data_pa.get_distributor',
                method: 'GET',
            }),
        }),
        getStoreType: builder.query<RResponse, void>({
            query: () => ({
                url: '/method/salesforce_management.mobile_app_apis.master_data.master_data_pa.get_store_type',
                method: 'GET',
            }),
        }),
        getStoreCategory: builder.query<RResponse, void>({
            query: () => ({
                url: '/method/salesforce_management.mobile_app_apis.master_data.master_data_pa.get_store_category',
                method: 'GET',
            }),
        }),
        getItemGroup: builder.query<RResponse, void>({
            query: () => ({
                url: '/method/salesforce_management.mobile_app_apis.dms_apis.store.create_store',
                method: 'GET',
            }),
        }),
    }),
});
export const { useGetStateQuery, useGetCityQuery, useGetDesignationQuery, useGetDistributorGroupQuery, useGetDistributorQuery, useGetEmployeeQuery, useGetZoneQuery ,useGetItemGroupQuery,useGetStoreCategoryQuery,useGetStoreTypeQuery} = dropdownApi;
