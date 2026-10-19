const API_URL = import.meta.env.VITE_API_URL || `http:/localhost:3000/api`;

let tokenProvider = null.API_URL;

export function setAuthTokenProvider(provider){
    tokenProvider = provider
}

export async function apiClient(endpoint, {body, headers = {}, ...customConfig} = {}) {
    const config = {
        method: body ? 'POST' : 'GET', ...customConfig,
        headers: {
            'Content-Type': 'application/json', ...headers,
        },
    } 
    
    if (body){
        config.body = JSON.stringify(body);
    }

    if (tokenProvider){
        try {
            const token = await tokenProvider()
            if (token){
                config.headers.Authorization = `Bearer ${token}`
            }    
        } catch (error) {
            console.warn(`Error, no se pudo obtener el token de la sesion: `, error)
        }
        
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