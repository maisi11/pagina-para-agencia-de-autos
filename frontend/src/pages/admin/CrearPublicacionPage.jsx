import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient } from '../../api/client'
import { CatalogosService } from '../../services/catalogos.service'
import { PublicacionesService } from '../../services/publicaciones.service'
import { MultimediaService } from '../../services/multimedia.service'
import { comprimirImagen } from '../../utils/imageCompressor'
import { optimizarUrlCloudinary } from '../../utils/cloudinary'

function getYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') return null
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i
  const match = url.match(regExp)
  return match ? match[1] : null
}

function getYouTubeEmbedUrl(url) {
  const videoId = getYouTubeVideoId(url)
  return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : null
}

function isYouTubeUrl(url) {
  if (!url || typeof url !== 'string') return false
  return /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(url.trim())
}

export default function CrearPublicacionPage() {
  const navigate = useNavigate()
  const [catalogos, setCatalogos] = useState(null)
  const [usuarioActual, setUsuarioActual] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [statusState, setStatusState] = useState('disponible') // 'disponible' | 'pausada'
  const [toastMessage, setToastMessage] = useState(null)

  // Estado del Modal para agregar elementos paramétricos
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalConfig, setModalConfig] = useState(null)
  const [modalNombre, setModalNombre] = useState('')
  const [modalMarcaId, setModalMarcaId] = useState('')
  const [modalError, setModalError] = useState(null)
  const [guardandoParametrico, setGuardandoParametrico] = useState(false)

  // Step 1: Identificación
  const [idMarca, setIdMarca] = useState('')
  const [idModelo, setIdModelo] = useState('')
  const [titulo, setTitulo] = useState('')
  const [version, setVersion] = useState('')
  const [idCarroceria, setIdCarroceria] = useState('')
  const [idSegmento, setIdSegmento] = useState('')
  const [idCondicion, setIdCondicion] = useState('')
  const [anio, setAnio] = useState('')
  const [kilometros, setKilometros] = useState('')
  const [es0km, setEs0km] = useState(false)
  const [patente, setPatente] = useState('')
  const [colorExt, setColorExt] = useState('')
  const [colorInt, setColorInt] = useState('')

  // Step 2: Mecánica & Tren Motriz
  const [idCombustible, setIdCombustible] = useState('')
  const [idCaja, setIdCaja] = useState('')
  const [idTraccion, setIdTraccion] = useState('')
  const [idTipoDireccion, setIdTipoDireccion] = useState('')
  const [idTipoTapizado, setIdTipoTapizado] = useState('')
  const [idTipoMotor, setIdTipoMotor] = useState('')
  const [descripcionMotor, setDescripcionMotor] = useState('')
  const [potenciaMotor, setPotenciaMotor] = useState('')
  const [torqueMotor, setTorqueMotor] = useState('')
  const [puertas, setPuertas] = useState('')
  const [asientos, setAsientos] = useState('')
  const [airbags, setAirbags] = useState('')
  const [remolque, setRemolque] = useState('')
  const [baul, setBaul] = useState('')
  const [tanque, setTanque] = useState('')

  // Dimensiones
  const [largo, setLargo] = useState('')
  const [ancho, setAncho] = useState('')
  const [alto, setAlto] = useState('')

  // Step 3: Precio, Descripción & Galería de Imágenes
  const [precio, setPrecio] = useState('')
  const [descripcion, setDescripcion] = useState('')

  // Galería de fotos Cloudinary (Máximo 15 imágenes)
  const MAX_FOTOS = 15
  const fileInputRef = useRef(null)
  const [galeria, setGaleria] = useState([])
  const [subiendoArchivos, setSubiendoArchivos] = useState([])
  const [arrastrando, setArrastrando] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')

  // Control de campos tocados (touched) para feedback UX en tiempo real
  const [touched, setTouched] = useState({
    titulo: false,
    precio: false,
    patente: false,
    anio: false,
    kilometros: false,
    videoUrl: false,
  })

  const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }))

  const notificar = (msg, tipo = 'success') => {
    setToastMessage({ texto: msg, tipo })
    setTimeout(() => setToastMessage(null), 4000)
  }

  const errores = useMemo(() => {
    const errs = {}

    // Título: min 5, max 120
    if (!titulo || titulo.trim().length < 5) {
      errs.titulo = 'El título debe tener al menos 5 caracteres.'
    } else if (titulo.trim().length > 120) {
      errs.titulo = 'El título no puede superar los 120 caracteres.'
    }

    // Precio: numérico > 0
    if (precio === '' || isNaN(Number(precio)) || Number(precio) <= 0) {
      errs.precio = 'El precio debe ser un valor mayor a 0 USD.'
    }

    // Patente: 6 a 8 caracteres alfanuméricos
    const patenteClean = patente.replace(/\s+/g, '')
    if (!patenteClean || patenteClean.length < 6 || patenteClean.length > 8) {
      errs.patente = 'Patente requerida (entre 6 y 8 caracteres alfanuméricos).'
    }

    // Año: validado entre 1900 y el actual + 1
    const anioNum = Number(anio)
    const anioMaximo = new Date().getFullYear() + 1
    if (
      anio === '' ||
      isNaN(anioNum) ||
      !Number.isInteger(anioNum) ||
      anioNum < 1900 ||
      anioNum > anioMaximo
    ) {
      errs.anio = `El año debe estar comprendido entre 1900 y ${anioMaximo}.`
    }

    // Kilómetros: >= 0
    if (kilometros === '' || isNaN(Number(kilometros)) || Number(kilometros) < 0) {
      errs.kilometros = 'Ingresá el kilometraje (0 para unidades sin rodar).'
    }

    // Marca y Modelo
    if (!idMarca) errs.idMarca = 'Seleccioná una marca.'
    if (!idModelo) errs.idModelo = 'Seleccioná un modelo.'

    // Galería: al menos 1 foto válida y máximo 15
    if (galeria.length === 0) {
      errs.galeria = 'Debes cargar al menos una fotografía de portada para el catálogo.'
    } else if (galeria.length > MAX_FOTOS) {
      errs.galeria = `No se pueden cargar más de ${MAX_FOTOS} fotografías por vehículo.`
    }

    // Video URL: opcional, pero si se ingresa debe ser un link válido de YouTube
    if (videoUrl && videoUrl.trim()) {
      const vId = getYouTubeVideoId(videoUrl.trim())
      if (!isYouTubeUrl(videoUrl) || !vId) {
        errs.videoUrl = 'Ingresá un enlace válido de YouTube (ej: https://www.youtube.com/watch?v=... o https://youtu.be/...)'
      }
    }

    return errs
  }, [titulo, precio, patente, anio, kilometros, idMarca, idModelo, galeria, videoUrl])

  const formularioValido = Object.keys(errores).length === 0

  useEffect(() => {
    async function inicializar() {
      try {
        const [catData, userData] = await Promise.allSettled([
          CatalogosService.obtenerTodos(),
          apiClient('/auth/perfil'),
        ])
        if (catData.status === 'fulfilled' && catData.value) {
          setCatalogos(catData.value)
        }
        if (userData.status === 'fulfilled' && userData.value) {
          setUsuarioActual(userData.value)
          if (userData.value.idUsuario) {
            localStorage.setItem('apex_user_id', String(userData.value.idUsuario))
          }
          if (userData.value.nombre) {
            localStorage.setItem('apex_user_name', userData.value.nombre)
          }
        }
      } catch (err) {
        console.error('Error inicializando pantalla de publicación:', err)
      } finally {
        setCargando(false)
      }
    }
    inicializar()
  }, [])

  // Modelos filtrados por marca
  const modelosFiltrados = catalogos?.modelos
    ? catalogos.modelos.filter((m) => Number(m.idMarca) === Number(idMarca))
    : []

  const handleMarcaChange = (e) => {
    const nuevaMarcaId = e.target.value ? Number(e.target.value) : ''
    setIdMarca(nuevaMarcaId)
    setIdModelo('')
  }

  // =========================================================
  // GESTIÓN DE MODAL PARA AGREGAR ELEMENTOS PARAMÉTRICOS
  // =========================================================
  const abrirModalAgregar = (tipo) => {
    setModalError(null)
    setModalNombre('')
    setGuardandoParametrico(false)

    switch (tipo) {
      case 'marca':
        setModalConfig({
          tipo,
          titulo: 'Marca',
          placeholder: 'Ej: Alfa Romeo',
          ayuda: 'Ingresá el nombre oficial de la marca vehicular.',
        })
        break
      case 'modelo':
        setModalConfig({
          tipo,
          titulo: 'Modelo',
          placeholder: 'Ej: Giulia',
          ayuda: 'Ingresá la denominación del modelo para la marca seleccionada.',
        })
        setModalMarcaId(idMarca || (catalogos?.marcas?.[0]?.idMarca ?? ''))
        break
      case 'carroceria':
        setModalConfig({
          tipo,
          titulo: 'Carrocería',
          placeholder: 'Ej: Fastback',
          ayuda: 'Ingresá la silueta o tipo de carrocería.',
        })
        break
      case 'segmento':
        setModalConfig({
          tipo,
          titulo: 'Segmento',
          placeholder: 'Ej: Segmento Premium',
          ayuda: 'Categoría o segmento comercial del vehículo.',
        })
        break
      case 'condicion':
        setModalConfig({
          tipo,
          titulo: 'Condición',
          placeholder: 'Ej: Semi-nuevo',
          ayuda: 'Condición comercial del rodado.',
        })
        break
      case 'combustible':
        setModalConfig({
          tipo,
          titulo: 'Tipo de Combustible',
          placeholder: 'Ej: Híbrido Enchufable (PHEV)',
          ayuda: 'Tecnología o tipo de combustible vehicular.',
        })
        break
      case 'caja':
        setModalConfig({
          tipo,
          titulo: 'Transmisión',
          placeholder: 'Ej: Secuencial doble embrague (DSG)',
          ayuda: 'Tipo de transmisión o caja de cambios.',
        })
        break
      case 'traccion':
        setModalConfig({
          tipo,
          titulo: 'Tracción',
          placeholder: 'Ej: e-AWD Eléctrica Integral',
          ayuda: 'Esquema de tracción motriz.',
        })
        break
      case 'tipoMotor':
      case 'motor':
        setModalConfig({
          tipo: 'tipoMotor',
          titulo: 'Tipo de Motor',
          placeholder: 'Ej: Combustión, Híbrido, Eléctrico',
          ayuda: 'Clasificación tecnológica del motor.',
        })
        break
      case 'direccion':
        setModalConfig({
          tipo,
          titulo: 'Tipo de Dirección',
          placeholder: 'Ej: Electro-hidráulica variable',
          ayuda: 'Asistencia y sistema de la dirección.',
        })
        break
      case 'tapizado':
        setModalConfig({
          tipo,
          titulo: 'Tipo de Tapizado',
          placeholder: 'Ej: Cuero Windsor Microperforado',
          ayuda: 'Material de los tapizados del habitáculo.',
        })
        break
      default:
        return
    }
    setModalAbierto(true)
  }

  const handleGuardarParametrico = async (e) => {
    if (e) e.preventDefault()
    const val = modalNombre.trim()
    if (!val) {
      setModalError('Por favor ingresá un nombre.')
      return
    }
    if (val.length < 2) {
      setModalError('Debe contener al menos 2 caracteres.')
      return
    }

    setGuardandoParametrico(true)
    setModalError(null)

    try {
      let nuevoItem = null
      const { tipo } = modalConfig

      if (tipo === 'marca') {
        nuevoItem = await CatalogosService.crearMarca(val)
      } else if (tipo === 'modelo') {
        const marcaParaModelo = modalMarcaId || idMarca
        if (!marcaParaModelo) {
          setModalError('Debés seleccionar una marca a la que pertenezca el modelo.')
          setGuardandoParametrico(false)
          return
        }
        nuevoItem = await CatalogosService.crearModelo(val, marcaParaModelo)
      } else if (tipo === 'carroceria') {
        nuevoItem = await CatalogosService.crearCarroceria(val)
      } else if (tipo === 'segmento') {
        nuevoItem = await CatalogosService.crearSegmento(val)
      } else if (tipo === 'condicion') {
        nuevoItem = await CatalogosService.crearCondicion(val)
      } else if (tipo === 'combustible') {
        nuevoItem = await CatalogosService.crearCombustible(val)
      } else if (tipo === 'caja') {
        nuevoItem = await CatalogosService.crearCaja(val)
      } else if (tipo === 'traccion') {
        nuevoItem = await CatalogosService.crearTraccion(val)
      } else if (tipo === 'tipoMotor' || tipo === 'motor') {
        nuevoItem = await CatalogosService.crearTipoMotor(val)
      } else if (tipo === 'direccion') {
        nuevoItem = await CatalogosService.crearDireccion(val)
      } else if (tipo === 'tapizado') {
        nuevoItem = await CatalogosService.crearTapizado(val)
      }

      // Refrescar catálogo completo desde la base de datos
      const catalogosActualizados = await CatalogosService.obtenerTodos()
      if (catalogosActualizados) {
        setCatalogos(catalogosActualizados)
      }

      // Auto-seleccionar el nuevo elemento en el formulario
      if (nuevoItem) {
        if (tipo === 'marca') {
          const id = nuevoItem.idMarca ?? nuevoItem.id
          setIdMarca(id)
          setIdModelo('')
        } else if (tipo === 'modelo') {
          const id = nuevoItem.idModelo ?? nuevoItem.id
          const marcaUsada = modalMarcaId || idMarca
          setIdMarca(Number(marcaUsada))
          setIdModelo(id)
        } else if (tipo === 'carroceria') {
          setIdCarroceria(nuevoItem.idTipoCarroceria ?? nuevoItem.id)
        } else if (tipo === 'segmento') {
          setIdSegmento(nuevoItem.idSegmento ?? nuevoItem.id)
        } else if (tipo === 'condicion') {
          setIdCondicion(nuevoItem.idCondicion ?? nuevoItem.id)
        } else if (tipo === 'combustible') {
          setIdCombustible(nuevoItem.idCombustible ?? nuevoItem.id)
        } else if (tipo === 'caja') {
          setIdCaja(nuevoItem.idCaja ?? nuevoItem.id)
        } else if (tipo === 'traccion') {
          setIdTraccion(nuevoItem.idTraccion ?? nuevoItem.id)
        } else if (tipo === 'tipoMotor' || tipo === 'motor') {
          setIdTipoMotor(nuevoItem.idTipoMotor ?? nuevoItem.id)
        } else if (tipo === 'direccion') {
          setIdTipoDireccion(nuevoItem.idTipoDireccion ?? nuevoItem.id)
        } else if (tipo === 'tapizado') {
          setIdTipoTapizado(nuevoItem.idTipoTapizado ?? nuevoItem.id)
        }
      }

      notificar(`¡${modalConfig.titulo} "${val}" guardado exitosamente en la base de datos!`)
      setModalAbierto(false)
      setModalNombre('')
    } catch (err) {
      console.error('Error al agregar elemento paramétrico:', err)
      setModalError(err.message || 'Error al guardar el nuevo elemento en la base de datos')
    } finally {
      setGuardandoParametrico(false)
    }
  }

  // Componente de botón '+' para los títulos de los desplegables
  const BotonAgregarParametrico = ({ tipo }) => (
    <button
      type="button"
      onClick={() => abrirModalAgregar(tipo)}
      title="Agregar nuevo elemento"
      className="w-5 h-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center justify-center shadow-sm transition-transform hover:scale-110 active:scale-90 cursor-pointer ml-1.5 focus:outline-none"
    >
      <span className="material-symbols-outlined text-[13px] font-bold leading-none select-none">
        add
      </span>
    </button>
  )

  const handleCheckbox0km = (checked) => {
    setEs0km(checked)
    if (checked) {
      setKilometros(0)
      const condicion0km = catalogos?.condiciones?.find(
        (c) =>
          (c.nombreCondicion || c.nombre || '').toLowerCase().includes('0km') ||
          (c.nombreCondicion || c.nombre || '').toLowerCase().includes('nuevo')
      )
      if (condicion0km) {
        setIdCondicion(condicion0km.idCondicion ?? condicion0km.id)
      }
    } else {
      setKilometros('')
    }
  }

  // =========================================================
  // GESTIÓN DE GALERÍA MULTIMEDIA (CLOUDINARY DIRECT UPLOAD)
  // =========================================================
  const moverFoto = (index, direccion) => {
    const nuevaLista = [...galeria]
    const destino = index + direccion
    if (destino < 0 || destino >= nuevaLista.length) return
    const temp = nuevaLista[index]
    nuevaLista[index] = nuevaLista[destino]
    nuevaLista[destino] = temp
    setGaleria(nuevaLista)
  }

  const eliminarFoto = (index) => {
    setGaleria((prev) => prev.filter((_, i) => i !== index))
  }

  const procesarArchivos = async (archivosRaw) => {
    if (!archivosRaw || archivosRaw.length === 0) return

    const soloImagenes = Array.from(archivosRaw).filter((f) => f.type.startsWith('image/'))
    if (soloImagenes.length === 0) {
      notificar('Solo se permiten archivos de imagen (JPG, PNG, WebP).', 'error')
      return
    }

    const cupoActual = galeria.length + subiendoArchivos.length
    const cupoDisponible = MAX_FOTOS - cupoActual

    if (cupoDisponible <= 0) {
      notificar(`Ya alcanzaste el límite máximo de ${MAX_FOTOS} fotografías por publicación.`, 'error')
      return
    }

    let archivosAProcesar = soloImagenes
    if (soloImagenes.length > cupoDisponible) {
      notificar(`Solo se agregaron las primeras ${cupoDisponible} fotos para respetar el límite de ${MAX_FOTOS}.`, 'error')
      archivosAProcesar = soloImagenes.slice(0, cupoDisponible)
    }

    // Procesar cada archivo en paralelo controlado
    for (const file of archivosAProcesar) {
      const tempId = Math.random().toString(36).substring(2, 9)
      const previewLocal = URL.createObjectURL(file)

      // Registrar en la lista de subida en progreso
      setSubiendoArchivos((prev) => [
        ...prev,
        {
          id: tempId,
          nombre: file.name,
          preview: previewLocal,
          progreso: 5,
        },
      ])

      try {
        // 1. Compresión previa en el cliente (reduce 12 MB a ~800 KB en < 300 ms)
        const archivoComprimido = await comprimirImagen(file)

        // 2. Subida directa a Cloudinary con reporte de progreso en tiempo real
        const resultado = await MultimediaService.subirACloudinary(archivoComprimido, {
          onProgress: (pct) => {
            setSubiendoArchivos((prev) =>
              prev.map((item) => (item.id === tempId ? { ...item, progreso: Math.max(10, pct) } : item))
            )
          },
        })

        if (resultado?.secure_url) {
          setGaleria((prev) => {
            if (prev.length >= MAX_FOTOS) return prev
            return [...prev, resultado.secure_url]
          })
          notificar(`Foto "${file.name}" cargada con éxito a Cloudinary.`)
        }
      } catch (err) {
        console.error('Error al subir imagen a Cloudinary:', err)
        notificar(`Error al subir "${file.name}": ${err.message}`, 'error')
      } finally {
        URL.revokeObjectURL(previewLocal)
        setSubiendoArchivos((prev) => prev.filter((item) => item.id !== tempId))
      }
    }
  }

  const handleArchivosInput = async (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await procesarArchivos(files)
    }
    // Limpiar input para permitir seleccionar el mismo archivo si fue eliminado
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!arrastrando) setArrastrando(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setArrastrando(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setArrastrando(false)

    if (e.dataTransfer && e.dataTransfer.files) {
      await procesarArchivos(e.dataTransfer.files)
    }
  }

  // Guardar publicación
  const handleSubmit = async (e) => {
    if (e) e.preventDefault()

    // Marcar todos como tocados
    setTouched({
      titulo: true,
      precio: true,
      patente: true,
      anio: true,
      kilometros: true,
      idMarca: true,
      idModelo: true,
      videoUrl: true,
    })

    if (!formularioValido) {
      notificar('Por favor corrija los campos marcados en rojo antes de publicar.', 'error')
      return
    }

    setGuardando(true)

    const codigoGenerado = `APX-${patente.replace(/\s+/g, '').slice(0, 6).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`

    // Obtener idUsuario según el usuario que se encuentre logueado actualmente
    const idUsuarioLogueado = usuarioActual?.idUsuario
      || Number(localStorage.getItem('apex_user_id'))
      || 1

    const payload = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      precio: Number(precio),
      idUsuario: idUsuarioLogueado,
      videoUrl: videoUrl.trim(),
      multimedia: galeria,
      vehiculo: {
        codigoVehiculo: codigoGenerado,
        patente: patente.trim().toUpperCase(),
        anio: Number(anio),
        kilometros: Number(kilometros),
        cantidadPuertas: Number(puertas),
        color: colorExt.trim() || 'A coordinar',
        cantidadAsientos: Number(asientos),
        capacidadRemolque: remolque ? Number(remolque) : undefined,
        capacidadBaul: baul ? Number(baul) : undefined,
        capacidadTanque: tanque ? Number(tanque) : undefined,
        cantidadAirbags: Number(airbags),

        idMarca: Number(idMarca),
        idModelo: Number(idModelo),
        version: version.trim() || undefined,
        idSegmento: Number(idSegmento),
        idTipoCarroceria: Number(idCarroceria),
        idCondicion: Number(idCondicion),
        idCaja: Number(idCaja),
        idTraccion: Number(idTraccion),
        idCombustible: Number(idCombustible),
        idTipoDireccion: Number(idTipoDireccion),
        idTipoTapizado: Number(idTipoTapizado),
        motor: {
          idTipoMotor: Number(idTipoMotor),
          descripcion: descripcionMotor?.trim() || undefined,
          potencia: potenciaMotor ? Number(potenciaMotor) : undefined,
          torque: torqueMotor ? Number(torqueMotor) : undefined,
        },

        dimensiones: {
          largo: Number(largo),
          alto: Number(alto),
          ancho: Number(ancho),
        },
      },
    }

    try {
      const resp = await PublicacionesService.crear(payload)
      const nuevoId = resp?.idPublicacion ?? resp?.id
      
      // Si el vendedor seleccionó estado inicial 'pausada', actualizamos de inmediato
      if (statusState === 'pausada' && nuevoId) {
        await PublicacionesService.cambiarEstado(nuevoId, 'pausada')
      }

      notificar('¡Publicación creada exitosamente en la base de datos!')
      setTimeout(() => {
        navigate('/admin/inventario')
      }, 1000)
    } catch (err) {
      console.error('Error al crear publicación:', err)
      notificar(err.message || 'Error al validar o guardar la publicación en el backend', 'error')
      setGuardando(false)
    }
  }

  // Estilo reactivo según validación
  const getInputClass = (fieldName, base = '') => {
    const isTouched = touched[fieldName]
    const hasError = Boolean(errores[fieldName])

    if (!isTouched) {
      return `${base} bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-secondary`
    }
    if (hasError) {
      return `${base} bg-rose-50/50 border-rose-500 text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400`
    }
    return `${base} bg-emerald-50/40 border-emerald-500 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-400`
  }

  const fotoPrincipal = galeria[0] || null

  return (
    <div className="w-full bg-slate-50 min-h-[calc(100vh-60px)] pb-20 selection:bg-secondary selection:text-white">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed top-18 right-6 z-50 text-white px-5 py-3.5 rounded-xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastMessage.tipo === 'error'
              ? 'bg-rose-950 border-rose-700 text-rose-100'
              : 'bg-slate-900 border-slate-700'
          }`}
        >
          <span
            className={`material-symbols-outlined text-lg ${
              toastMessage.tipo === 'error' ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {toastMessage.tipo === 'error' ? 'error' : 'check_circle'}
          </span>
          <span className="text-xs font-semibold">{toastMessage.texto}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="w-full bg-white shadow-sm border-b border-slate-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5">
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Link to="/admin/inventario" className="hover:text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">inventory_2</span>
              Portal Vendedores
            </Link>
            <span className="material-symbols-outlined text-xs text-slate-300">chevron_right</span>
            <Link to="/admin/inventario" className="hover:text-secondary">Inventario Activo</Link>
            <span className="material-symbols-outlined text-xs text-slate-300">chevron_right</span>
            <span className="text-secondary font-semibold">Alta de Publicación</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-1">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Alta de Vehículo para Salón
                </h1>
                
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Ficha técnica oficial, validación en tiempo real y reordenamiento de fotos para el showroom.
              </p>
            </div>

            {/* Estado Inicial y Botón de Publicación */}
            <div className="flex flex-wrap items-center gap-3">

              <Link
                to="/admin/inventario"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-all"
              >
                Cancelar
              </Link>

              {/* Botón Guardar - Inhabilitado si el formulario tiene errores */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!formularioValido || guardando}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer ${
                  formularioValido && !guardando
                    ? 'bg-secondary hover:bg-secondary-container shadow-secondary/30'
                    : 'bg-slate-400 cursor-not-allowed opacity-60'
                }`}
                title={!formularioValido ? 'Corrija los campos requeridos para habilitar' : 'Publicar vehículo'}
              >
                <span className="material-symbols-outlined text-base">
                  {guardando ? 'sync' : 'rocket_launch'}
                </span>
                <span>{guardando ? 'Publicando...' : 'Publicar Vehículo'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Master Form (8 cols) */}
          <form className="lg:col-span-8 flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* STEP 1: Identificación & Datos Clave */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                    01
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Identificación &amp; Datos Clave</h2>
                    <p className="text-xs text-slate-500">Datos de patente, modelo vehicular y año de fabricación</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-wider">
                  Obligatorio
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Título de la Publicación con Validación */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">
                      Título de la Publicación *
                    </label>
                    {touched.titulo && !errores.titulo && (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        Válido
                      </span>
                    )}
                  </div>
                  <input
                    className={getInputClass('titulo', 'w-full h-11 px-3.5 border rounded-xl text-sm transition-all')}
                    type="text"
                    required
                    placeholder="Ej: Toyota Hilux SRX 4x4 2.8 TDI AT6 2024"
                    value={titulo}
                    onFocus={() => markTouched('titulo')}
                    onChange={(e) => {
                      setTitulo(e.target.value)
                      markTouched('titulo')
                    }}
                  />
                  {touched.titulo && errores.titulo && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">error</span>
                      {errores.titulo}
                    </p>
                  )}
                </div>

                {/* Brand Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center">
                      <span>Marca *</span>
                      <BotonAgregarParametrico tipo="marca" />
                    </label>
                    {touched.idMarca && !errores.idMarca && (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        Válido
                      </span>
                    )}
                  </div>
                  <select
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                    value={idMarca}
                    onChange={handleMarcaChange}
                    onFocus={() => markTouched('idMarca')}
                  >
                    <option value="">Seleccionar marca...</option>
                    {catalogos?.marcas?.map((m) => (
                      <option key={m.idMarca ?? m.id} value={m.idMarca ?? m.id}>
                        {m.nombreMarca ?? m.nombre}
                      </option>
                    ))}
                  </select>
                  {touched.idMarca && errores.idMarca && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">error</span>
                      {errores.idMarca}
                    </p>
                  )}
                </div>

                {/* Model Selector (Cascading) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center">
                      <span>Modelo *</span>
                      <BotonAgregarParametrico tipo="modelo" />
                    </label>
                    {touched.idModelo && !errores.idModelo && (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        Válido
                      </span>
                    )}
                  </div>
                  <select
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                    value={idModelo}
                    onChange={(e) => setIdModelo(e.target.value ? Number(e.target.value) : '')}
                    onFocus={() => markTouched('idModelo')}
                  >
                    <option value="">{idMarca ? 'Seleccionar modelo...' : 'Primero seleccioná una marca'}</option>
                    {modelosFiltrados.map((m) => (
                      <option key={m.idModelo ?? m.id} value={m.idModelo ?? m.id}>
                        {m.nombreModelo ?? m.nombre}
                      </option>
                    ))}
                  </select>
                  {touched.idModelo && errores.idModelo && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">error</span>
                      {errores.idModelo}
                    </p>
                  )}
                </div>

                {/* Versión específica */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Versión / Configuración Específica
                  </label>
                  <input
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="Ej: SRX 4x4 2.8 TDI 6AT Cuero Bi-Tono"
                  />
                </div>

                {/* Carrocería */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center">
                      <span>Carrocería *</span>
                      <BotonAgregarParametrico tipo="carroceria" />
                    </label>
                  </div>
                  <select
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                    value={idCarroceria}
                    onChange={(e) => setIdCarroceria(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">Seleccionar carrocería...</option>
                    {catalogos?.carrocerias?.map((c) => (
                      <option key={c.idTipoCarroceria ?? c.id} value={c.idTipoCarroceria ?? c.id}>
                        {c.nombreTipoCarroceria ?? c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Segmento */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center">
                      <span>Segmento</span>
                      <BotonAgregarParametrico tipo="segmento" />
                    </label>
                  </div>
                  <select
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                    value={idSegmento}
                    onChange={(e) => setIdSegmento(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">Seleccionar segmento...</option>
                    {catalogos?.segmentos?.map((s) => (
                      <option key={s.idSegmento ?? s.id} value={s.idSegmento ?? s.id}>
                        {s.nombreSegmento ?? s.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condición */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center">
                      <span>Condición</span>
                      <BotonAgregarParametrico tipo="condicion" />
                    </label>
                  </div>
                  <select
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                    value={idCondicion}
                    onChange={(e) => setIdCondicion(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">Seleccionar condición...</option>
                    {catalogos?.condiciones?.map((c) => (
                      <option key={c.idCondicion ?? c.id} value={c.idCondicion ?? c.id}>
                        {c.nombreCondicion ?? c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Año con Validación (Escritura: 1900 a año actual + 1) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">Año de Fabricación *</label>
                    {touched.anio && !errores.anio && (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        Válido
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    step="1"
                    placeholder={`Ej: ${new Date().getFullYear()}`}
                    className={getInputClass('anio', 'w-full h-11 px-3.5 border rounded-xl text-sm transition-all')}
                    value={anio}
                    onFocus={() => markTouched('anio')}
                    onChange={(e) => {
                      setAnio(e.target.value === '' ? '' : Number(e.target.value))
                      markTouched('anio')
                    }}
                  />
                  {touched.anio && errores.anio && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">error</span>
                      {errores.anio}
                    </p>
                  )}
                </div>

                {/* Kilometraje con Validación */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">Kilometraje Actual *</label>
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
                      <input
                        className="w-3.5 h-3.5 rounded text-secondary cursor-pointer"
                        type="checkbox"
                        checked={es0km}
                        onChange={(e) => handleCheckbox0km(e.target.checked)}
                      />
                      <span>0km / Sin rodar</span>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      className={getInputClass('kilometros', 'w-full h-11 pl-3.5 pr-12 border rounded-xl text-sm')}
                      type="number"
                      min="0"
                      placeholder="Ej: 34000 (0 para 0km)"
                      value={kilometros}
                      onFocus={() => markTouched('kilometros')}
                      onChange={(e) => {
                        setKilometros(e.target.value === '' ? '' : Number(e.target.value))
                        markTouched('kilometros')
                      }}
                    />
                    <span className="absolute right-3.5 top-3 text-xs text-slate-400 font-bold">KM</span>
                  </div>
                  {touched.kilometros && errores.kilometros && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">error</span>
                      {errores.kilometros}
                    </p>
                  )}
                </div>

                {/* Patente con Validación */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">
                      Patente / Identificador *
                    </label>
                    {touched.patente && !errores.patente && (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        Válido
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      className={getInputClass('patente', 'w-full h-11 px-3.5 border rounded-xl font-mono text-sm uppercase')}
                      type="text"
                      maxLength={8}
                      placeholder="Ej: AF 892 XQ"
                      value={patente}
                      onFocus={() => markTouched('patente')}
                      onChange={(e) => {
                        setPatente(e.target.value.toUpperCase())
                        markTouched('patente')
                      }}
                    />
                    <span className="material-symbols-outlined absolute right-3.5 top-2.5 text-slate-400 text-base">
                      verified
                    </span>
                  </div>
                  {touched.patente && errores.patente && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">error</span>
                      {errores.patente}
                    </p>
                  )}
                </div>

                {/* Colores */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Color Exterior</label>
                  <input
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                    type="text"
                    placeholder="Ej: Blanco Perlado, Gris Plata..."
                    value={colorExt}
                    onChange={(e) => setColorExt(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Acabado Interior</label>
                  <input
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                    type="text"
                    placeholder="Ej: Cuero Negro, Tela Grafito..."
                    value={colorInt}
                    onChange={(e) => setColorInt(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* STEP 2: Mecánica & Tren Motriz */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  02
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Mecánica &amp; Tren Motriz</h2>
                  <p className="text-xs text-slate-500">Tracción, combustible, transmisión y seguridad activa</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Combustible */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center">
                      <span>Tipo de Combustible</span>
                      <BotonAgregarParametrico tipo="combustible" />
                    </label>
                  </div>
                  <select
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                    value={idCombustible}
                    onChange={(e) => setIdCombustible(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">Seleccionar combustible...</option>
                    {catalogos?.combustibles?.map((c) => (
                      <option key={c.idCombustible ?? c.id} value={c.idCombustible ?? c.id}>
                        {c.nombreCombustible ?? c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transmisión */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center">
                      <span>Transmisión</span>
                      <BotonAgregarParametrico tipo="caja" />
                    </label>
                  </div>
                  <select
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                    value={idCaja}
                    onChange={(e) => setIdCaja(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">Seleccionar transmisión...</option>
                    {catalogos?.cajas?.map((c) => (
                      <option key={c.idCaja ?? c.id} value={c.idCaja ?? c.id}>
                        {c.nombreCaja ?? c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tracción */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center">
                      <span>Tracción</span>
                      <BotonAgregarParametrico tipo="traccion" />
                    </label>
                  </div>
                  <select
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                    value={idTraccion}
                    onChange={(e) => setIdTraccion(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">Seleccionar tracción...</option>
                    {catalogos?.tracciones?.map((t) => (
                      <option key={t.idTraccion ?? t.id} value={t.idTraccion ?? t.id}>
                        {t.nombreTraccion ?? t.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Motor */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center">
                      <span>Tipo de Motor</span>
                      <BotonAgregarParametrico tipo="tipoMotor" />
                    </label>
                  </div>
                  <select
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                    value={idTipoMotor}
                    onChange={(e) => setIdTipoMotor(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">Seleccionar tipo de motor...</option>
                    {catalogos?.tiposMotor?.map((tm) => (
                      <option key={tm.idTipoMotor ?? tm.id} value={tm.idTipoMotor ?? tm.id}>
                        {tm.nombreTipo ?? tm.nombre ?? `Tipo #${tm.idTipoMotor ?? tm.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Potencia (HP) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center">
                      <span>Potencia (HP)</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Ej: 220"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary placeholder:text-slate-400 placeholder:font-normal"
                    value={potenciaMotor}
                    onChange={(e) => setPotenciaMotor(e.target.value)}
                  />
                </div>

                {/* Torque (Nm) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center">
                      <span>Torque (Nm)</span>
                    </label>
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Ej: 350"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary placeholder:text-slate-400 placeholder:font-normal"
                    value={torqueMotor}
                    onChange={(e) => setTorqueMotor(e.target.value)}
                  />
                </div>

                {/* Descripción del Motor */}
                <div className="md:col-span-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center">
                      <span>Descripción del Motor</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Ej: 2.0L TSI Turbo 16V DOHC Intercooler"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary placeholder:text-slate-400 placeholder:font-normal"
                    value={descripcionMotor}
                    onChange={(e) => setDescripcionMotor(e.target.value)}
                  />
                </div>

                {/* Tipo de Dirección */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center">
                      <span>Tipo de Dirección</span>
                      <BotonAgregarParametrico tipo="direccion" />
                    </label>
                  </div>
                  <select
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                    value={idTipoDireccion}
                    onChange={(e) => setIdTipoDireccion(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">Seleccionar dirección...</option>
                    {catalogos?.direcciones?.map((d) => (
                      <option key={d.idTipoDireccion ?? d.id} value={d.idTipoDireccion ?? d.id}>
                        {d.nombre ?? d.nombreTipoDireccion}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Tapizado */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center">
                      <span>Tipo de Tapizado</span>
                      <BotonAgregarParametrico tipo="tapizado" />
                    </label>
                  </div>
                  <select
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                    value={idTipoTapizado}
                    onChange={(e) => setIdTipoTapizado(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">Seleccionar tapizado...</option>
                    {catalogos?.tapizados?.map((t) => (
                      <option key={t.idTipoTapizado ?? t.id} value={t.idTipoTapizado ?? t.id}>
                        {t.nombreTipoTapizado ?? t.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Puertas y Asientos */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Puertas</label>
                    <input
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                      type="number"
                      min="2"
                      max="6"
                      placeholder="Ej: 4"
                      value={puertas}
                      onChange={(e) => setPuertas(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Asientos</label>
                    <input
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                      type="number"
                      min="1"
                      max="9"
                      placeholder="Ej: 5"
                      value={asientos}
                      onChange={(e) => setAsientos(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Airbags */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Cantidad de Airbags</label>
                  <input
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                    type="number"
                    min="0"
                    max="12"
                    placeholder="Ej: 6"
                    value={airbags}
                    onChange={(e) => setAirbags(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>

                {/* Capacidades & Volúmenes */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Capacidades &amp; Volúmenes
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Baúl (Litros VDA)</span>
                      <input
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                        type="number"
                        min="50"
                        placeholder="Ej: 470"
                        value={baul}
                        onChange={(e) => setBaul(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Tanque (Litros)</span>
                      <input
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                        type="number"
                        min="20"
                        placeholder="Ej: 80"
                        value={tanque}
                        onChange={(e) => setTanque(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Remolque (kg)</span>
                      <input
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                        type="number"
                        min="100"
                        placeholder="Ej: 3500"
                        value={remolque}
                        onChange={(e) => setRemolque(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                {/* Dimensiones (metros) */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Dimensiones del Vehículo (en metros)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Largo (m)</span>
                      <input
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                        type="number"
                        step="0.01"
                        min="0.1"
                        max="20"
                        placeholder="Ej: 5.33"
                        value={largo}
                        onChange={(e) => setLargo(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Ancho (m)</span>
                      <input
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                        type="number"
                        step="0.01"
                        min="0.1"
                        max="20"
                        placeholder="Ej: 1.85"
                        value={ancho}
                        onChange={(e) => setAncho(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Alto (m)</span>
                      <input
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                        type="number"
                        step="0.01"
                        min="0.1"
                        max="20"
                        placeholder="Ej: 1.82"
                        value={alto}
                        onChange={(e) => setAlto(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: Precio, Galería con Reordenamiento & Descripción */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  03
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Precio &amp; Galería Fotográfica</h2>
                  <p className="text-xs text-slate-500">Valor de venta en dólares y fotos de alta resolución con reordenamiento</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Precio USD con Validación */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">Precio de Contado (USD) *</label>
                    {touched.precio && !errores.precio && (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        Válido
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-bold text-slate-700">USD</span>
                    <input
                      className={getInputClass('precio', 'w-full h-11 pl-14 pr-4 border rounded-xl font-bold text-base')}
                      type="number"
                      min="1000"
                      step="500"
                      placeholder="Ej: 47500"
                      value={precio}
                      onFocus={() => markTouched('precio')}
                      onChange={(e) => {
                        setPrecio(e.target.value === '' ? '' : Number(e.target.value))
                        markTouched('precio')
                      }}
                    />
                  </div>
                  {touched.precio && errores.precio && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">error</span>
                      {errores.precio}
                    </p>
                  )}
                </div>
                 {/* Descripción */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-800 mb-1">Descripción de la Unidad</label>
                  <textarea
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary leading-relaxed"
                    rows="3"
                    value={descripcion}
                    placeholder="Escribí aquí los detalles, historial de mantenimientos y equipamiento destacado de la unidad..."
                    onChange={(e) => setDescripcion(e.target.value)}
                  ></textarea>
                </div>
                {/* Galería de Fotos con Carga Directa a Cloudinary (Máx 15 fotos) */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block">
                        Galería de Fotografías de Showroom
                      </label>
                      <span className="text-[11px] text-slate-500">
                        La primera imagen corresponde a la portada del catálogo. Usa las flechas para reordenar.
                      </span>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border transition-all ${
                        galeria.length >= MAX_FOTOS
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-blue-50 text-secondary border-blue-200'
                      }`}
                    >
                      {galeria.length} / {MAX_FOTOS} fotos cargadas
                    </span>
                  </div>

                  {/* Input de archivo nativo oculto (PC y Móvil) */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleArchivosInput}
                    className="hidden"
                  />

                  {/* Zona de Arrastrar y Soltar / Clic para Seleccionar */}
                  <div
                    onClick={() => {
                      if (galeria.length + subiendoArchivos.length < MAX_FOTOS) {
                        fileInputRef.current?.click()
                      } else {
                        notificar(`Se alcanzó el límite máximo de ${MAX_FOTOS} fotos por publicación.`, 'error')
                      }
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer select-none flex flex-col items-center justify-center gap-2 ${
                      arrastrando
                        ? 'border-secondary bg-blue-50/70 scale-[1.01]'
                        : galeria.length >= MAX_FOTOS
                        ? 'border-slate-200 bg-slate-100/70 cursor-not-allowed opacity-60'
                        : 'border-slate-300 hover:border-secondary bg-slate-50/80 hover:bg-blue-50/30'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-2xl">
                        {galeria.length >= MAX_FOTOS ? 'lock' : 'cloud_upload'}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800">
                        {galeria.length >= MAX_FOTOS
                          ? `Límite máximo de ${MAX_FOTOS} fotos alcanzado`
                          : 'Hacé clic para seleccionar o arrastrá tus fotos aquí'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {galeria.length >= MAX_FOTOS
                          ? 'Eliminá alguna imagen si deseás subir una nueva.'
                          : 'En PC abre el explorador de archivos; en celulares abre la galería o cámara.'}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Formatos JPG, PNG, WebP • Se optimizan en tu dispositivo y se transfieren a Cloudinary
                    </span>
                  </div>

                  {/* Strip de Miniaturas y Cargas en Progreso */}
                  {galeria.length === 0 && subiendoArchivos.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 p-6 text-center bg-slate-50/50 flex flex-col items-center justify-center gap-1.5">
                      <span className="material-symbols-outlined text-3xl text-slate-400">photo_library</span>
                      <p className="text-xs font-semibold text-slate-600">Aún no hay fotos cargadas</p>
                      <p className="text-[11px] text-slate-400">
                        Seleccioná al menos una foto para la portada del vehículo.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {/* Fotos ya cargadas en Cloudinary */}
                      {galeria.map((url, idx) => (
                        <div
                          key={idx}
                          className={`relative rounded-xl overflow-hidden border p-2 bg-white flex flex-col gap-2 shadow-sm transition-all ${
                            idx === 0 ? 'border-secondary ring-2 ring-secondary/20' : 'border-slate-200'
                          }`}
                        >
                          <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-slate-900">
                            <img
                              src={optimizarUrlCloudinary(url, 'c_fill,w_500,h_320,f_auto,q_auto')}
                              alt={`Foto ${idx + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {idx === 0 && (
                              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-secondary text-white text-[9px] font-bold uppercase tracking-wide shadow">
                                ★ Portada Principal
                              </span>
                            )}
                            <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono">
                              #{idx + 1}
                            </span>
                          </div>

                          {/* Botones de Reordenamiento */}
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moverFoto(idx, -1)}
                                disabled={idx === 0}
                                className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                title="Mover a la izquierda"
                              >
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => moverFoto(idx, 1)}
                                disabled={idx === galeria.length - 1}
                                className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                title="Mover a la derecha"
                              >
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => eliminarFoto(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                              title="Quitar foto"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Fotos en proceso de compresión / subida a Cloudinary */}
                      {subiendoArchivos.map((item) => (
                        <div
                          key={item.id}
                          className="relative rounded-xl overflow-hidden border border-blue-300 p-2 bg-blue-50/30 flex flex-col gap-2 shadow-sm animate-pulse"
                        >
                          <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-slate-900">
                            <img
                              src={item.preview}
                              alt="Subiendo..."
                              className="w-full h-full object-cover opacity-60"
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 text-white p-2">
                              <span className="material-symbols-outlined text-xl animate-spin text-blue-400">
                                progress_activity
                              </span>
                              <span className="text-[10px] font-bold">Subiendo {item.progreso}%</span>
                              <div className="w-full max-w-[80px] h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-400 transition-all duration-200"
                                  style={{ width: `${item.progreso}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-500 truncate text-center font-mono">
                            {item.nombre}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Video Walk-Around de YouTube */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <div>
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-red-600 text-sm">smart_display</span>
                        Video Walk-Around (YouTube)
                        <span className="text-[10px] text-slate-400 font-normal">(Opcional)</span>
                      </label>
                      <span className="text-[11px] text-slate-500">
                        Pegá el link del video de YouTube (ej. https://www.youtube.com/watch?v=... o https://youtu.be/...). 
                      </span>
                    </div>
                    {videoUrl.trim() && getYouTubeVideoId(videoUrl.trim()) && (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        YouTube detectado
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute left-3.5 top-3 text-red-600 pointer-events-none">
                      <span className="material-symbols-outlined text-base">play_circle</span>
                    </div>
                    <input
                      type="url"
                      className={`w-full h-11 pl-10 pr-10 bg-slate-50 border rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 ${
                        videoUrl && errores.videoUrl
                          ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30'
                          : 'border-slate-200 focus:ring-secondary'
                      }`}
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => {
                        setVideoUrl(e.target.value)
                        markTouched('videoUrl')
                      }}
                      onFocus={() => markTouched('videoUrl')}
                    />
                    {videoUrl && (
                      <button
                        type="button"
                        onClick={() => setVideoUrl('')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="Limpiar enlace"
                      >
                        <span className="material-symbols-outlined text-base">cancel</span>
                      </button>
                    )}
                  </div>

                  {videoUrl && errores.videoUrl && (
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">error</span>
                      {errores.videoUrl}
                    </p>
                  )}

                  {/* Vista previa en vivo del reproductor embebido */}
                  {videoUrl.trim() && getYouTubeVideoId(videoUrl.trim()) && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm mt-2">
                      <div className="px-3 py-1.5 bg-slate-800 text-slate-300 text-[11px] flex items-center justify-between">
                        <span className="font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-red-400">smart_display</span>
                          Previsualización del reproductor embebido
                        </span>
                        <a
                          href={videoUrl.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-secondary flex items-center gap-0.5 text-[10px]"
                        >
                          Probar en YouTube
                          <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                        </a>
                      </div>
                      <div className="relative aspect-[16/9] w-full">
                        <iframe
                          src={getYouTubeEmbedUrl(videoUrl.trim())}
                          title="Previsualización Video Walk-Around"
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>

               
              </div>
            </div>
          </form>

          {/* Right Column: Live Card Preview & Compliance Check (~32%) */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-20">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  Previsualización en Vivo
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    statusState === 'disponible'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {statusState}
                </span>
              </div>

              {/* Card visual matching VehicleCard con gradientes de protección WCAG */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden flex items-center justify-center">
                  {fotoPrincipal ? (
                    <img
                      className="w-full h-full object-cover"
                      src={optimizarUrlCloudinary(fotoPrincipal, 'c_fill,w_800,h_533,f_auto,q_auto')}
                      alt={titulo || 'Vehículo'}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1.5 p-4 text-center text-slate-400">
                      <span className="material-symbols-outlined text-4xl text-slate-500">photo_camera</span>
                      <span className="text-xs font-semibold">Sin foto de portada cargada</span>
                    </div>
                  )}
                  {/* Gradientes Oscuros de Protección WCAG */}
                  <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-1"></div>
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-1"></div>

                  <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wide z-10 flex items-center gap-1 shadow">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                    {statusState.toUpperCase()}
                  </span>
                  {anio && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/80 text-white text-[10px] font-bold z-10 shadow">
                      {anio}
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{titulo || 'Título de la publicación'}</h3>
                  <div className="text-base font-extrabold text-slate-900">
                    {precio ? `USD ${Number(precio).toLocaleString('es-AR')}` : 'USD —'}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>{kilometros !== '' ? (Number(kilometros) > 0 ? `${Number(kilometros).toLocaleString()} km` : '0 km') : '— km'}</span>
                    <span className="text-right truncate">{version ? version.slice(0, 16) : 'Versión —'}</span>
                  </div>
                </div>
              </div>

              {/* Compliance Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                  <span>Documentación e informe de dominio al día</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                  <span>Garantía oficial y transferencia inmediata</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                  <span>Fotografía real verificada de showroom</span>
                </div>
              </div>

              {/* Estado de Validación */}
              {!formularioValido ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                  <span className="font-bold block">Campos pendientes de validación:</span>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5">
                    {Object.values(errores).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                  <span className="font-semibold">Todos los campos técnicos son válidos.</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!formularioValido || guardando}
                className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                  formularioValido && !guardando
                    ? 'bg-secondary hover:bg-secondary-container shadow-secondary/30'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-70'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {guardando ? 'sync' : 'rocket_launch'}
                </span>
                <span>{guardando ? 'Guardando en Base de Datos...' : 'Confirmar y Publicar en Catálogo'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* POP UP MODAL PARA AGREGAR NUEVO ELEMENTO PARAMÉTRICO */}
      {modalAbierto && modalConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            {/* Parte superior con texto "Agregar (Nombre del elemento que se seleccionó)" */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Agregar {modalConfig.titulo}
              </h3>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors cursor-pointer"
                title="Cerrar"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Contenido / Campo para escribir con validaciones correspondientes */}
            <form onSubmit={handleGuardarParametrico} className="space-y-4">
              {modalConfig.tipo === 'modelo' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Marca a la que pertenece *
                  </label>
                  <select
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                    value={modalMarcaId}
                    onChange={(e) => setModalMarcaId(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">Seleccionar marca...</option>
                    {catalogos?.marcas?.map((m) => (
                      <option key={m.idMarca ?? m.id} value={m.idMarca ?? m.id}>
                        {m.nombreMarca ?? m.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {modalConfig.tipo === 'motor'
                    ? 'Descripción del motor *'
                    : `Nombre de ${modalConfig.titulo.toLowerCase()} *`}
                </label>
                <input
                  type="text"
                  autoFocus
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder={modalConfig.placeholder}
                  value={modalNombre}
                  onChange={(e) => {
                    setModalNombre(e.target.value)
                    if (modalError) setModalError(null)
                  }}
                />
                {modalConfig.ayuda && (
                  <p className="text-[11px] text-slate-400 mt-1">{modalConfig.ayuda}</p>
                )}
                {modalError && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {modalError}
                  </p>
                )}
              </div>

              {/* Parte inferior: dos botones, uno para aceptar y el otro para cancelar */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  disabled={guardandoParametrico}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoParametrico}
                  className="px-5 py-2 rounded-xl bg-secondary hover:bg-secondary-container text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  {guardandoParametrico ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Aceptar</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
