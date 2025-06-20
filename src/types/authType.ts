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
    employee: {
      id: string;
      designation: string;
      company_email: string;
      department: string;
      branch: string;
      personal_email: string;
    };
  };
};
