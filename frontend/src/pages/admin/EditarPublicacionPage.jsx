import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
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

export default function EditarPublicacionPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [catalogos, setCatalogos] = useState(null)
  const [usuarioActual, setUsuarioActual] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [statusState, setStatusState] = useState('disponible') // 'disponible' | 'pausada' | 'finalizada'
  const [estadoOriginal, setEstadoOriginal] = useState('disponible')
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
  const [codigoVehiculo, setCodigoVehiculo] = useState('')
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

  // Dimensiones (en metros)
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

  // Control de campos tocados (touched) para feedback UX
  const [touched, setTouched] = useState({
    titulo: false,
    precio: false,
    patente: false,
    anio: false,
    kilometros: false,
    videoUrl: false,
  })

  const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }))

  // Toast de notificación
  const notificar = (mensaje, tipo = 'success') => {
    setToastMessage({ mensaje, tipo })
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  // Carga inicial: Catálogos, Perfil y Datos de la Publicación a editar
  useEffect(() => {
    let montado = true

    async function cargarDatos() {
      try {
        const [catalogosData, usuarioData, publicacionData] = await Promise.all([
          CatalogosService.obtenerTodos(),
          apiClient('/auth/perfil').catch(() => ({ idUsuario: 1, nombre: 'Asesor Comercial' })),
          PublicacionesService.obtenerPorId(id),
        ])

        if (!montado) return

        if (catalogosData) setCatalogos(catalogosData)
        if (usuarioData) setUsuarioActual(usuarioData)

        if (publicacionData) {
          const pub = publicacionData
          const veh = pub.vehiculo || {}
          const mot = veh.motor || {}
          const dim = veh.dimensiones || {}

          // Publicación
          setTitulo(pub.titulo || '')
          setPrecio(pub.precio != null ? String(pub.precio) : '')
          setDescripcion(pub.descripcion || '')
          setVideoUrl(pub.videoUrl || '')

          // Estado actual
          const estadoActual = pub.historial?.find((h) => !h.fechaHoraFinalizacion)?.estado?.nombre || 'disponible'
          setStatusState(estadoActual)
          setEstadoOriginal(estadoActual)

          // Fotos de Cloudinary (excluyendo videos)
          const fotos = (pub.multimedia || [])
            .map((m) => (typeof m === 'string' ? m : m.urlArchMultimedia))
            .filter((url) => url && !isYouTubeUrl(url))
          const fotosUnicas = [...new Set(fotos)]
          setGaleria(fotosUnicas)

          // Vehículo
          setPatente(veh.patente || '')
          setCodigoVehiculo(veh.codigoVehiculo || '')
          setAnio(veh.anio != null ? String(veh.anio) : '')
          setKilometros(veh.kilometros != null ? String(veh.kilometros) : '')
          setEs0km(veh.kilometros === 0)
          setColorExt(veh.color || '')

          setPuertas(veh.cantidadPuertas != null ? String(veh.cantidadPuertas) : '')
          setAsientos(veh.cantidadAsientos != null ? String(veh.cantidadAsientos) : '')
          setAirbags(veh.cantidadAirbags != null ? String(veh.cantidadAirbags) : '')
          setRemolque(veh.capacidadRemolque != null ? String(veh.capacidadRemolque) : '')
          setBaul(veh.capacidadBaul != null ? String(veh.capacidadBaul) : '')
          setTanque(veh.capacidadTanque != null ? String(veh.capacidadTanque) : '')

          // Modelos y Marcas
          const idModeloVeh = veh.idModelo || ''
          setIdModelo(idModeloVeh)
          const modeloObj = catalogosData?.modelos?.find((m) => m.idModelo === idModeloVeh)
          setIdMarca(modeloObj?.idMarca || veh.modelo?.idMarca || '')
          setVersion(veh.version?.nombreVersion || veh.version?.nombre || '')

          setIdCarroceria(veh.idTipoCarroceria || '')
          setIdSegmento(veh.idSegmento || '')
          setIdCondicion(veh.idCondicion || '')
          setIdCombustible(veh.idCombustible || '')
          setIdCaja(veh.idCaja || '')
          setIdTraccion(veh.idTraccion || '')
          setIdTipoDireccion(veh.idTipoDireccion || '')
          setIdTipoTapizado(veh.idTipoTapizado || '')

          // Motor
          setIdTipoMotor(mot.idTipoMotor || '')
          setDescripcionMotor(mot.descripcion || '')
          setPotenciaMotor(mot.potencia != null ? String(mot.potencia) : '')
          setTorqueMotor(mot.torque != null ? String(mot.torque) : '')

          // Dimensiones (en metros)
          setLargo(dim.largo != null ? String(dim.largo) : '')
          setAncho(dim.ancho != null ? String(dim.ancho) : '')
          setAlto(dim.alto != null ? String(dim.alto) : '')
        }
      } catch (err) {
        console.error('Error al cargar datos para edición:', err)
        notificar('Error al cargar los datos del vehículo. Verificá tu conexión.', 'error')
      } finally {
        if (montado) setCargando(false)
      }
    }

    cargarDatos()
    return () => {
      montado = false
    }
  }, [id])

  // Modelos filtrados dinámicamente según la marca elegida
  const modelosFiltrados = useMemo(() => {
    if (!catalogos?.modelos) return []
    if (!idMarca) return catalogos.modelos
    return catalogos.modelos.filter((m) => Number(m.idMarca) === Number(idMarca))
  }, [catalogos, idMarca])

  // Validación de errores
  const currentYear = new Date().getFullYear()
  const maxYearAllowed = currentYear + 1

  const errores = useMemo(() => {
    const errs = {}
    if (!titulo.trim()) errs.titulo = 'El título de la publicación es obligatorio'
    if (!precio || Number(precio) <= 0) errs.precio = 'El precio debe ser mayor a 0'
    if (!patente.trim()) errs.patente = 'La patente es obligatoria'
    if (!idMarca) errs.idMarca = 'Seleccioná una marca'
    if (!idModelo) errs.idModelo = 'Seleccioná un modelo'

    if (!anio) {
      errs.anio = 'El año de fabricación es obligatorio'
    } else {
      const anioNum = Number(anio)
      if (isNaN(anioNum) || !Number.isInteger(anioNum) || anioNum < 1900 || anioNum > maxYearAllowed) {
        errs.anio = `El año debe estar entre 1900 y ${maxYearAllowed}`
      }
    }

    if (kilometros === '' || isNaN(Number(kilometros)) || Number(kilometros) < 0) {
      errs.kilometros = 'El kilometraje debe ser un número igual o mayor a 0'
    }

    if (videoUrl.trim() && !isYouTubeUrl(videoUrl)) {
      errs.videoUrl = 'Debe ser un enlace válido de YouTube'
    }

    return errs
  }, [titulo, precio, patente, idMarca, idModelo, anio, kilometros, videoUrl, maxYearAllowed])

  const formValido = Object.keys(errores).length === 0

  // Gestión de Parámetros Dinámicos (Pop-up Modal +)
  const abrirModalAgregar = (tipo) => {
    setModalNombre('')
    setModalError(null)
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

      // Refrescar catálogo completo desde la BD
      const catalogosActualizados = await CatalogosService.obtenerTodos()
      if (catalogosActualizados) {
        setCatalogos(catalogosActualizados)
      }

      // Auto-seleccionar nuevo ítem
      if (nuevoItem) {
        if (tipo === 'marca') {
          const idM = nuevoItem.idMarca ?? nuevoItem.id
          setIdMarca(idM)
          setIdModelo('')
        } else if (tipo === 'modelo') {
          const idMod = nuevoItem.idModelo ?? nuevoItem.id
          const marcaUsada = modalMarcaId || idMarca
          setIdMarca(Number(marcaUsada))
          setIdModelo(idMod)
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

      notificar(`¡${modalConfig.titulo} "${val}" guardado exitosamente!`)
      setModalAbierto(false)
      setModalNombre('')
    } catch (err) {
      console.error('Error al agregar elemento paramétrico:', err)
      setModalError(err.message || 'Error al guardar el nuevo elemento')
    } finally {
      setGuardandoParametrico(false)
    }
  }

  // Componente de botón '+' para los títulos de desplegables
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
      setKilometros('0')
    }
  }

  // Gestión de Cloudinary & Galería de Imágenes
  const procesarArchivos = async (archivos) => {
    if (!archivos || archivos.length === 0) return

    const espacioDisponible = MAX_FOTOS - galeria.length
    if (espacioDisponible <= 0) {
      notificar(`Has alcanzado el límite máximo permitido de ${MAX_FOTOS} imágenes por publicación.`, 'error')
      return
    }

    const archivosAProcesar = Array.from(archivos)
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, espacioDisponible)

    if (archivosAProcesar.length === 0) {
      notificar('Solo podés subir archivos de formato imagen (JPG, PNG, WEBP, AVIF).', 'error')
      return
    }

    const nuevosSubiendo = archivosAProcesar.map((f, i) => ({
      id: `${Date.now()}-${i}-${Math.random()}`,
      nombre: f.name,
      progreso: 10,
    }))
    setSubiendoArchivos((prev) => [...prev, ...nuevosSubiendo])

    for (let i = 0; i < archivosAProcesar.length; i++) {
      const archivo = archivosAProcesar[i]
      const subiendoItem = nuevosSubiendo[i]

      try {
        setSubiendoArchivos((prev) =>
          prev.map((item) => (item.id === subiendoItem.id ? { ...item, progreso: 35 } : item))
        )

        // Compresión optimizada en el navegador
        const imagenComprimida = await comprimirImagen(archivo)

        setSubiendoArchivos((prev) =>
          prev.map((item) => (item.id === subiendoItem.id ? { ...item, progreso: 65 } : item))
        )

        // Subida directa a Cloudinary con firma segura
        const resultadoCloudinary = await MultimediaService.subirACloudinary(imagenComprimida)

        if (resultadoCloudinary?.secure_url) {
          setGaleria((prev) => [...prev, resultadoCloudinary.secure_url])
        }

        setSubiendoArchivos((prev) => prev.filter((item) => item.id !== subiendoItem.id))
      } catch (err) {
        console.error('Error al subir imagen a Cloudinary:', err)
        notificar(`Error al subir "${archivo.name}": ${err.message}`, 'error')
        setSubiendoArchivos((prev) => prev.filter((item) => item.id !== subiendoItem.id))
      }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setArrastrando(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setArrastrando(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setArrastrando(false)
    if (e.dataTransfer?.files) {
      procesarArchivos(e.dataTransfer.files)
    }
  }

  const handleFileChange = (e) => {
    if (e.target?.files) {
      procesarArchivos(e.target.files)
      e.target.value = ''
    }
  }

  const eliminarFotoGaleria = (index) => {
    setGaleria((prev) => prev.filter((_, i) => i !== index))
  }

  const moverFotoGaleria = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= galeria.length) return
    setGaleria((prev) => {
      const nueva = [...prev]
      const [removida] = nueva.splice(fromIndex, 1)
      nueva.splice(toIndex, 0, removida)
      return nueva
    })
  }

  // Guardar Cambios (PATCH /api/publicaciones/:id)
  const handleGuardarCambios = async (e) => {
    if (e) e.preventDefault()

    // Validar campos requeridos
    setTouched({
      titulo: true,
      precio: true,
      patente: true,
      anio: true,
      kilometros: true,
      videoUrl: true,
    })

    if (!formValido) {
      const primerError = Object.values(errores)[0]
      notificar(primerError || 'Por favor revisá los campos obligatorios del formulario.', 'error')
      return
    }

    setGuardando(true)

    const payload = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || `Excelente unidad seleccionada en perfecto estado mecánico y documental.`,
      precio: Number(precio),
      idUsuario: usuarioActual?.idUsuario || 1,
      videoUrl: videoUrl.trim(),
      multimedia: [...new Set(galeria)],
      estado: statusState,
      vehiculo: {
        codigoVehiculo: codigoVehiculo.trim() || `VEH-${Date.now().toString().slice(-6)}`,
        patente: patente.trim().toUpperCase(),
        anio: Number(anio),
        kilometros: Number(kilometros),
        cantidadPuertas: Number(puertas) || 4,
        color: colorExt.trim() || 'A coordinar',
        cantidadAsientos: Number(asientos) || 5,
        capacidadRemolque: remolque ? Number(remolque) : undefined,
        capacidadBaul: baul ? Number(baul) : undefined,
        capacidadTanque: tanque ? Number(tanque) : undefined,
        cantidadAirbags: Number(airbags) || 2,

        idMarca: Number(idMarca),
        idModelo: Number(idModelo),
        version: version.trim() || undefined,
        idSegmento: Number(idSegmento) || 1,
        idTipoCarroceria: Number(idCarroceria) || 1,
        idCondicion: Number(idCondicion) || 1,
        idCaja: Number(idCaja) || 1,
        idTraccion: Number(idTraccion) || 1,
        idCombustible: Number(idCombustible) || 1,
        idTipoDireccion: Number(idTipoDireccion) || 1,
        idTipoTapizado: Number(idTipoTapizado) || 1,

        motor: {
          idTipoMotor: Number(idTipoMotor) || 1,
          descripcion: descripcionMotor?.trim() || undefined,
          potencia: potenciaMotor ? Number(potenciaMotor) : undefined,
          torque: torqueMotor ? Number(torqueMotor) : undefined,
        },

        dimensiones: {
          largo: Number(largo) || 4.5,
          alto: Number(alto) || 1.5,
          ancho: Number(ancho) || 1.8,
        },
      },
    }

    try {
      await PublicacionesService.actualizar(Number(id), payload)

      notificar('¡Publicación actualizada exitosamente en la base de datos!')
      setTimeout(() => {
        navigate('/admin/inventario')
      }, 1000)
    } catch (err) {
      console.error('Error al actualizar publicación:', err)
      notificar(err.message || 'Error al guardar los cambios en la base de datos', 'error')
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-secondary animate-spin mb-4" />
        <h2 className="text-base font-bold text-slate-800">Cargando publicación para edición...</h2>
        <p className="text-xs text-slate-500 mt-1">Obteniendo datos completos y catálogos oficiales.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Toast Notificación */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-xs font-bold transition-all ${
            toastMessage.tipo === 'error'
              ? 'bg-rose-950 text-rose-100 border-rose-800'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {toastMessage.tipo === 'error' ? 'error' : 'check_circle'}
          </span>
          <span>{toastMessage.mensaje}</span>
        </div>
      )}

      {/* Header Sticky */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <Link to="/admin/inventario" className="hover:text-secondary font-semibold transition-colors">
                Portal Vendedores
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-bold">Modificar Publicación #{id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">edit_square</span>
              <span>Modificar Publicación &amp; Vehículo</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Estado Selector */}
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-600">Estado:</span>
              <select
                value={statusState}
                onChange={(e) => setStatusState(e.target.value)}
                className="bg-white px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
              >
                <option value="disponible">🟢 Disponible</option>
                <option value="pausada">🟠 Pausada</option>
                <option value="finalizada">⚪ Finalizada (Vendido)</option>
              </select>
            </div>

            <Link
              to="/admin/inventario"
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
            >
              Cancelar
            </Link>

            <button
              type="button"
              onClick={handleGuardarCambios}
              disabled={guardando}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {guardando ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        <form onSubmit={handleGuardarCambios} className="space-y-8">
          {/* SECCIÓN 1: Identificación y Registro Oficial */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">badge</span>
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">1. Identificación &amp; Registro del Vehículo</h2>
                <p className="text-xs text-slate-500">Datos fundamentales del rodado, marca, modelo y estado documental.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Marca */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center">
                    <span>Marca *</span>
                    <BotonAgregarParametrico tipo="marca" />
                  </label>
                </div>
                <select
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                  value={idMarca}
                  onChange={(e) => {
                    const nueva = e.target.value ? Number(e.target.value) : ''
                    setIdMarca(nueva)
                    setIdModelo('')
                    markTouched('idMarca')
                  }}
                >
                  <option value="">Seleccionar marca...</option>
                  {catalogos?.marcas?.map((m) => (
                    <option key={m.idMarca ?? m.id} value={m.idMarca ?? m.id}>
                      {m.nombreMarca ?? m.nombre}
                    </option>
                  ))}
                </select>
                {touched.idMarca && errores.idMarca && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{errores.idMarca}</p>
                )}
              </div>

              {/* Modelo */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center">
                    <span>Modelo *</span>
                    <BotonAgregarParametrico tipo="modelo" />
                  </label>
                </div>
                <select
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                  value={idModelo}
                  onChange={(e) => {
                    setIdModelo(e.target.value ? Number(e.target.value) : '')
                    markTouched('idModelo')
                  }}
                >
                  <option value="">Seleccionar modelo...</option>
                  {modelosFiltrados.map((mod) => (
                    <option key={mod.idModelo ?? mod.id} value={mod.idModelo ?? mod.id}>
                      {mod.nombreModelo ?? mod.nombre}
                    </option>
                  ))}
                </select>
                {touched.idModelo && errores.idModelo && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{errores.idModelo}</p>
                )}
              </div>

              {/* Versión / Configuración Específica */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Versión / Configuración Específica
                </label>
                <input
                  type="text"
                  placeholder="Ej: SEG 2.0 CVT o Berlina"
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                />
              </div>

              {/* Título de la Publicación */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1">Título de la Publicación *</label>
                <input
                  type="text"
                  placeholder="Ej: Volkswagen Golf GTI 2.0 TSI DSG 230cv"
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  onBlur={() => markTouched('titulo')}
                />
                {touched.titulo && errores.titulo && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{errores.titulo}</p>
                )}
              </div>

              {/* Patente */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Patente / Dominio *</label>
                <input
                  type="text"
                  placeholder="Ej: AB123CD o ABC123"
                  maxLength={8}
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={patente}
                  onChange={(e) => setPatente(e.target.value.toUpperCase())}
                  onBlur={() => markTouched('patente')}
                />
                {touched.patente && errores.patente && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{errores.patente}</p>
                )}
              </div>

              {/* Año de Fabricación */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Año de Fabricación * (1900 - {maxYearAllowed})
                </label>
                <input
                  type="number"
                  min="1900"
                  max={maxYearAllowed}
                  placeholder={`Ej: ${currentYear}`}
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                  onBlur={() => markTouched('anio')}
                />
                {touched.anio && errores.anio && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{errores.anio}</p>
                )}
              </div>

              {/* Kilómetros & 0km Checkbox */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">Kilometraje *</label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={es0km}
                      onChange={(e) => handleCheckbox0km(e.target.checked)}
                      className="rounded border-slate-300 text-secondary focus:ring-secondary cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-secondary">¿Es 0 KM?</span>
                  </label>
                </div>
                <input
                  type="number"
                  min="0"
                  disabled={es0km}
                  placeholder="Ej: 45000"
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary disabled:bg-slate-100 disabled:text-slate-400"
                  value={kilometros}
                  onChange={(e) => setKilometros(e.target.value)}
                  onBlur={() => markTouched('kilometros')}
                />
                {touched.kilometros && errores.kilometros && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{errores.kilometros}</p>
                )}
              </div>

              {/* Carrocería */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center">
                    <span>Carrocería</span>
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

              {/* Color Exterior */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Color Exterior</label>
                <input
                  type="text"
                  placeholder="Ej: Gris Nardo / Azul Navarra"
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={colorExt}
                  onChange={(e) => setColorExt(e.target.value)}
                />
              </div>

              {/* Puertas */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Cantidad de Puertas</label>
                <input
                  type="number"
                  min="2"
                  max="6"
                  placeholder="Ej: 5"
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={puertas}
                  onChange={(e) => setPuertas(e.target.value)}
                />
              </div>

              {/* Asientos */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Cantidad de Asientos</label>
                <input
                  type="number"
                  min="2"
                  max="9"
                  placeholder="Ej: 5"
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={asientos}
                  onChange={(e) => setAsientos(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: Mecánica & Tren Motriz */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">tune</span>
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">2. Mecánica, Motor &amp; Especificaciones</h2>
                <p className="text-xs text-slate-500">Transmisión, tipo de motor, potencia, torque y dimensiones estándar en metros.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Combustible */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center">
                    <span>Combustible</span>
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
                <label className="block text-xs font-bold text-slate-800 mb-1">Potencia (HP)</label>
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
                <label className="block text-xs font-bold text-slate-800 mb-1">Torque (Nm)</label>
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
                <label className="block text-xs font-bold text-slate-800 mb-1">Descripción del Motor</label>
                <input
                  type="text"
                  placeholder="Ej: 2.0L TSI Turbo 16V DOHC Intercooler"
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary placeholder:text-slate-400 placeholder:font-normal"
                  value={descripcionMotor}
                  onChange={(e) => setDescripcionMotor(e.target.value)}
                />
              </div>

              {/* Dirección */}
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

              {/* Tapizado */}
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
                      {t.nombre ?? t.nombreTipoTapizado}
                    </option>
                  ))}
                </select>
              </div>

              {/* Airbags */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Cantidad de Airbags</label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  placeholder="Ej: 6"
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={airbags}
                  onChange={(e) => setAirbags(e.target.value)}
                />
              </div>

              {/* Dimensiones (En metros) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Largo (metros)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.5"
                  placeholder="Ej: 4.28"
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={largo}
                  onChange={(e) => setLargo(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Ancho (metros)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.5"
                  placeholder="Ej: 1.78"
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={ancho}
                  onChange={(e) => setAncho(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Alto (metros)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.5"
                  placeholder="Ej: 1.45"
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={alto}
                  onChange={(e) => setAlto(e.target.value)}
                />
              </div>

              {/* Capacidades */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Capacidad Baúl (Litros VDA)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ej: 380"
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={baul}
                  onChange={(e) => setBaul(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Capacidad Tanque (Litros)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ej: 50"
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={tanque}
                  onChange={(e) => setTanque(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Capacidad Remolque (kg)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ej: 1500"
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={remolque}
                  onChange={(e) => setRemolque(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: Precio, Descripción & Galería Cloudinary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-6">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">photo_library</span>
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">3. Precio, Galería Cloudinary &amp; Video</h2>
                <p className="text-xs text-slate-500">
                  Subí hasta 15 fotografías de alta calidad e incorporá el video walk-around de YouTube.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Precio */}
              <div className="max-w-md">
                <label className="block text-xs font-bold text-slate-800 mb-1">Precio de Venta (USD) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-400">
                    USD
                  </span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej: 28500"
                    className="w-full h-11 pl-14 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    onBlur={() => markTouched('precio')}
                  />
                </div>
                {touched.precio && errores.precio && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{errores.precio}</p>
                )}
              </div>

              {/* Video Walkaround YouTube */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Enlace de Video Walk-Around (YouTube)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-500 text-lg">
                    smart_display
                  </span>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full h-11 pl-11 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    onBlur={() => markTouched('videoUrl')}
                  />
                </div>
                {touched.videoUrl && errores.videoUrl && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{errores.videoUrl}</p>
                )}
                {getYouTubeEmbedUrl(videoUrl) && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 aspect-video max-w-md bg-black">
                    <iframe
                      title="Vista Previa YouTube"
                      src={getYouTubeEmbedUrl(videoUrl)}
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>

              {/* Galería de Imágenes Cloudinary */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">
                    Fotografías del Vehículo ({galeria.length} / {MAX_FOTOS})
                  </label>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {galeria.length >= MAX_FOTOS ? 'Límite alcanzado' : `Podés subir ${MAX_FOTOS - galeria.length} más`}
                  </span>
                </div>

                {/* Dropzone */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => {
                    if (galeria.length < MAX_FOTOS && fileInputRef.current) {
                      fileInputRef.current.click()
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                    arrastrando
                      ? 'border-secondary bg-blue-50/50 scale-[1.01]'
                      : 'border-slate-200 hover:border-secondary hover:bg-slate-50/50'
                  } ${galeria.length >= MAX_FOTOS ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-secondary flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">
                    Hacé clic para seleccionar fotos o arrastralas aquí
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Desde PC se abrirá el explorador de archivos; desde celular tu galería o cámara. Compresión
                    automática en tu navegador antes de la subida a Cloudinary.
                  </p>
                </div>

                {/* Subiendo archivos progress */}
                {subiendoArchivos.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {subiendoArchivos.map((item) => (
                      <div key={item.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-slate-700 truncate max-w-xs">{item.nombre}</span>
                          <span className="font-bold text-secondary">{item.progreso}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-secondary h-full transition-all duration-300"
                            style={{ width: `${item.progreso}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Grid de imágenes subidas */}
                {galeria.length > 0 && (
                  <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                    {galeria.map((url, idx) => (
                      <div
                        key={idx}
                        className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-4/3 shadow-2xs"
                      >
                        <img
                          src={optimizarUrlCloudinary(url, { width: 320, height: 240, crop: 'fill' })}
                          alt={`Foto ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1.5 left-1.5 bg-secondary text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                            Portada
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                moverFotoGaleria(idx, idx - 1)
                              }}
                              title="Mover a la izquierda"
                              className="p-1 rounded-lg bg-white/90 text-slate-800 hover:bg-white text-xs"
                            >
                              <span className="material-symbols-outlined text-sm">arrow_back</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              eliminarFotoGaleria(idx)
                            }}
                            title="Eliminar foto"
                            className="p-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                          {idx < galeria.length - 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                moverFotoGaleria(idx, idx + 1)
                              }}
                              title="Mover a la derecha"
                              className="p-1 rounded-lg bg-white/90 text-slate-800 hover:bg-white text-xs"
                            >
                              <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Descripción Comercial */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Descripción Comercial de la Publicación</label>
                <textarea
                  rows={4}
                  placeholder="Detallá los aspectos destacados, estado de mantenimiento, services oficiales, etc."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary placeholder:text-slate-400"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Botones de Pie de Formulario */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              to="/admin/inventario"
              className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
            >
              Cancelar y Volver
            </Link>

            <button
              type="submit"
              disabled={guardando}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {guardando ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                  <span>Guardando Cambios...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>Actualizar Publicación</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      {/* MODAL POP-UP PARA AGREGAR ELEMENTO PARAMÉTRICO (+) */}
      {modalAbierto && modalConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-50 text-secondary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-base">add</span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Agregar {modalConfig.titulo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleGuardarParametrico} className="space-y-4">
              {modalConfig.tipo === 'modelo' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Marca Perteneciente *
                  </label>
                  <select
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary"
                    value={modalMarcaId}
                    onChange={(e) => setModalMarcaId(Number(e.target.value))}
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
                  Nombre de {modalConfig.titulo} *
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder={modalConfig.placeholder}
                  className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary placeholder:text-slate-400 placeholder:font-normal"
                  value={modalNombre}
                  onChange={(e) => setModalNombre(e.target.value)}
                />
                <p className="text-[11px] text-slate-500 mt-1">{modalConfig.ayuda}</p>
              </div>

              {modalError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span>{modalError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoParametrico}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary-container text-white text-xs font-bold shadow transition-all disabled:opacity-50 cursor-pointer"
                >
                  {guardandoParametrico ? (
                    <>
                      <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-xs">check</span>
                      <span>Aceptar</span>
                    </>
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
