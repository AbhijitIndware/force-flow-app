import {ApiResponse} from './Navigation';

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
  };
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
    end_time: string; // Format: "HH:mm:ss"
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

type StoreEntry = {
  store: string;
};

export type IAddPjpPayload = {
  data: {
    date: string;
    employee: string;
    stores: StoreEntry[];
  };
};

export type RPjpInitialize = {
  message: {
    success: boolean;
    data: {
      employee: {
        employee_id: string; // Changed to string for general use
        employee_name: string;
        store: string;
        check_out_time: string | null; // Assuming it could be a string date/time or null
      };
      stores: string[]; // Changed to array of strings for general use
      store_category_validation: {
        valid: boolean; // Assuming true/false
        message: string;
      };
      date: string;
    };
  };
  _server_messages: string;
};

export type ILocationVerify = {
  store: string;
  current_location: string;
  validate_location: boolean;
};
export type IAddCheckIn = {
  store: string;
  image: {
    mime: string;
    data: string;
  };
  current_location: string;
};
export type IMarkActivity = {
  store: string;
  activity_type: {activity_type: string}[];
};

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
