import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuthGuard } from '../utility';
import { createSlice } from '@reduxjs/toolkit';
import { DistributorInfo, IApproveAndCreateDDNRequest, ILoginRequest, RApproveAndCreateDDN, RDashboardCounts, RDeliveryNoteList, RLoginResponse, RPendingCounts, RPurchaseOrderList } from '../../types/distributorType';



// ---------- API ----------

export const distributorBaseApi = createApi({
    reducerPath: 'distributorBaseApi',
    baseQuery: baseQueryWithAuthGuard,
    tagTypes: ['Distributor'],
    endpoints: builder => ({

        // 2. Dashboard Counts
        getDashboardCounts: builder.query<
            RDashboardCounts,
            { from_date?: string; to_date?: string }
        >({
            query: ({ from_date, to_date } = {}) => ({
                url: '/method/salesforce_management.mobile_app_apis.order_apis.order_count.get_orders_count',
                method: 'GET',
                params: {
                    ...(from_date && { from_date }),
                    ...(to_date && { to_date }),
                },
            }),
            providesTags: ['Distributor'],
        }),

        // 3. Purchase Order List
        getPurchaseOrdersList: builder.query<
            RPurchaseOrderList,
            {
                status?: string;
                page: number;
                page_size: number;
                search?: string;
                from_date?: string;
                to_date?: string;
            }
        >({
            query: ({ status, page, page_size, search, from_date, to_date }) => ({
                url: '/method/salesforce_management.mobile_app_apis.order_apis.purchase_order_mobile_api.get_purchase_orders_list',
                method: 'GET',
                params: {
                    status,
                    page,
                    page_size,
                    search,
                    from_date,
                    to_date,
                },
            }),
            providesTags: ['Distributor'],
        }),

        // 4. Delivery Note List
        getDeliveryNotesList: builder.query<
            RDeliveryNoteList,
            {
                status?: string;
                page: number;
                page_size: number;
                search?: string;
                from_date?: string;
                to_date?: string;
            }
        >({
            query: ({ status, page, page_size, search, from_date, to_date }) => ({
                url: '/method/salesforce_management.mobile_app_apis.order_apis.delivery_note_mobile_api.get_delivery_notes_list',
                method: 'GET',
                params: {
                    status,
                    page,
                    page_size,
                    search,
                    from_date,
                    to_date,
                },
            }),
            providesTags: ['Distributor'],
        }),

        // 5. Approve & Create Delivery Note
        approveAndCreateDDN: builder.mutation<
            RApproveAndCreateDDN,
            IApproveAndCreateDDNRequest
        >({
            query: body => ({
                url: '/method/salesforce_management.mobile_app_apis.order_apis.purchase_order_mobile_api.approve_and_create_ddn',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Distributor'],
        }),

        // Pending Counts
        getPendingCounts: builder.query<RPendingCounts,
            { from_date?: string; to_date?: string }>({
                query: ({ from_date, to_date } = {}) => ({
                    url: '/method/salesforce_management.mobile_app_apis.order_apis.order_count.get_pending_counts',
                    method: 'GET', params: {
                        ...(from_date && { from_date }),
                        ...(to_date && { to_date }),
                    },
                }),
                providesTags: ['Distributor'],
            }),

    }),
});

export const {
    useGetDashboardCountsQuery,
    useGetPurchaseOrdersListQuery,
    useGetDeliveryNotesListQuery,
    useApproveAndCreateDDNMutation,
    useGetPendingCountsQuery
} = distributorBaseApi;

// ---------- Slice ----------

interface DistributorState {
    loading: boolean;
    error: boolean;
    status: 'idle' | 'pending' | 'fulfilled' | 'rejected';
    distributorInfo: DistributorInfo | null;
}

const initialState: DistributorState = {
    loading: false,
    error: false,
    status: 'idle',
    distributorInfo: null,
};

export const distributorSlice = createSlice({
    name: 'distributorSlice',
    initialState,
    reducers: {},
    extraReducers: builder => { },
});

export const { } = distributorSlice.actions;
export default distributorSlice.reducer;