export const environment = {
  production: false,
  useMockAuth: false, // ✅ Cambiar a false para usar backend real
  apiUrl: 'http://localhost:8080/api', // 🔄 Cambiar por tu URL de Google Cloud
  endpoints: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
};
