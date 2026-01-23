import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
  usr: Yup.string().required('UserId is required'),
  pwd: Yup.string().required('Password is required'),
});

export const distributorSchema = Yup.object().shape({
  distributor_name: Yup.string().required('Distributor name is required'),
  distributor_sap_code: Yup.string().required('SAP code is required'),
  distributor_group: Yup.string().required('Please select a distributor group'),
  distributor_code: Yup.string().required('Distributor code is required'),
  mobile: Yup.string().required('Mobile number is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  employee: Yup.string().required('Please select an employee'),
  zone: Yup.string().required('Please select a zone'),
  state: Yup.string().required('Please select a state'),
  city: Yup.string().required('Please select a city'),
  reports_to: Yup.string().required('Please select a reporting manager'),
  designation: Yup.string().required('Please select a designation'),
});

export const storeSchema = Yup.object().shape({
  store_name: Yup.string().required('Store name is required'),
  store_type: Yup.string().required('Store type is required'),
  store_category: Yup.string().required('Store category is required'),
  zone: Yup.string().required('Zone is required'),
  state: Yup.string().required('State is required'),
  map_location: Yup.string().required('Map location is required'),
  // start_time: Yup.string().required('Start time is required'),
  // end_time: Yup.string().required('End time is required'),
  // pan_no: Yup.string().required('PAN No. is required'),
  // gst_no: Yup.string().required('GST No. is required'),
  city: Yup.string().required('City is required'),
  pin_code: Yup.string().required('PIN code is required'),
  distributor: Yup.string().required('Distributor is required'),
  address: Yup.string().required('Address is required'),
  // weekly_off: Yup.string().required('Weekly off is required'),

  created_by_employee: Yup.string().nullable(),
  created_by_employee_name: Yup.string().nullable(),
  created_by_employee_designation: Yup.string().nullable(),
});

export const dailyPjpSchema = Yup.object().shape({
  date: Yup.string().required('Date is required'),
  employee: Yup.string().required('Employee is required'),
  stores: Yup.array().of(
    Yup.object().shape({
      store: Yup.string().required('Store is required'),
    }),
  ),
});

export const checkInSchema = Yup.object().shape({
  // date: Yup.string().required('Date is required'),
  // employee: Yup.string().required('Employee is required'),
  // store: Yup.string().required('Store is required'),
  // image: Yup.string().required('Live image is required'),
});

export const markActivitySchema = Yup.object().shape({
  store: Yup.string().required('Store is required'),
  activity_type: Yup.array().of(
    Yup.object().shape({
      activity_type: Yup.string().required('Activity type is required'),
    }),
  ),
});

//Sales Order
export const addSalesOrderSchema = Yup.object().shape({
  transaction_date: Yup.string().required('Transaction date is required'),
  delivery_date: Yup.string().required('Delivery date is required'),
  custom_warehouse: Yup.string().required('Warehouse is required'),
  items: Yup.array()
    .of(
      Yup.object().shape({
        item_code: Yup.string().required('Item code is required'),
        qty: Yup.number()
          .typeError('Quantity must be a number')
          .positive('Quantity must be greater than 0')
          .required('Quantity is required'),
        rate: Yup.number()
          .typeError('Rate must be a number')
          .positive('Rate must be greater than 0')
          .required('Rate is required'),
        delivery_date: Yup.string().required('Item delivery date is required'),
      }),
    )
    .min(1, 'At least one item is required'),
  terms: Yup.string().nullable(),
  submit_order: Yup.boolean().required(),
});

export const expenseItemSchema = Yup.object().shape({
  date: Yup.string().required('Date is required'),
  claim_type: Yup.string().required('Claim type is required'),
  amount: Yup.number()
    .typeError('Amount must be a number')
    .required('Amount is required'),
});

//Promoter
export const PromoterCheckinSchema = Yup.object().shape({
  store: Yup.string().required('Store is required'),
  image: Yup.object().shape({
    mime: Yup.string().nullable(),
    data: Yup.string().nullable(),
  }),
  latitude: Yup.number()
    .required('Latitude is required')
    .typeError('Latitude must be a number'),
  longitude: Yup.number()
    .required('Longitude is required')
    .typeError('Longitude must be a number'),
  address: Yup.string().required('Address is required'),
});

export const PromoterCheckOutSchema = Yup.object().shape({
  // store: Yup.string().required('Store is required'),
  image: Yup.object().shape({
    mime: Yup.string().nullable(),
    data: Yup.string().nullable(),
  }),
  latitude: Yup.number()
    .required('Latitude is required')
    .typeError('Latitude must be a number'),
  longitude: Yup.number()
    .required('Longitude is required')
    .typeError('Longitude must be a number'),
  address: Yup.string().required('Address is required'),
});

export const addSalesInvoiceSchema = Yup.object({
  items: Yup.array()
    .of(
      Yup.object({
        item_code: Yup.string().required('Item code is required'),

        qty: Yup.number()
          .typeError('Quantity must be a number')
          .required('Quantity is required')
          .positive('Quantity must be greater than 0'),

        rate: Yup.number()
          .typeError('Rate must be a number')
          .required('Rate is required')
          .positive('Rate must be greater than 0'),

        warehouse: Yup.string().required('Warehouse is required'),
      }),
    )
    .min(1, 'At least one item is required')
    .required('Items are required'),
});
