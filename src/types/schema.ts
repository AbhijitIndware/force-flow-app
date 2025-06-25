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
  start_time: Yup.string().required('Start time is required'),
  end_time: Yup.string().required('End time is required'),
  pan_no: Yup.string().required('PAN No. is required'),
  gst_no: Yup.string().required('GST No. is required'),
  city: Yup.string().required('City is required'),
  pin_code: Yup.string().required('PIN code is required'),
  distributor: Yup.string().required('Distributor is required'),
  address: Yup.string().required('Address is required'),
  weekly_off: Yup.string().required('Weekly off is required'),

  created_by_employee: Yup.string().nullable(),
  created_by_employee_name: Yup.string().nullable(),
  created_by_employee_designation: Yup.string().nullable(),
});