import {ApiResponse} from './Navigation';

export type RResponse = {
  message: {
    status: string;
    data: {
      name: string;
    }[];
  };
};
export type RDistributor = {
  message: {
    status: string;
    data: {
      name: string;
      distributor_name: string;
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
export type RDailyStore = {
  message: {
    status: string;
    message: string;
    stores: {
      store: string;
      store_name: string;
      store_category: string;
    }[];
    pjp_daily_store_doc: string;
  };
};

export type IDailyStore = {
  date: string;
  user: string;
};

export type RActivityPjp = {
  message: {
    status: string;
    data: {
      name: string;
    }[];
  };
};
