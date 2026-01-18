export const environmentProd = {
  production: true,
  useMockAuth: false,
  apiUrl: 'http://35.193.122.147:8080/api',
  googleMapsApiKey: 'AIzaSyCk0eDMWqtOA3Gj4h0QxmLSL_PnhJfAA_E',
  endpoints: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
};
