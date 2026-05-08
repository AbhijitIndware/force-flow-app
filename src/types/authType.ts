import { Distributor } from "./baseType";

export interface ILogin {
  data: {
    usr: string;
    pwd: string;
  };
}
export interface AuthResponse {
  session_expired: number;
  cookies: Cookies;
  message: Message;
  home_page: string;
  full_name: string;
  type: string;
}

export interface Cookies {
  sid: CookieData;
  api_key: CookieData;
  api_secret: CookieData;
}

export interface CookieData {
  value: string;
  httponly: boolean;
  secure: number;
  path: string;
  samesite: string;
}

export interface Message {
  success: boolean;
  message: string;
  user: User;
  api_credentials: ApiCredentials;
  session: Session;
  employee: Employee;
  distributor?: Distributor | null;
}

export interface User {
  email: string;
  username: string;
  full_name: string;
  roles: string[];
  sid: string;
}

export interface ApiCredentials {
  api_key: string;
  api_secret: string;
}

export interface Session {
  sid: string;
  expires_in_seconds: number;
  expires_in: string;
}

export interface Employee {
  id: string;
  user_id: string;
  full_name: string;
  company_emp_id: string;
  status: string;
  is_active: number;
  designation: string;
  zone: string;
  company_email: string;
  mobile_no: string;
  gender: string;
  birth_date: string;
  date_of_joining: string;
  reporting_to: string;
  image: string | null;
  image_base64: string | null;
}
export type RLogin = {
  message: Message;
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

// export interface Employee {
//   id: string;
//   company_emp_id: string;
//   designation: string;
//   company_email: string;
//   personal_email: string | null;
//   department: string | null;
//   branch: string | null;
//   image: string;
//   mobile_no: string;
//   image_base64: string;
//   full_name?: string;
//   reporting_to?: string;
//   birth_date?: string;
//   date_of_joining?: string;
// }

export interface EmployeeProfileResponse {
  message: {
    status: 'success' | 'error';

    employee: Employee;
  };
}
