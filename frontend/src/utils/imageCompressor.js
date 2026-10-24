export async function comprimirImagen(file, { maxWidth = 2048, maxHeight = 1536, calidad = 0.85 } = {}) {
  // Si no es un archivo de imagen, devolver original
  if (!file || !file.type.startsWith('image/')) {
    return file
  }

  // Si es un GIF o SVG, no redimensionar
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        let width = img.width
        let height = img.height

        // Calcular nuevo tamaño manteniendo relación de aspecto
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        // Crear canvas para el re-muestreo
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          return resolve(file) // Fallback si no hay soporte de canvas
        }

        // Suavizado bicúbico de alta calidad
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        // Determinar formato de exportación
        const mimeType = 'image/jpeg'

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file)
            }

            // Si el blob comprimido resultara ser más pesado que el original, usamos el original
            if (blob.size >= file.size && width === img.width && height === img.height) {
              return resolve(file)
            }

            // Convertir blob de vuelta a objeto File con nombre original
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '') + '.jpg',
              {
                type: mimeType,
                lastModified: Date.now(),
              }
            )

            resolve(compressedFile)
          },
          mimeType,
          calidad
        )
      }

      img.onerror = () => {
        resolve(file) // Si falla la decodificación, no bloquear la subida
      }

      img.src = e.target.result
    }

    reader.onerror = () => {
      resolve(file)
    }

    reader.readAsDataURL(file)
  })
}
