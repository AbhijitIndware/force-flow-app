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

export const fcmApi = createApi({
  reducerPath: 'fcmApi',
  baseQuery: baseQueryWithAuthGuard,
  tagTypes: ['FCM'],
  endpoints: builder => ({
    registerFcmToken: builder.mutation<FcmTokenResponse, FcmTokenPayload>({
      query: body => ({
        url: '/method/salesforce_management.mobile_app_apis.push_notifications_api.register_fcm_token',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FCM'],
    }),
  }),
});

export const {
  useRegisterFcmTokenMutation,
} = fcmApi;
