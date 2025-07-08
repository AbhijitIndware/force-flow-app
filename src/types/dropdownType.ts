import { ApiResponse } from "./Navigation";

export type RResponse = {
    message: {
        status: string;
        data: {
            name: string;
        }[];
    };
};
export type RState = {
    message: {
        status: string;
        data: {
            name: string;
            zone: string;
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

export type RBeat = {
    message: {
        status: string;
        data: {
            name: string;
            city: string;
            state: string;
            zone: string;
        }[];
    };
};


export type RStore = {
    message: {
        status: string;
        data: {
            name: string;
            city: string;
            state: string;
            store_name: string;
        }[];
    };
};