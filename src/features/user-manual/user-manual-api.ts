import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {apiBaseUrl} from '../apiBaseUrl';
import {
  UserManualCategoriesResponse,
  UserManualParams,
  UserManualResponse,
  UserManualVideoResponse,
} from '../../types/userManualType';

// Guest-safe base query: the user manual endpoints are public, so no auth
// headers are attached and a 401 never triggers the logout flow.
const userManualBaseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  credentials: 'omit',
});

export const userManualApi = createApi({
  reducerPath: 'userManualApi',
  baseQuery: userManualBaseQuery,
  tagTypes: ['UserManual'],
  endpoints: builder => ({
    // Full manual grouped by category. All params optional.
    // url is rebuilt per request host, so only cache the video_id, never url.
    getUserManual: builder.query<UserManualResponse, UserManualParams>({
      query: params => ({
        url: '/method/salesforce_management.mobile_app_apis.user_manual_api.get_user_manual',
        method: 'GET',
        params: {
          ...(params.category ? {category: params.category} : {}),
          ...(params.language ? {language: params.language} : {}),
          ...(params.search ? {search: params.search} : {}),
        },
      }),
      providesTags: ['UserManual'],
    }),

    // Category chips with a video count each.
    getManualCategories: builder.query<UserManualCategoriesResponse, void>({
      query: () => ({
        url: '/method/salesforce_management.mobile_app_apis.user_manual_api.get_manual_categories',
        method: 'GET',
      }),
      providesTags: ['UserManual'],
    }),

    // Single video by id (deep links / "watch next").
    getManualVideo: builder.query<UserManualVideoResponse, {video_id: string}>({
      query: ({video_id}) => ({
        url: '/method/salesforce_management.mobile_app_apis.user_manual_api.get_manual_video',
        method: 'GET',
        params: {video_id},
      }),
      providesTags: ['UserManual'],
    }),
  }),
});

export const {
  useGetUserManualQuery,
  useLazyGetUserManualQuery,
  useGetManualCategoriesQuery,
  useGetManualVideoQuery,
  useLazyGetManualVideoQuery,
} = userManualApi;
