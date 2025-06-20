import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
  usr: Yup.string().required('UserId is required'),
  pwd: Yup.string().required('Password is required'),
});
