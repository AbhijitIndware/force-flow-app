import { Distributor } from "./baseType";

export interface ILogin {
  data: {
    usr: string;
    pwd: string;
  };
}
export type RLogin = {
  message: {
    success: boolean;
    message: string;
    user: {
      email: string;
      username: string;
      full_name: string;
      roles: string[];
      sid: string;
    };
    api_credentials: {
      api_key: string;
      api_secret: string;
    };
    distributor?: Distributor | null;
    employee: Employee;
  };
};

export interface RCheckSession {
  message: {
    valid: boolean;
    auth_type: string;
    user: string;
    full_name: string;
    sid: string;
    session_expiry: string;
    remaining_seconds: number;
    remaining_time: string;
  };
}

export interface Employee {
  id: string;
  company_emp_id: string;
  designation: string;
  company_email: string;
  personal_email: string | null;
  department: string | null;
  branch: string | null;
  image: string;
  mobile_no: string;
  image_base64: string;
  full_name?: string;
  reporting_to?: string;
  birth_date?: string;
  date_of_joining?: string;
}

export interface EmployeeProfileResponse {
  message: {
    status: 'success' | 'error';

    employee: Employee;
  };
}
