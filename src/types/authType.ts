import {ApiResponse} from './Navigation';

export interface ILogin {
  email: string;
  password: string;
}
export type RLogin = Pick<ApiResponse, 'message' | 'statusCode'> & {
  data: null;
};
