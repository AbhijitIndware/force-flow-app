import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {baseQueryWithAuthGuard} from '../utility';
import {apiBaseUrl} from '../apiBaseUrl';
import {
  IAddCheckIn,
  IAddDistributorPayload,
  IAddPjpPayload,
  IAddStorePayload,
  ILocationVerify,
  IMarkActivity,
  RPjpInitialize,
} from '../../types/baseType';

// Base api calling ---
export const baseApi = createApi({
  reducerPath: 'baseApi',
  // baseQuery: baseQueryWithAuthGuard,
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    credentials: 'include',
  }),
  tagTypes: ['Customer'],
  endpoints: builder => ({
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
    addDailyPjp: builder.mutation<any, IAddPjpPayload>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.pjp.create_pjp_daily_stores',
        method: 'POST',
        body,
      }),
    }),

    //Daily PJP Activity Check-in ---
    pjpInitialize: builder.mutation<RPjpInitialize, void>({
      query: () => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.mark_pjp_mob.mobile_initialize',
        method: 'POST',
      }),
    }),
    locationVerification: builder.mutation<any, ILocationVerify>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.mark_pjp_mob.mobile_store_selection',
        method: 'POST',
        body,
      }),
    }),
    addCheckIn: builder.mutation<any, IAddCheckIn>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.mark_pjp_mob.mobile_check_in',
        method: 'POST',
        body,
      }),
    }),
    markActivity: builder.mutation<any, IMarkActivity>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.mark_pjp_mob.mobile_mark_activity',
        method: 'POST',
        body,
      }),
    }),
    checkOut: builder.mutation<any, void>({
      query: () => ({
        url: '/method/salesforce_management.mobile_app_apis.pjp_apis.mark_pjp_mob.mobile_check_out',
        method: 'POST',
      }),
    }),
  }),
});
export const {
  useAddDistributorMutation,
  useAddStoreMutation,
  useAddDailyPjpMutation,
  //Daily PJP Activity Check-in ---
  usePjpInitializeMutation,
  useLocationVerificationMutation,
  useAddCheckInMutation,
  useMarkActivityMutation,
  useCheckOutMutation,
} = baseApi;
