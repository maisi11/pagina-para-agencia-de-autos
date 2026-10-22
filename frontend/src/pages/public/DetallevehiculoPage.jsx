import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { PublicacionesService } from '../../services/publicaciones.service'
import { MetricasService } from '../../services/metricas.service'
import VehicleCard from '../../components/public/VehicleCard'

export default function DetallevehiculoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const whatsappPhone = import.meta.env.VITE_WHATSAPP_PHONE || '5491155608800'

  const [publicacion, setPublicacion] = useState(null)
  const [similares, setSimilares] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Media tabs y galería
  const [mediaTab, setMediaTab] = useState('photos') // 'photos' | 'video' | '360'
  const [fotoActiva, setFotoActiva] = useState(0)
  const [videoPlaying, setVideoPlaying] = useState(true)
  const [panoRotation, setPanoRotation] = useState(0)

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

  const fotos =
    multimedia && multimedia.length > 0
      ? multimedia.map((m) => m.urlArchMultimedia || m.url)
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
  const patente = vehiculo?.patente || 'En trámite'
  const carroceria = vehiculo?.tipoCarroceria?.nombreTipoCarroceria || vehiculo?.tipoCarroceria?.nombre || 'Sedán'
  const segmento = vehiculo?.segmento?.nombreSegmento || vehiculo?.segmento?.nombre || 'Segmento C'
  const condicion = vehiculo?.condicion?.nombreCondicion || vehiculo?.condicion?.nombre || 'Usado'
  const tapizado = vehiculo?.tipoTapizado?.nombreTipoTapizado || vehiculo?.tipoTapizado?.nombre || 'Cuero'
  const direccion = vehiculo?.tipoDireccion?.nombre || vehiculo?.tipoDireccion?.nombreTipoDireccion || 'Eléctrica'
  const motor = vehiculo?.motor
  const tipoMotor = motor?.tipoMotor?.nombreTipo || motor?.tipoMotor?.nombre || 'Combustión'
  const potencia = motor?.potencia ? `${motor.potencia} CV` : null
  const torque = motor?.torque ? `${motor.torque} Nm` : null
  const dimensiones = vehiculo?.dimensiones
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

  // Financiación
  const saldoAFinanciar = Math.max(0, precioUSD - downPayment)
  const cuotaMensual = loanTerm > 0 ? Math.round((saldoAFinanciar * 1.18) / loanTerm) : 0

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

      {/* Floating Scroll Navigation Controls */}
      <div className="fixed right-5 bottom-24 lg:bottom-20 z-40 flex flex-col gap-2">
        <button
          className="w-11 h-11 rounded-full bg-white text-slate-800 shadow-xl border border-slate-200 flex items-center justify-center hover:bg-secondary hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Subir al inicio"
          aria-label="Subir al inicio de la página"
        >
          <span className="material-symbols-outlined text-xl">arrow_upward</span>
        </button>
        <button
          className="w-11 h-11 rounded-full bg-white text-slate-800 shadow-xl border border-slate-200 flex items-center justify-center hover:bg-secondary hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer"
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          title="Bajar al pie"
          aria-label="Bajar al pie de la página"
        >
          <span className="material-symbols-outlined text-xl">arrow_downward</span>
        </button>
      </div>

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
             
              <span className="text-xs text-slate-500">
                COD: <strong className="font-mono text-slate-900">{codigoVehiculo}</strong>
              </span>
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
                    Video Walk-Around
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
                    src={fotos[fotoActiva]}
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
                  <button
                    className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur text-xs font-bold text-slate-900 hover:bg-secondary hover:text-white shadow transition-all cursor-pointer"
                    onClick={() => setMediaTab('video')}
                  >
                    <span className="material-symbols-outlined text-sm text-secondary">play_circle</span>
                    Ver Video &amp; Sonido Motor
                  </button>
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

              {/* Viewport 2: Video Walk-Around */}
              {mediaTab === 'video' && (
                <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-black shadow-inner flex flex-col justify-between p-4">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 filter brightness-75 scale-105"
                    style={{ backgroundImage: `url(${fotos[0]})` }}
                  ></div>
                  <div className="relative z-10 flex items-center justify-between text-white text-xs">
                    <span className="px-3 py-1 rounded bg-red-600/90 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                      WALK-AROUND OFICIAL APEX
                    </span>
                    <span className="font-mono bg-black/60 px-2 py-1 rounded">01:45 / 03:20</span>
                  </div>
                  <div className="relative z-10 self-center flex flex-col items-center gap-2">
                    <button
                      className="w-16 h-16 rounded-full bg-secondary text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      onClick={() => setVideoPlaying(!videoPlaying)}
                      aria-label={videoPlaying ? 'Pausar video' : 'Reproducir video'}
                    >
                      <span className="material-symbols-outlined text-3xl ml-0.5">
                        {videoPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </button>
                    <span className="bg-black/70 px-3 py-1 rounded-full text-white text-xs">
                      {videoPlaying ? 'Reproduciendo: Encendido y sonido motor' : 'En pausa'}
                    </span>
                  </div>
                  <div className="relative z-10 flex flex-col gap-2 pt-4 bg-gradient-to-t from-black/90 to-transparent">
                    <div
                      className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden cursor-pointer"
                      onClick={() => showToast('Avance en video simulado', 'smart_display')}
                    >
                      <div className="bg-secondary h-full rounded-full" style={{ width: '55%' }}></div>
                    </div>
                    <div className="flex items-center justify-between text-white text-xs">
                      <span>Capítulo: Exterior, Baúl &amp; Sonido Caño de Escape</span>
                      <button
                        className="text-white/80 hover:text-white flex items-center gap-1 cursor-pointer"
                        onClick={() => setMediaTab('photos')}
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                        Volver a Fotos
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Viewport 3: Tour 360 */}
              {mediaTab === '360' && (
                <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 shadow-inner flex flex-col justify-between p-4 select-none">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300"
                    style={{
                      backgroundImage: `url(${fotos[1] || fotos[0]})`,
                      transform: `scale(1.15) rotate(${panoRotation}deg)`,
                    }}
                  ></div>
                  <div className="relative z-10 flex items-center justify-between text-white text-xs">
                    <span className="px-3 py-1 rounded bg-black/60 font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-secondary animate-spin">360</span>
                      PANORAMA 360° HABITÁCULO
                    </span>
                    <div className="flex gap-1">
                      <button
                        className="p-1 rounded bg-black/70 hover:bg-black text-white cursor-pointer"
                        onClick={() => setPanoRotation((r) => r - 15)}
                        aria-label="Girar a la izquierda"
                      >
                        <span className="material-symbols-outlined text-sm">rotate_left</span>
                      </button>
                      <button
                        className="p-1 rounded bg-black/70 hover:bg-black text-white cursor-pointer"
                        onClick={() => setPanoRotation((r) => r + 15)}
                        aria-label="Girar a la derecha"
                      >
                        <span className="material-symbols-outlined text-sm">rotate_right</span>
                      </button>
                    </div>
                  </div>
                  <div className="relative z-10 self-center flex flex-wrap gap-2 justify-center">
                    <button
                      className="px-3 py-1 rounded-full bg-secondary/90 hover:bg-secondary text-white text-xs font-bold shadow-lg cursor-pointer"
                      onClick={() => showToast('Pantalla táctil compatible con Apple CarPlay y Android Auto', 'touch_app')}
                    >
                      Pantalla Central
                    </button>
                    <button
                      className="px-3 py-1 rounded-full bg-secondary/90 hover:bg-secondary text-white text-xs font-bold shadow-lg cursor-pointer"
                      onClick={() => showToast('Tapizados premium microperforados ergonómicos', 'airline_seat_recline_extra')}
                    >
                      Butacas de Cuero
                    </button>
                  </div>
                  <div className="relative z-10 text-center text-white/80 text-xs bg-black/60 py-1 px-3 rounded-full self-center">
                    Girá con los controles para inspeccionar cada detalle del interior
                  </div>
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
                    <img className="w-full h-full object-cover" src={url} alt={`Miniatura ${idx + 1}`} />
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
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <span className="material-symbols-outlined text-sm text-secondary">local_gas_station</span>
                  Combustible &amp; Carrocería
                </div>
                <span className="text-xl font-bold text-slate-900">{combustible}</span>
                <span className="text-xs text-slate-500">{carroceria} • {color}</span>
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
                    `Presentamos una unidad en estado inmaculado: ${tituloCompleto}. Perteneciente a su titular registral, servicios oficiales al día en concesionario oficial y tratamiento cerámico recién aplicado.`}
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
                <span className="text-xs font-mono font-bold text-slate-500">{patente}</span>
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
                      <span>Condición de Unidad:</span>
                      <span className="font-bold">{condicion}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded">
                      <span>Tapizado:</span>
                      <span className="font-bold">{tapizado}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-50">
                      <span>Tipo de Dirección:</span>
                      <span className="font-bold">{direccion}</span>
                    </div>
                    {dimensiones && (
                      <div className="flex justify-between p-2 rounded">
                        <span>Dimensiones (Largo × Ancho × Alto):</span>
                        <span className="font-bold font-mono">
                          {dimensiones.largo} × {dimensiones.ancho} × {dimensiones.alto} mm
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Seguridad & Confort */}
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
                      <span className="font-bold">{vehiculo?.cantidadAsientos || 5} asientos • {vehiculo?.cantidadPuertas || 5} puertas</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-50">
                      <span>Frenos &amp; Estabilidad:</span>
                      <span className="font-bold">ABS con EBD + Control de tracción ESP</span>
                    </div>
                    <div className="flex justify-between p-2 rounded">
                      <span>Anclajes Isofix:</span>
                      <span className="font-bold">Sí, para sillas infantiles</span>
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
                    Av. del Libertador 4580, Vicente López, Buenos Aires
                  </p>
                </div>
                <a
                  href="https://maps.google.com/?q=Av.+del+Libertador+4580,+Vicente+Lopez,+Buenos+Aires"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-secondary text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <span>Cómo Llegar</span>
                  <span className="material-symbols-outlined text-sm">directions</span>
                </a>
              </div>

              {/* Mapa Simulado / Tarjeta de Visita */}
              <div className="relative w-full h-56 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <iframe
                  title="Ubicación Showroom Apex Motors"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13146.46733271295!2d-58.485!3d-34.538!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb6a282f64e03%3A0x7d6a5c18e38520ec!2sAv.%20del%20Libertador%204580%2C%20Vicente%20L%C3%B3pez%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1710000000000"
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

              {/* Financing Module with Interactive Calculator */}
              <div className="p-4 rounded-xl bg-blue-50/50 flex flex-col gap-2 border border-blue-100" id="modulo-financiacion">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-secondary flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">account_balance</span>
                    Financiación Apex
                  </span>
                  <button
                    className="text-xs font-bold text-secondary hover:underline cursor-pointer"
                    onClick={() => setShowCalculator(!showCalculator)}
                  >
                    <span>{showCalculator ? 'Ocultar' : 'Calcular cuota'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-700 leading-snug">
                  Anticipo sugerido desde <strong>USD {Math.round(precioUSD * 0.4).toLocaleString('es-AR')}</strong> y saldo en hasta <strong>48 cuotas fijas o UVA</strong>.
                </p>

                {/* Interactive Embedded Loan Calculator */}
                {showCalculator && (
                  <div className="mt-2 pt-3 border-t border-blue-200/60 flex flex-col gap-2.5">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                        <span>Anticipo:</span>
                        <span className="font-bold text-secondary">
                          USD {downPayment.toLocaleString('es-AR')} ({precioUSD > 0 ? Math.round((downPayment / precioUSD) * 100) : 0}%)
                        </span>
                      </div>
                      <input
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-secondary"
                        max={precioUSD}
                        min={Math.round(precioUSD * 0.2)}
                        step={1000}
                        type="range"
                        value={downPayment}
                        onChange={(e) => setDownPayment(Number(e.target.value))}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Plazo cuotas:</span>
                      <div className="flex gap-1">
                        {[12, 24, 36, 48].map((term) => (
                          <button
                            key={term}
                            className={`px-2 py-0.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                              loanTerm === term
                                ? 'bg-secondary text-white'
                                : 'bg-white text-slate-700 border border-slate-200'
                            }`}
                            onClick={() => setLoanTerm(term)}
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-slate-500">Cuota mensual estimada:</div>
                        <div className="text-sm font-extrabold text-slate-900">
                          USD {cuotaMensual.toLocaleString('es-AR')} / mes
                        </div>
                      </div>
                      <button
                        className="px-3 py-1 rounded bg-black text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                        onClick={handleWhatsAppAction}
                        disabled={!isDisponible}
                      >
                        Solicitar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Primary WhatsApp CTA (DESKTOP) */}
              <div className="flex flex-col gap-2">
                {isDisponible ? (
                  <button
                    className="w-full py-4 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all cursor-pointer active:scale-95"
                    onClick={handleWhatsAppAction}
                  >
                    <span className="material-symbols-outlined text-[22px]">chat</span>
                    <span>Consultar por WhatsApp con Asesor</span>
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
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow">
                    {asesorIniciales}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                </div>
                <div className="flex flex-col text-xs">
                  <span className="font-bold text-slate-900">{asesorNombre}</span>
                  <span className="text-slate-500 text-[11px]">Asesor Comercial Apex</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
                    <span className="material-symbols-outlined text-xs">bolt</span>
                    Responde en menos de 5 min
                  </span>
                </div>
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
                <span className="material-symbols-outlined text-sm text-emerald-600 shrink-0 mt-0.5">price_check</span>
                <div>
                  <strong className="text-slate-900">Aceptamos Dólar / Cripto:</strong> Opciones seguras y convenientes.
                </div>
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

      {/* =========================================================================
          STICKY BOTTOM ACTION BAR (SOLO MOBILE / ZONA DE ALCANCE DEL PULGAR)
          ========================================================================= */}
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
