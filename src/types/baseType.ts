import { ApiResponse } from "./Navigation";


export interface IAddDistributorPayload {
    data: {
        distributor_name: string;
        distributor_sap_code: string;
        distributor_group: string;
        distributor_code: string;
        mobile: string;
        email: string;
        employee: string;
        zone: string;
        state: string;
        city: string;
        reports_to: string;
        designation: string;
    }
}


export interface IAddStorePayload {
  data: {
    store_name: string;
    store_type: string;
    store_category: string;
    zone: string;
    state: string;
    map_location: string;
    start_time: string; // Format: "HH:mm:ss"
    end_time: string;   // Format: "HH:mm:ss"
    pan_no: string;
    gst_no: string;
    city: string;
    pin_code: string;
    distributor: string;
    address: string;
    weekly_off: string;
    created_by_employee: string;
    created_by_employee_name: string;
    created_by_employee_designation: string;
  };
}


export interface IAddDistributorResponse extends ApiResponse {
    message: {
        status: string;
        data: {
            distributor_name: string;
            distributor_sap_code: string;
            distributor_group: string;
            distributor_code: string;
            mobile: string;
            email: string;
            employee: string;
            zone: string;
            state: string;
            city: string;
            reports_to: string;
            designation: string;
        };
    };
}
