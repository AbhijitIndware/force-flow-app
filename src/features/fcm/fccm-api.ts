import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuthGuard } from '../utility';

interface FcmTokenPayload {
  fcm_token: string;
  device_os: 'Android' | 'iOS';
}

interface FcmTokenResponse {
  message: {
    status: string;
    message: string;
  };
}

export interface NotificationItem {
  name: string;
  title: string;
  body: string;
  payload: {
    type: string;
    status?: string;
    claim_id?: string;
    request_id?: string;
    leave_id?: string;
  };
  is_read: number;
  creation: string;
}

interface GetNotificationListResponse {
  message: {
    status: string;
    data: NotificationItem[];
    pagination: {
      total: number;
      page: number;
      page_size: number;
      total_pages: number;
      has_more: boolean;
    };
  };
}

interface GetNotificationListParams {
  page?: number;
  page_size?: number;
}

interface MarkNotificationReadPayload {
  notification_id: string;
}

interface MarkNotificationReadResponse {
  message: {
    status: string;
    message: string;
  };
}

interface GetUnreadCountResponse {
  message: {
    status: string;
    unread_count: number;
  };
}

export const fcmApi = createApi({
  reducerPath: 'fcmApi',
  baseQuery: baseQueryWithAuthGuard,
  tagTypes: ['FCM', 'Notifications'],
  endpoints: builder => ({
    registerFcmToken: builder.mutation<FcmTokenResponse, FcmTokenPayload>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.push_notifications_api.register_fcm_token',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FCM'],
    }),
    getNotificationList: builder.query<GetNotificationListResponse, GetNotificationListParams>({
      query: params => ({
        url: '/method/salesforce_management.mobile_app_apis.push_notifications_api.get_notification_list',
        method: 'GET',
        params,
      }),
      providesTags: ['Notifications'],
    }),
    markNotificationRead: builder.mutation<MarkNotificationReadResponse, MarkNotificationReadPayload>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.push_notifications_api.mark_notification_read',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notifications'],
    }),
    getUnreadNotificationCount: builder.query<GetUnreadCountResponse, void>({
      query: () => ({
        url: '/method/salesforce_management.mobile_app_apis.push_notifications_api.get_unread_notification_count',
        method: 'GET',
      }),
      providesTags: ['Notifications'],
    }),
  }),
});

export const {
  useRegisterFcmTokenMutation,
  useGetNotificationListQuery,
  useMarkNotificationReadMutation,
  useGetUnreadNotificationCountQuery,
} = fcmApi;
