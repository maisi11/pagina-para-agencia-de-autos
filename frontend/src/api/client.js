const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

let tokenProvider = null;

export function setAuthTokenProvider(provider) {
  tokenProvider = provider;
}

export async function apiClient(endpoint, { body, headers = {}, ...customConfig } = {}) {
  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  let token = null;
  if (tokenProvider) {
    try {
      token = await tokenProvider();
    } catch (error) {
      console.warn('Error al obtener token del provider: ', error);
    }
  }

  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('apex_auth_token') || 'dev-token-vendedor';
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || `Error en la petición: ${response.status}`);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }
  return await response.json().catch(() => null);
}
