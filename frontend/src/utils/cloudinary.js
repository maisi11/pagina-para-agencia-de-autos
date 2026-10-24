/**
 * Optimiza una URL de Cloudinary agregando transformaciones automáticas (WebP/AVIF y calidad inteligente)
 * @param {string} url - URL completa de la imagen
 * @param {string} transformaciones - Parámetros de transformación (ej. 'w_800,c_limit' o 'c_fill,w_400,h_300')
 * @returns {string} URL transformada o URL original si no es de Cloudinary
 */
export function optimizarUrlCloudinary(url, transformaciones = 'f_auto,q_auto') {
  if (!url || typeof url !== 'string') return ''

  // Verificar si es una URL de Cloudinary
  if (!url.includes('cloudinary.com') || !url.includes('/upload/')) {
    return url // Devolver original sin modificar si es externa (ej. Unsplash)
  }

  // Si ya tiene parámetros de transformación f_auto o q_auto, no duplicar
  if (url.includes('/f_auto') || url.includes('/q_auto')) {
    return url
  }

  // Insertar transformaciones justo después de "/upload/"
  return url.replace('/upload/', `/upload/${transformaciones}/`)
}

/**
 * Obtiene la miniatura optimizada para la grilla de búsqueda y tarjetas
 */
export function getThumbnailVehiculo(url) {
  return optimizarUrlCloudinary(url, 'c_fill,w_800,h_533,f_auto,q_auto')
}

/**
 * Obtiene la versión en alta resolución para el detalle con zoom
 */
export function getDetalleVehiculo(url) {
  return optimizarUrlCloudinary(url, 'c_limit,w_1600,f_auto,q_auto')
}
