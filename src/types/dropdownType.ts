import {ApiResponse, PaginationInfo} from './Navigation';

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

export type StoreType= {
      name: string;
      city: string;
      state: string;
      store_name: string;
    }
export type RStore = {
  message: {
    status: string;
    data:StoreType[];
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

//Sales Order
export interface SoStore {
  warehouse_id: string;
  warehouse_name: string;
  store_id: string;
  store_name: string;
  store_category: string;
  distributor_id: string;
  distributor_name: string;
}

export interface SoItem {
  item_code: string;
  item_name: string;
  item_group: string;
  stock_uom: string;
  description: string;
  image: string | null;
  disabled: number;
  selling_rate: number;
  buying_rate: number;
  available_qty: number;
}
export type RAllMasterForSO = {
  message: {
    success: boolean;
    data: {
      employee: {
        name: string;
        employee_name: string;
      };
      stores: SoStore[];
      items: SoItem[];
      distributors: any[]; // empty array, adjust if you know structure
      terms_templates: any[]; // empty array, adjust if you know structure
      current_date: string;
    };
    pagination: {
      stores: PaginationInfo;
      items: PaginationInfo;
      distributors: Record<string, unknown>; // empty object
      terms_templates: PaginationInfo;
    };
  };
};
