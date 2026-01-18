export const environment = {
  production: false,
  useMockAuth: false, //
  apiUrl: 'http://localhost:8080/api',
  googleMapsApiKey: 'AIzaSyCk0eDMWqtOA3Gj4h0QxmLSL_PnhJfAA_E',
  endpoints: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    changePassword: '/admin/empleados/cambiar-password-inicial',
  },
};
