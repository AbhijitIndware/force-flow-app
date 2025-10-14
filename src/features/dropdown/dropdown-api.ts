import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {apiBaseUrl} from '../apiBaseUrl';
import {
  IDailyStore,
  RActivityPjp,
  RAllMasterForSO,
  RBeat,
  RCity,
  RDailyStore,
  RDistributor,
  REmployee,
  RItems,
  RResponse,
  RState,
  RStore,
} from '../../types/dropdownType';
import {LocationResponse} from '../../types/baseType';

//Dropdown api calling ---
export const dropdownApi = createApi({
  reducerPath: 'dropdownApi',
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
  }),
  tagTypes: [''],
  endpoints: builder => ({
    getState: builder.query<RState, {zone?: string}>({
      query: ({zone}) => ({
        url: '/method/salesforce_management.mobile_app_apis.master_data.master_data_pa.get_state',
        method: 'GET',
        params: {
          search: zone,
        },
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
    getEmployee: builder.query<REmployee, {name?: string}>({
      query: ({name}) => ({
        url: '/method/salesforce_management.mobile_app_apis.master_data.master_data_pa.get_employee',
        method: 'GET',
        params: {
          search: name,
        },
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
    getDistributor: builder.query<RDistributor, void>({
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
    getItems: builder.query<RItems, {search?: string}>({
      query: ({search}) => ({
        url: '/method/salesforce_management.mobile_app_apis.master_data.master_data_pa.get_items_with_prices_advanced',
        method: 'GET',
        params: {
          search: search,
        },
      }),
    }),

    getBeat: builder.query<RBeat, void>({
      query: () => ({
        url: '/method/salesforce_management.mobile_app_apis.master_data.master_data_pa.get_beat',
        method: 'GET',
      }),
    }),
    getStore: builder.query<RStore, {search: string}>({
      query: ({search}) => ({
        url: '/method/salesforce_management.mobile_app_apis.master_data.master_data_pa.get_stores_safe',
        method: 'GET',
        params: {
          search: search,
        },
      }),
    }),
    getDailyStore: builder.query<RDailyStore, IDailyStore>({
      query: ({date, user}) => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.get_pjp_store.get_pjp_stores',
        method: 'GET',
        params: {
          date,
          user,
        },
      }),
    }),
    getActivityForPjp: builder.query<RActivityPjp, void>({
      query: () => ({
        url: '/method/salesforce_management.mobile_app_apis.master_data.master_data_pa.get_pjp_activity_types',
        method: 'GET',
      }),
    }),

    //Sales Order
    getAllDropdownForSalesOrder: builder.query<RAllMasterForSO, void>({
      query: () => ({
        url: '/method/salesforce_management.mobile_app_apis.order_apis.sales_order_mobile_api.get_sales_order_master_data',
        method: 'GET',
      }),
    }),

    //Location by lat long
    getLocationByLatLong: builder.query<
      LocationResponse,
      {latitude: string; longitude: string}
    >({
      query: ({latitude, longitude}) => ({
        url: '/method/salesforce_management.mobile_app_apis.location.location.set_current_location',
        method: 'GET',
        params: {
          latitude: latitude,
          longitude: longitude,
        },
      }),
    }),
  }),
});
export const {
  useGetStateQuery,
  useGetCityQuery,
  useGetDesignationQuery,
  useGetDistributorGroupQuery,
  useGetDistributorQuery,
  useGetEmployeeQuery,
  useGetZoneQuery,
  useGetItemGroupQuery,
  useGetStoreCategoryQuery,
  useGetStoreTypeQuery,
  useGetBeatQuery,
  useGetStoreQuery,
  useGetDailyStoreQuery,
  useLazyGetDailyStoreQuery,
  useGetActivityForPjpQuery,
  useGetItemsQuery,

  //Sales Order
  useGetAllDropdownForSalesOrderQuery,
  useGetLocationByLatLongQuery,
} = dropdownApi;
