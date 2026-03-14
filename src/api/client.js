import axios from 'axios';
import Swal from 'sweetalert2';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      'Error de conexión con el servidor';
    const status = error.response?.status;
    if (status === 400 || status === 404 || status === 500) {
      Swal.fire({ icon: 'error', title: 'Error', text: message });
    }
    return Promise.reject(error);
  }
);
