import { ApiResponse } from "./Navigation";

export type RState = {
    message: {
        status: string;
        data: {
            name: string;
        }[];
    };
};

export type RCity = {
    message: {
        status: string;
        data: {
            name: string;
            state: string;
        }[];
    };
};

export type REmployee = {
    message: {
        status: string;
        data: {
            name: string;
            employee_name: string;
            designation: string;
        }[];
    };
};