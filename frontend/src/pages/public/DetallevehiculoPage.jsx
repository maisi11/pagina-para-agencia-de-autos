import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { PublicacionesService } from '../../services/publicaciones.service'
import { MetricasService } from '../../services/metricas.service'
import { optimizarUrlCloudinary } from '../../utils/cloudinary'
import VehicleCard from '../../components/public/VehicleCard'

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

function formatMedidaMetros(valorMm) {
  if (valorMm == null || isNaN(Number(valorMm))) return '-'
  const num = Number(valorMm)
  const metros = num > 50 ? num / 1000 : num
  return `${metros.toFixed(2).replace('.', ',')} m`
}


export default function DetallevehiculoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const whatsappPhone = import.meta.env.VITE_WHATSAPP_PHONE || 'Error al cargar el numero de telefono'
  const direccionShowroom = import.meta.env.VITE_UBICACION || 'Error al caragr la ubicacion'
  const urlMapaEmbebido =  `https://www.google.com/maps?q=${encodeURIComponent(direccionShowroom)}&output=embed`
  const urlGoogleMaps = `https://maps.google.com/?q=${encodeURIComponent(direccionShowroom)}`

  const [publicacion, setPublicacion] = useState(null)
  const [similares, setSimilares] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Media tabs y galería
  const [mediaTab, setMediaTab] = useState('photos') // 'photos' | 'video' | '360'
  const [fotoActiva, setFotoActiva] = useState(0)
  const [videoPlaying, setVideoPlaying] = useState(true)
  
  // Modales y Toasts
  const [showTestDriveModal, setShowTestDriveModal] = useState(false)
  const [showPermutaModal, setShowPermutaModal] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Calculadora de Financiamiento
  const [showCalculator, setShowCalculator] = useState(false)
  const [downPayment, setDownPayment] = useState(18000)
  const [loanTerm, setLoanTerm] = useState(36)

  // Form states
  const [tdNombre, setTdNombre] = useState('')
  const [tdTel, setTdTel] = useState('')
  const [tdFecha, setTdFecha] = useState('2026-10-25')
  const [tdFranja, setTdFranja] = useState('Tarde (15 a 18 hs)')

  const [permutaModelo, setPermutaModelo] = useState('')
  const [permutaAnio, setPermutaAnio] = useState(2021)
  const [permutaTel, setPermutaTel] = useState('')

  const showToast = (msg, icon = 'info') => {
    setToastMessage({ msg, icon })
    setTimeout(() => setToastMessage(null), 3500)
  }

  useEffect(() => {
    async function cargarPublicacion() {
      try {
        setCargando(true)
        const [pub, listado] = await Promise.all([
          PublicacionesService.obtenerPorId(id),
          PublicacionesService.listar().catch(() => []),
        ])

        setPublicacion(pub)
        if (pub?.precio) {
          const precioNum = Number(pub.precio) || 0
          setDownPayment(Math.max(1000, Math.round(precioNum * 0.35)))
        }
        if (Array.isArray(listado)) {
          setSimilares(listado.filter((p) => String(p.idPublicacion ?? p.id) !== String(id)))
        }

        // Registrar analítica de visita
        MetricasService.registrarVisitaAuto(id)
      } catch (err) {
        console.error('Error al cargar publicación:', err)
        setError('No pudimos encontrar el vehículo solicitado.')
      } finally {
        setCargando(false)
      }
    }

    if (id) {
      cargarPublicacion()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [id])

  if (cargando) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-4xl text-secondary animate-spin">sync</span>
        <p className="text-sm font-semibold text-slate-600">Cargando ficha técnica del vehículo...</p>
      </div>
    )
  }

  if (error || !publicacion) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20 text-center space-y-4">
        <span className="material-symbols-outlined text-5xl text-red-500">error</span>
        <h2 className="text-2xl font-bold text-slate-900">{error || 'Publicación no disponible'}</h2>
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white font-bold text-sm rounded-xl hover:bg-secondary-container transition-all"
        >
          Volver al Catálogo
        </Link>
      </div>
    )
  }

  const { vehiculo, precio, moneda, multimedia, descripcion, titulo } = publicacion
  const idPub = publicacion.idPublicacion ?? publicacion.id ?? id

  const marcaNombre =
    vehiculo?.modelo?.marca?.nombreMarca || vehiculo?.modelo?.marca?.nombre || 'Vehículo'
  const modeloNombre = vehiculo?.modelo?.nombreModelo || vehiculo?.modelo?.nombre || ''
  const versionNombre = vehiculo?.version?.nombreVersion || vehiculo?.version?.nombre || ''
  const anio = vehiculo?.anio || 2023
  const tituloCompleto = titulo || `${marcaNombre} ${modeloNombre} ${versionNombre} ${anio}`.trim()
  const codigoVehiculo = vehiculo?.codigoVehiculo || `APX-${marcaNombre.slice(0, 3).toUpperCase()}-${idPub}`

  const precioUSD = Number(precio) || 0
  const precioFormateado = `${moneda || 'USD'} ${precioUSD.toLocaleString('es-AR')}`
  const precioEquivARS = (precioUSD * 1350).toLocaleString('es-AR')

  // Extracción del video real almacenado en la BD (campo videoUrl o en tabla Multimedia)
  const rawVideoUrl =
    publicacion.videoUrl ||
    publicacion.VideoUrl ||
    multimedia?.find((m) => isYouTubeUrl(m.urlArchMultimedia || m.url))?.urlArchMultimedia ||
    multimedia?.find((m) => isYouTubeUrl(m.urlArchMultimedia || m.url))?.url ||
    null

  const videoEmbedUrl = getYouTubeEmbedUrl(rawVideoUrl)
  const hasVideo = Boolean(videoEmbedUrl)

  // Filtrar la galería para mostrar solo imágenes fotográficas (excluyendo el video de YouTube)
  const rawMediaUrls =
    multimedia && multimedia.length > 0
      ? multimedia.map((m) => m.urlArchMultimedia || m.url).filter(Boolean)
      : []

  const fotos =
    rawMediaUrls.filter((u) => !isYouTubeUrl(u)).length > 0
      ? rawMediaUrls.filter((u) => !isYouTubeUrl(u))
      : [
          'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
        ]

  const km = vehiculo?.kilometros ?? vehiculo?.kilometraje ?? 0
  const kmFormateado = km === 0 ? '0 km (A patentar)' : `${Number(km).toLocaleString('es-AR')} km`

  const caja = vehiculo?.caja?.nombreCaja || vehiculo?.caja?.nombre || 'Manual'
  const combustible = vehiculo?.combustible?.nombreCombustible || vehiculo?.combustible?.nombre || 'Nafta'
  const traccion = vehiculo?.traccion?.nombreTraccion || vehiculo?.traccion?.nombre || 'Delantera'
  const color = vehiculo?.color || 'A coordinar'
  const carroceria = vehiculo?.tipoCarroceria?.nombreTipoCarroceria || vehiculo?.tipoCarroceria?.nombre || 'Sedán'
  const segmento = vehiculo?.segmento?.nombreSegmento || vehiculo?.segmento?.nombre || 'Segmento C'
  const condicion = vehiculo?.condicion?.nombreCondicion || vehiculo?.condicion?.nombre || 'Usado'
  const tapizado = vehiculo?.tipoTapizado?.nombreTipoTapizado || vehiculo?.tipoTapizado?.nombre || 'Cuero'
  const direccion = vehiculo?.tipoDireccion?.nombre || vehiculo?.tipoDireccion?.nombreTipoDireccion || 'Eléctrica'
  const motor = vehiculo?.motor
  const tipoMotor = motor?.tipoMotor?.nombreTipo || motor?.tipoMotor?.nombre || 'Combustión'
  const potencia = motor?.potencia ? `${motor.potencia} HP` : null
  const torque = motor?.torque ? `${motor.torque} Nm` : null
  const descripcionMotor = motor?.descripcion || null
  const dimensiones = vehiculo?.dimensiones
  const capacidadRemolque = vehiculo?.capacidadRemolque != null ? Number(vehiculo.capacidadRemolque) : null
  const capacidadBaul = vehiculo?.capacidadBaul != null ? Number(vehiculo.capacidadBaul) : null
  const capacidadTanque = vehiculo?.capacidadTanque != null ? Number(vehiculo.capacidadTanque) : null

  const capacidadRemolqueFormateada =
    capacidadRemolque != null ? `${capacidadRemolque.toLocaleString('es-AR')} kg` : null

  const capacidadBaulFormateada =
    capacidadBaul != null ? `${capacidadBaul.toLocaleString('es-AR')} litros` : null

  const capacidadTanqueFormateada =
    capacidadTanque != null ? `${capacidadTanque.toLocaleString('es-AR')} litros` : null
  const asesorNombre = publicacion?.usuario?.nombre || 'Martín Benítez'
  const asesorIniciales = asesorNombre
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AM'

  // ESTADO SEMÁNTICO DE LA PUBLICACIÓN
  const estadoNombre = (
    publicacion.historial?.[0]?.estado?.nombreEstado ||
    publicacion.historial?.[0]?.nombreEstado ||
    publicacion.estado ||
    'disponible'
  ).toLowerCase()

  const isPausada = estadoNombre.includes('pausad') || estadoNombre.includes('reserv')
  const isVendida = estadoNombre.includes('finaliz') || estadoNombre.includes('vendid')
  const isDisponible = !isPausada && !isVendida



  const handleShareClick = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      showToast('Enlace de la ficha copiado al portapapeles', 'share')
    } else {
      showToast('URL: ' + window.location.href, 'share')
    }
  }

  // ACCIÓN PRINCIPAL DE WHATSAPP CON PLANTILLA INEQUÍVOCA
  const handleWhatsAppAction = () => {
    if (!isDisponible) return

    MetricasService.registrarConsultaWhatsApp(idPub)

    // Plantilla de mensaje predeterminado requerida por la UX
    const mensaje = encodeURIComponent(
      `¡Hola! Quiero consultar sobre el vehículo ${tituloCompleto} (Ref: #${codigoVehiculo}) publicado en $${precioUSD.toLocaleString('es-AR')} USD.`
    )
    window.open(`https://wa.me/${whatsappPhone}?text=${mensaje}`, '_blank')
  }

  const handleTestDriveSubmit = async (e) => {
    e.preventDefault()
    try {
      await MetricasService.registrarEvento('TEST_DRIVE_SOLICITUD', {
        idPublicacion: idPub,
        nombre: tdNombre,
        telefono: tdTel,
        fecha: tdFecha,
        franja: tdFranja,
      })
    } catch (err) {
      console.warn(err)
    }
    setShowTestDriveModal(false)
    showToast('¡Solicitud de Test Drive enviada! Un asesor te llamará en breve.', 'done_all')
    setTdNombre('')
    setTdTel('')
  }

  const handlePermutaSubmit = async (e) => {
    e.preventDefault()
    try {
      await MetricasService.registrarEvento('COTIZACION_PERMUTA', {
        idPublicacion: idPub,
        autoPermuta: permutaModelo,
        anio: permutaAnio,
        telefono: permutaTel,
      })
    } catch (err) {
      console.warn(err)
    }
    setShowPermutaModal(false)
    showToast('¡Solicitud de tasación recibida! Te enviaremos el valor por WhatsApp.', 'check_circle')
    setPermutaModelo('')
    setPermutaTel('')
  }

  return (
    <div className="w-full bg-surface py-8 pb-24 lg:pb-12 selection:bg-secondary selection:text-white">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-24 lg:bottom-6 right-6 z-[100] max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-secondary text-2xl">{toastMessage.icon}</span>
          <span className="text-xs font-semibold">{toastMessage.msg}</span>
        </div>
      )}

    

      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col gap-6">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link to="/" className="hover:text-secondary">Inicio</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <Link to="/catalogo" className="hover:text-secondary">Catálogo</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-slate-900 font-bold truncate max-w-xs">{tituloCompleto}</span>
          </div>
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 text-secondary hover:bg-slate-200 text-xs font-semibold cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Volver al Catálogo
          </Link>
        </div>

        {/* CASO DE BORDE: BANNER DE ADVERTENCIA PARA PUBLICACIONES PAUSADAS O VENDIDAS */}
        {isPausada && (
          <div className="w-full p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-amber-600 text-2xl shrink-0 mt-0.5">warning</span>
            <div>
              <h3 className="font-extrabold text-sm text-amber-950">
                Esta publicación se encuentra pausada temporalmente
              </h3>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                La unidad se encuentra reservada o en proceso de documentación administrativa. En este momento no acepta consultas de compra directa.
              </p>
            </div>
          </div>
        )}

        {isVendida && (
          <div className="w-full p-4 rounded-2xl bg-slate-100 border border-slate-300 text-slate-800 flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-slate-600 text-2xl shrink-0 mt-0.5">verified</span>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Vehículo Vendido
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Esta unidad ya fue entregada a su comprador. Podés consultar las opciones similares recomendadas al final de la página.
              </p>
            </div>
          </div>
        )}

        {/* Title & Badges Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {isDisponible && (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold tracking-wider uppercase flex items-center gap-1.5 border border-emerald-200 shadow-2xs">
                  <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                  DISPONIBLE
                </span>
              )}
              {isPausada && (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold tracking-wider uppercase flex items-center gap-1.5 border border-amber-200 shadow-2xs">
                  <span className="material-symbols-outlined text-sm text-amber-600">pause_circle</span>
                  PAUSADA
                </span>
              )}
              {isVendida && (
                <span className="px-3 py-1 rounded-full bg-slate-800 text-white text-xs font-extrabold tracking-wider uppercase flex items-center gap-1.5 shadow-2xs">
                  <span className="material-symbols-outlined text-sm text-slate-300">cancel</span>
                  VENDIDO
                </span>
              )}
             
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {tituloCompleto}
            </h1>
            <p className="text-sm text-slate-600 max-w-4xl">
              {descripcion || 'Unidad seleccionada con documentación al día y entrega inmediata.'}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start lg:self-end">
            <button
              onClick={handleShareClick}
              aria-label="Compartir enlace de esta publicación"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-base text-secondary">share</span>
              Compartir publicación
            </button>
          </div>
        </div>

        {/* Main Content 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-8">
          {/* Left Column: Gallery, Specs, Details (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Media Gallery Container */}
            <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-200/80 flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
                <div className="inline-flex p-1 rounded-xl bg-slate-100 gap-1">
                  <button
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer transition-all ${
                      mediaTab === 'photos' ? 'bg-black text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    onClick={() => setMediaTab('photos')}
                  >
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                    Fotos ({fotos.length})
                  </button>
                  <button
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                      mediaTab === 'video' ? 'bg-black text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    onClick={() => setMediaTab('video')}
                  >
                    <span className="material-symbols-outlined text-sm">smart_display</span>
                    <span>Video</span>
                    {hasVideo ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Video disponible"></span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-normal">(No disp.)</span>
                    )}
                  </button>
                </div>

                
              </div>

              {/* Viewport 1: Photos */}
              {mediaTab === 'photos' && (
                <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 shadow-inner group">
                  <img
                    alt={`${tituloCompleto} - Foto ${fotoActiva + 1}`}
                    className={`w-full h-full object-cover select-none transition-all duration-300 ${
                      isVendida ? 'filter grayscale contrast-125' : ''
                    }`}
                    src={optimizarUrlCloudinary(fotos[fotoActiva], 'c_limit,w_1600,f_auto,q_auto')}
                  />

                  {/* Overlay Vendido */}
                  {isVendida && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="px-6 py-2.5 rounded-xl bg-slate-900/90 text-white text-xl font-extrabold tracking-widest uppercase border-2 border-white/80 shadow-2xl">
                        VENDIDO
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 z-10">
                    <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur text-white text-xs font-semibold shadow">
                      Foto {fotoActiva + 1} de {fotos.length}
                    </span>
                  </div>
                  {hasVideo && (
                    <button
                      className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur text-xs font-bold text-slate-900 hover:bg-secondary hover:text-white shadow transition-all cursor-pointer"
                      onClick={() => setMediaTab('video')}
                    >
                      <span className="material-symbols-outlined text-sm text-secondary">play_circle</span>
                      Ver Video
                    </button>
                  )}
                  <button
                    aria-label="Foto anterior"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer"
                    onClick={() => setFotoActiva((prev) => (prev > 0 ? prev - 1 : fotos.length - 1))}
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    aria-label="Siguiente foto"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer"
                    onClick={() => setFotoActiva((prev) => (prev < fotos.length - 1 ? prev + 1 : 0))}
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              )}

              {/* Viewport 2: Video Walk-Around Embebido de YouTube */}
              {mediaTab === 'video' && (
                <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-black shadow-inner flex flex-col justify-between">
                  {hasVideo ? (
                    <div className="relative w-full h-full flex flex-col">
                      <div className="absolute top-0 left-0 right-0 z-10 px-4 py-2 bg-gradient-to-b from-black/80 via-black/30 to-transparent flex items-center justify-between pointer-events-none">
    
                        <a
                          href={rawVideoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pointer-events-auto inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-black/70 hover:bg-black text-white text-xs font-bold backdrop-blur transition-all border border-white/20 cursor-pointer"
                        >
                          
                        </a>
                      </div>

                      <iframe
                        src={videoEmbedUrl}
                        title={`Video Walk-Around - ${tituloCompleto}`}
                        className="w-full h-full border-0 rounded-xl"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900 text-white space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-slate-400">videocam_off</span>
                      </div>
                      <div className="max-w-md space-y-1">
                        <h3 className="text-base font-bold text-white">Video no disponible para esta unidad</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Esta publicación no tiene un video cargado. Podés solicitar un video por WhatsApp.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setMediaTab('photos')}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">photo_camera</span>
                          <span>Ver galería de fotos</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Thumbnails Strip */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                {fotos.map((url, idx) => (
                  <button
                    key={idx}
                    className={`aspect-[16/10] rounded-lg overflow-hidden border-2 cursor-pointer shadow-sm transition-all ${
                      fotoActiva === idx && mediaTab === 'photos'
                        ? 'border-secondary scale-105'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => {
                      setFotoActiva(idx)
                      setMediaTab('photos')
                    }}
                    aria-label={`Ver foto ${idx + 1}`}
                  >
                    <img
                      className="w-full h-full object-cover"
                      src={optimizarUrlCloudinary(url, 'c_fill,w_300,h_200,f_auto,q_auto')}
                      alt={`Miniatura ${idx + 1}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Spec Quick Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <span className="material-symbols-outlined text-sm text-secondary">calendar_today</span>
                  Año Modelo
                </div>
                <span className="text-xl font-bold text-slate-900">{anio}</span>
                <span className="text-xs text-slate-500">Patentado en regla</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <span className="material-symbols-outlined text-sm text-secondary">verified</span>
                  Condicion 
                </div>
                <span className="text-xl font-bold text-slate-900">{condicion}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <span className="material-symbols-outlined text-sm text-secondary">speed</span>
                  Kilometraje
                </div>
                <span className="text-xl font-bold text-slate-900">{kmFormateado}</span>
                <span className="text-xs text-slate-500">Comprobado en salón</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <span className="material-symbols-outlined text-sm text-secondary">settings</span>
                  Caja &amp; Tracción
                </div>
                <span className="text-xl font-bold text-slate-900">{caja}</span>
                <span className="text-xs text-slate-500">{traccion}</span>
              </div>
              
            </div>

            {/* Description & Seller Story */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col gap-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">description</span>
                Descripción del Vehículo
              </h2>
              <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                <p>
                  {descripcion ||
                    `Error al traer la descripcion`}
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-800 font-medium pt-1">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-secondary">check</span>
                    Garantía mecánica certificada por 12 meses extendible
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-secondary">check</span>
                    Documentación completa, VTV vigente y libre de multas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-secondary">check</span>
                    Aceptamos permutas llave por llave en el acto
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-secondary">check</span>
                    Entrega inmediata y transferencia en el día
                  </li>
                </ul>
              </div>
            </div>

            {/* Detailed Technical Inspection Accordion */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 bg-slate-50 flex items-center justify-between border-b border-slate-200">
                <h2 className="text-base font-bold text-slate-900">Ficha Técnica &amp; Equipamiento Oficial</h2>
              </div>
              <div className="p-6 space-y-6 text-xs">
                {/* 1. Mecánica y Rendimiento */}
                <div>
                  <h3 className="font-bold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">tune</span>
                    Rendimiento &amp; Mecánica
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-800">
                    <div className="flex justify-between p-2 rounded bg-slate-50">
                      <span>Transmisión:</span>
                      <span className="font-bold">{caja}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded">
                      <span>Tracción:</span>
                      <span className="font-bold">{traccion}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-50">
                      <span>Combustible:</span>
                      <span className="font-bold">{combustible}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded">
                      <span>Tipo de Motor:</span>
                      <span className="font-bold">{tipoMotor}</span>
                    </div>
                    {potencia && (
                      <div className="flex justify-between p-2 rounded bg-slate-50">
                        <span>Potencia Máxima:</span>
                        <span className="font-bold">{potencia}</span>
                      </div>
                    )}
                    {torque && (
                      <div className="flex justify-between p-2 rounded">
                        <span>Torque Motor:</span>
                        <span className="font-bold">{torque}</span>
                      </div>
                    )}
                    
                    {descripcionMotor && (
                      <div className="flex justify-between p-2 rounded bg-slate-50 md:col-span-2">
                        <span>Descripción del Motor:</span>
                        <span className="font-bold text-right">{descripcionMotor}</span>
                      </div>
                    )}
                     <div className="flex justify-between p-2 rounded bg-slate-50">
                      <span>Tipo de Dirección:</span>
                      <span className="font-bold">{direccion}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Carrocería & Habitáculo */}
                <div>
                  <h3 className="font-bold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">directions_car</span>
                    Carrocería &amp; Habitáculo
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-800">
                    <div className="flex justify-between p-2 rounded bg-slate-50">
                      <span>Carrocería:</span>
                      <span className="font-bold">{carroceria}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded">
                      <span>Segmento:</span>
                      <span className="font-bold">{segmento}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-50">
                      <span>Color:</span>
                      <span className="font-bold">{color}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded">
                      <span>Tapizado:</span>
                      <span className="font-bold">{tapizado}</span>
                    </div>
                   
                    {dimensiones && (
                      <div className="flex justify-between p-2 rounded">
                        <span>Dimensiones (Largo × Ancho × Alto):</span>
                        <span className="font-bold font-mono">
                          {formatMedidaMetros(dimensiones.largo)} × {formatMedidaMetros(dimensiones.ancho)} × {formatMedidaMetros(dimensiones.alto)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Capacidades & Carga */}
                <div>
                  <h3 className="font-bold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">inventory_2</span>
                    Capacidades &amp; Carga
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-slate-800">
                    <div className="flex flex-col justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs">
                      <span className="text-slate-500 font-semibold text-xs flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-secondary">luggage</span>
                        Capacidad del Baúl
                      </span>
                      <div className="mt-2">
                        <span className="text-base font-bold text-slate-900 font-mono">
                          {capacidadBaulFormateada || 'No especificada'}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5">Medición oficial bajo el estándar VDA</p>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs">
                      <span className="text-slate-500 font-semibold text-xs flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-secondary">local_gas_station</span>
                        Capacidad del Tanque
                      </span>
                      <div className="mt-2">
                        <span className="text-base font-bold text-slate-900 font-mono">
                          {capacidadTanqueFormateada || 'No especificada'}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5">Capacidad en litros de combustible</p>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs">
                      <span className="text-slate-500 font-semibold text-xs flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-secondary">rv_hookup</span>
                        Capacidad de Remolque
                      </span>
                      <div className="mt-2">
                        <span className="text-base font-bold text-slate-900 font-mono">
                          {capacidadRemolqueFormateada || 'No especificada'}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5">Capacidad máxima de arrastre con freno</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Seguridad & Confort */}
                <div>
                  <h3 className="font-bold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">shield</span>
                    Seguridad &amp; Confort
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-800">
                    <div className="flex justify-between p-2 rounded bg-slate-50">
                      <span>Airbags:</span>
                      <span className="font-bold">{vehiculo?.cantidadAirbags ? `${vehiculo.cantidadAirbags} airbags` : 'Frontales, laterales y de cortina'}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded">
                      <span>Plazas / Puertas:</span>
                      <span className="font-bold">{vehiculo?.cantidadAsientos} asientos • {vehiculo?.cantidadPuertas} puertas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MÓDULO INCRUSTADO DE GOOGLE MAPS CON "CÓMO LLEGAR" */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">location_on</span>
                    Ubicación del Showroom &amp; Retiro de la Unidad
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {direccionShowroom}
                  </p>
                </div>
                <a
                  href={urlGoogleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => MetricasService.registrarEvento('CLICK_MAPS')}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-secondary text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <span>Cómo Llegar</span>
                  <span className="material-symbols-outlined text-sm">directions</span>
                </a>
              </div>

  
              <div className="relative w-full h-56 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <iframe
                  title="Ubicación Showroom Apex Motors"
                  src={urlMapaEmbebido}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Purchase Card (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-28">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200/80 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-secondary"></div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Precio Contado Efectivo
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">{precioFormateado}</span>
                  <span className="text-xs text-slate-500">(Billete)</span>
                </div>
                <div className="text-xs text-slate-500">
                  Equiv. estimado: <strong className="text-slate-800">ARS {precioEquivARS}</strong>{' '}
                  <span className="text-[11px] text-slate-400">(Ref. MEP)</span>
                </div>
              </div>

    

              {/* Direct Primary WhatsApp CTA (DESKTOP) */}
              <div className="flex flex-col gap-2">
                {isDisponible ? (
                  <button
                    className="w-full py-4 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all cursor-pointer active:scale-95"
                    onClick={handleWhatsAppAction}
                  >
                    <span className="material-symbols-outlined text-[22px]">chat</span>
                    <span>Consultar por WhatsApp con un Asesor</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-4 px-4 rounded-xl bg-slate-100 text-slate-400 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200 opacity-75"
                  >
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                    <span>{isPausada ? 'Consultas Pausadas Temporalmente' : 'Unidad Vendida'}</span>
                  </button>
                )}
              </div>

              {/* Secondary Actions */}
              <div className="flex flex-col gap-2">
                <button
                  className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  onClick={() => setShowTestDriveModal(true)}
                >
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  Agendar Test Drive en Showroom
                </button>
                <button
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  onClick={() => setShowPermutaModal(true)}
                >
                  <span className="material-symbols-outlined text-sm">swap_horiz</span>
                  Cotizar mi Auto Usado (Permuta)
                </button>
              </div>

              {/* Dedicated Advisor (Con datos del usuario de la BD) */}
              <div
                className="pt-3 border-t border-slate-100 flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors"
                onClick={handleWhatsAppAction}
              >
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col gap-2.5 text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Compromiso Apex Certified
              </span>
              <div className="flex items-start gap-2 text-slate-600">
                <span className="material-symbols-outlined text-sm text-emerald-600 shrink-0 mt-0.5">verified</span>
                <div>
                  <strong className="text-slate-900">Garantía Mecánica:</strong> Motor y caja cubiertos por 12 meses extendible.
                </div>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <span className="material-symbols-outlined text-sm text-emerald-600 shrink-0 mt-0.5">gavel</span>
                <div>
                  <strong className="text-slate-900">Gestoría Integral:</strong> Trámite de transferencia en el acto sin demoras.
                </div>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                
              </div>
            </div>
          </div>
        </div>

        {/* Similar Vehicles Horizontal Section */}
        {similares.length > 0 && (
          <section className="w-full bg-slate-50 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-secondary text-xs font-bold uppercase tracking-wider">Opciones Comparables</span>
                <h2 className="text-2xl font-extrabold text-slate-900">Vehículos Similares en Stock</h2>
              </div>
              <Link
                to="/catalogo"
                className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:underline"
              >
                <span>Ver todo el catálogo</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similares.slice(0, 3).map((sim) => (
                <VehicleCard key={sim.idPublicacion ?? sim.id} publicacion={sim} />
              ))}
            </div>
          </section>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 px-4 shadow-2xl lg:hidden flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider leading-none">
            Precio Contado
          </span>
          <span className="text-lg font-extrabold text-slate-900 mt-0.5">
            {precioFormateado}
          </span>
        </div>

        {isDisponible ? (
          <button
            onClick={handleWhatsAppAction}
            aria-label="Contactar por WhatsApp ahora"
            className="flex-1 max-w-xs h-12 rounded-xl bg-[#25D366] active:bg-[#20ba5a] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
            <span>Consultar por WhatsApp</span>
          </button>
        ) : (
          <button
            disabled
            className="flex-1 max-w-xs h-12 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
          >
            <span className="material-symbols-outlined text-[18px]">lock</span>
            <span>{isPausada ? 'Pausado' : 'Vendido'}</span>
          </button>
        )}
      </div>

      {/* Modal: Test Drive */}
      {showTestDriveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">calendar_month</span>
                <h3 className="text-lg font-bold text-slate-900">Agendar Test Drive</h3>
              </div>
              <button
                className="p-1 rounded-full hover:bg-slate-100 cursor-pointer"
                onClick={() => setShowTestDriveModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Coordiná tu prueba de manejo guiada para <strong>{tituloCompleto}</strong> ({codigoVehiculo}) en Showroom Vicente López.
            </p>
            <form className="flex flex-col gap-3" onSubmit={handleTestDriveSubmit}>
              <label className="flex flex-col text-xs text-slate-600 gap-1">
                Nombre completo
                <input
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="Ej: Juan Pérez"
                  required
                  type="text"
                  value={tdNombre}
                  onChange={(e) => setTdNombre(e.target.value)}
                />
              </label>
              <label className="flex flex-col text-xs text-slate-600 gap-1">
                Teléfono / WhatsApp
                <input
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="+54 9 11 ..."
                  required
                  type="tel"
                  value={tdTel}
                  onChange={(e) => setTdTel(e.target.value)}
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col text-xs text-slate-600 gap-1">
                  Fecha preferida
                  <input
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary"
                    required
                    type="date"
                    value={tdFecha}
                    onChange={(e) => setTdFecha(e.target.value)}
                  />
                </label>
                <label className="flex flex-col text-xs text-slate-600 gap-1">
                  Franja horaria
                  <select
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    value={tdFranja}
                    onChange={(e) => setTdFranja(e.target.value)}
                  >
                    <option>Mañana (10 a 13 hs)</option>
                    <option>Tarde (15 a 18 hs)</option>
                  </select>
                </label>
              </div>
              <button
                className="mt-2 py-3 rounded-xl bg-secondary text-white font-bold text-xs hover:bg-secondary-container shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                type="submit"
              >
                <span className="material-symbols-outlined text-sm">done_all</span>
                Confirmar Solicitud de Manejo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Permuta / Tasación */}
      {showPermutaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">swap_horiz</span>
                <h3 className="text-lg font-bold text-slate-900">Tasación de Vehículo Usado</h3>
              </div>
              <button
                className="p-1 rounded-full hover:bg-slate-100 cursor-pointer"
                onClick={() => setShowPermutaModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Entregá tu auto como parte de pago de <strong>{tituloCompleto}</strong>. Recibí cotización en 30 minutos.
            </p>
            <form className="flex flex-col gap-3" onSubmit={handlePermutaSubmit}>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col text-xs text-slate-600 gap-1">
                  Marca y Modelo
                  <input
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    placeholder="Ej: VW Vento 2.0"
                    required
                    type="text"
                    value={permutaModelo}
                    onChange={(e) => setPermutaModelo(e.target.value)}
                  />
                </label>
                <label className="flex flex-col text-xs text-slate-600 gap-1">
                  Año
                  <input
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    placeholder="2020"
                    required
                    type="number"
                    value={permutaAnio}
                    onChange={(e) => setPermutaAnio(e.target.value)}
                  />
                </label>
              </div>
              <label className="flex flex-col text-xs text-slate-600 gap-1">
                WhatsApp para enviarte la tasación
                <input
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  placeholder="+54 9 11 ..."
                  required
                  type="tel"
                  value={permutaTel}
                  onChange={(e) => setPermutaTel(e.target.value)}
                />
              </label>
              <button
                className="mt-2 py-3 rounded-xl bg-black text-white font-bold text-xs hover:bg-slate-800 shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                type="submit"
              >
                <span className="material-symbols-outlined text-sm">send</span>
                Solicitar Cotización Inmediata
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
