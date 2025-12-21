export const environmentProd = {
  production: true,
  useMockAuth: false,
  apiUrl: 'http://localhost:8080/api', // 🌐 Tu URL de Google Cloud
  endpoints: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
};
