const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

let tokenProvider = null;

export function setAuthTokenProvider(provider) {
  tokenProvider = provider;
}

/**
 * Limpia todos los datos de sesión almacenados en el navegador
 */
export function limpiarSesion() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('apex_auth_token');
    localStorage.removeItem('apex_auth_expires_at');
    localStorage.removeItem('apex_user_id');
    localStorage.removeItem('apex_user_name');
    localStorage.removeItem('apex_user_email');
  }
}

/**
 * Almacena los datos de la sesión con expiración máxima de 1 hora
 */
export function guardarSesion({ token, expiresIn = 3600, usuario }) {
  if (typeof window === 'undefined') return;

  const duracionSegundos = Number(expiresIn) || 3600;
  const expiraEnMs = Date.now() + duracionSegundos * 1000;

  localStorage.setItem('apex_auth_token', token);
  localStorage.setItem('apex_auth_expires_at', String(expiraEnMs));

  if (usuario) {
    if (usuario.idUsuario) localStorage.setItem('apex_user_id', String(usuario.idUsuario));
    if (usuario.nombre) localStorage.setItem('apex_user_name', usuario.nombre);
    if (usuario.email) localStorage.setItem('apex_user_email', usuario.email);
  }
}

/**
 * Retorna el token activo si la sesión sigue vigente (< 1 hora).
 * Si expiró, purga la sesión y retorna null.
 */
export function obtenerTokenActivo() {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('apex_auth_token');
  const expiresAt = localStorage.getItem('apex_auth_expires_at');

  if (!token) return null;

  // Si tiene fecha de expiración y ya fue superada (más de 1 hora)
  if (expiresAt && Date.now() > Number(expiresAt)) {
    limpiarSesion();
    return null;
  }

  return token;
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

  if (!token) {
    token = obtenerTokenActivo();
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, config);

  // Manejo de token expirado o no autorizado (401)
  if (response.status === 401) {
    limpiarSesion();
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login?expirada=1';
    }
  }

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
