import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CatalogosService } from '../../services/catalogos.service'
import { PublicacionesService } from '../../services/publicaciones.service'
import { MetricasService } from '../../services/metricas.service'
import VehicleCard from '../../components/public/VehicleCard'

function formatPhoneNumber(phone) {
  if (!phone) return '+54 9 11 5560-8800'
  const clean = String(phone).replace(/\D/g, '')
  if (clean.startsWith('549') && clean.length === 13) {
    return `+54 9 ${clean.slice(3, 6)} ${clean.slice(6, 9)}-${clean.slice(9)}`
  }
  if (clean.startsWith('54') && clean.length === 12) {
    return `+54 ${clean.slice(2, 4)} ${clean.slice(4, 8)}-${clean.slice(8)}`
  }
  return `+${clean}`
}

export default function HomePage() {
  const navigate = useNavigate()
  const [catalogos, setCatalogos] = useState(null)
  const [destacados, setDestacados] = useState([])
  const [cargando, setCargando] = useState(true)

  // Estados de la consola de búsqueda rápida
  const [filtroMarca, setFiltroMarca] = useState('all')
  const [filtroCarroceria, setFiltroCarroceria] = useState('all')
  const [filtroPrecio, setFiltroPrecio] = useState('all')

  // Estado del formulario de visita
  const [visitaForm, setVisitaForm] = useState({
    nombre: '',
    telefono: '',
    vehiculo: '',
    comentario: '',
  })
  const [visitaEnviada, setVisitaEnviada] = useState(false)

  const whatsappPhone = import.meta.env.VITE_WHATSAPP_PHONE || 'Error al cargar el numero de telefono'
  const formattedPhone = formatPhoneNumber(whatsappPhone)
  const direccionShowroom = import.meta.env.VITE_UBICACION || 'Error al caragr la ubicacion'
  const urlMapaEmbebido =  `https://www.google.com/maps?q=${encodeURIComponent(direccionShowroom)}&output=embed`
  const urlGoogleMaps = `https://maps.google.com/?q=${encodeURIComponent(direccionShowroom)}`

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [cats, pubs] = await Promise.all([
          CatalogosService.obtenerTodos().catch(() => null),
          PublicacionesService.listar().catch(() => []),
        ])

        if (cats) setCatalogos(cats)
        if (Array.isArray(pubs)) {
          setDestacados(pubs.slice(0, 4))
          if (pubs.length > 0 && !visitaForm.vehiculo) {
            setVisitaForm((prev) => ({ ...prev, vehiculo: pubs[0].titulo }))
          }
        }
      } catch (err) {
        console.error('Error cargando datos de inicio:', err)
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [])

  const handleBuscar = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (filtroMarca !== 'all') params.append('marca', filtroMarca)
    if (filtroCarroceria !== 'all') params.append('carroceria', filtroCarroceria)
    if (filtroPrecio !== 'all') params.append('precioMax', filtroPrecio)
    navigate(`/catalogo?${params.toString()}`)
  }

  const handleVisitaSubmit = async (e) => {
    e.preventDefault()
    try {
      await MetricasService.registrarEvento('AGENDAR_VISITA', visitaForm)
    } catch (err) {
      console.warn('Error registrando evento de visita:', err)
    }
    setVisitaEnviada(true)
    setTimeout(() => setVisitaEnviada(false), 5000)
    setVisitaForm({
      nombre: '',
      telefono: '',
      vehiculo: 'Toyota Hilux SRX 4x4 2024',
      comentario: '',
    })
  }

  return (
    <div className="flex flex-col w-full bg-[#F8FAFC] selection:bg-[#2563EB] selection:text-white">
  
      <section className="relative w-full bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC] py-16 lg:py-24 border-b border-slate-200" id="hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">

          {/* Hero Content Centrado en el Medio */}
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-14">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-extrabold uppercase tracking-wider shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping"></span>
                Stock Homologado • Entrega Inmediata
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
                Garantía Certificada y Transferencia Inmediata
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.12] mb-5">
              Vehículos seleccionados y certificados con{' '}
              <span className="text-[#2563EB] underline decoration-blue-200 underline-offset-8">
                garantía total.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8">
              Concesionaria oficial multimarca. Financiación a medida en cuotas fijas o UVA, toma de usados llave por llave y documentación lista para transferir en el día.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/catalogo"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>Explorar Catálogo Completo</span>
                <span className="material-symbols-outlined text-base">arrow_downward</span>
              </Link>
              <a
                href="#showroom"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('showroom')?.scrollIntoView({ behavior: 'smooth' })
                  window.history.pushState(null, '', '/#showroom')
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-sm transition-colors shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-base text-[#2563EB]">location_on</span>
                <span>Ver Showroom</span>
              </a>
            </div>
          </div>

          {/* Cierre del Z-Pattern: Consola de Búsqueda de Alto Contraste */}
          <div className="w-full bg-white rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200">
            <form onSubmit={handleBuscar} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {/* Selector de Marca */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#2563EB]">directions_car</span>
                  Marca
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-slate-800 font-semibold appearance-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] focus:bg-white cursor-pointer"
                    value={filtroMarca}
                    onChange={(e) => setFiltroMarca(e.target.value)}
                  >
                    <option value="all">Todas las marcas</option>
                    {catalogos?.marcas ? (
                      catalogos.marcas.map((m) => (
                        <option key={m.idMarca ?? m.id} value={m.nombreMarca ?? m.nombre}>
                          {m.nombreMarca ?? m.nombre}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Toyota">Toyota</option>
                        <option value="Volkswagen">Volkswagen</option>
                        <option value="Ford">Ford</option>
                        <option value="Audi">Audi</option>
                        <option value="Jeep">Jeep</option>
                        <option value="Peugeot">Peugeot</option>
                      </>
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Selector de Carrocería */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#2563EB]">tune</span>
                  Carrocería
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-slate-800 font-semibold appearance-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] focus:bg-white cursor-pointer"
                    value={filtroCarroceria}
                    onChange={(e) => setFiltroCarroceria(e.target.value)}
                  >
                    <option value="all">Todas las carrocerías</option>
                    {catalogos?.carrocerias ? (
                      catalogos.carrocerias.map((c) => (
                        <option key={c.idTipoCarroceria ?? c.id} value={c.nombreTipoCarroceria ?? c.nombre}>
                          {c.nombreTipoCarroceria ?? c.nombre}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Pick-up">Pick-up / Utilitario</option>
                        <option value="SUV">SUV / Crossover</option>
                        <option value="Sedán">Sedán Ejecutivo</option>
                        <option value="Hatchback">Hatchback</option>
                      </>
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Selector de Presupuesto Máximo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#2563EB]">payments</span>
                  Presupuesto Máximo
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-slate-800 font-semibold appearance-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] focus:bg-white cursor-pointer"
                    value={filtroPrecio}
                    onChange={(e) => setFiltroPrecio(e.target.value)}
                  >
                    <option value="all">Sin límite de precio</option>
                    <option value="25000">Hasta USD 25,000</option>
                    <option value="35000">Hasta USD 35,000</option>
                    <option value="50000">Hasta USD 50,000</option>
                    <option value="60000">Hasta USD 60,000</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Botón Buscar (10% Acento Cobalt Blue) */}
              <div>
                <button
                  type="submit"
                  className="w-full h-[48px] rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/25 active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">search</span>
                  <span>Buscar Vehículos</span>
                </button>
              </div>
            </form>

            {/* Badges de Confianza al pie del Buscador */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-[#0F172A]">Documentación Verificada</p>
                  <p className="text-xs text-slate-500">Libre de deudas y lista para transferir</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">shield</span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-[#0F172A]">Garantía mecánica 12 meses</p>
                  <p className="text-xs text-slate-500">Motor, caja y transmisión cubierta</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">description</span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-[#0F172A]">Gestoría Propia en Salón</p>
                  <p className="text-xs text-slate-500">Transferencia en el día sin demoras</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="w-full bg-[#F8FAFC] py-16 lg:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#2563EB] font-extrabold">
                Unidades Seleccionadas
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-1">
                Destacados con Entrega Inmediata
              </h2>
            </div>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#2563EB] hover:underline"
            >
              <span>Ver catálogo completo</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          {cargando ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-84 animate-pulse border border-slate-200"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {destacados.map((pub) => (
                <VehicleCard key={pub.idPublicacion ?? pub.id} publicacion={pub} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          FINANCIAMIENTO & SERVICIOS (#servicios)
          ========================================================================= */}
      <section className="w-full bg-white py-16 lg:py-24 border-b border-slate-200 scroll-mt-32" id="servicios">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="max-w-3xl mb-14">
            <span className="text-xs uppercase tracking-widest text-[#2563EB] font-extrabold">
              Servicios Integrales Apex
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mt-1">
              Financiamiento a Medida &amp; Servicios Certificados
            </h2>
            <p className="text-base text-slate-600 mt-2">
              Brindamos soluciones financieras y periciales ágiles para que accedas a tu próximo vehículo con absoluta tranquilidad y transparencia.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pilar 1: Calidad Certificada */}
            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-[#2563EB] hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[28px]">verified</span>
                </div>
                <h3 className="text-xl font-extrabold text-[#0F172A] mb-3">Garantía Mecánica y Calidad</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Revisión mecánica integral de motor, transmisión, frenos y tren rodante. Cobertura de 12 meses extendible para que manejes con absoluta tranquilidad.
                </p>
              </div>
      
            </div>

            {/* Pilar 2: Financiación */}
            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-[#2563EB] hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[28px]">account_balance</span>
                </div>
                <h3 className="text-xl font-extrabold text-[#0F172A] mb-3">Financiamiento Prendario Flexible</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Financiamos hasta el 60% del valor de la unidad en cuotas fijas en pesos, créditos UVA o dólares billete con aprobación express en 24 horas y tasas preferenciales bancarias.
                </p>
              </div>
            </div>

            {/* Pilar 3: Permuta */}
            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-[#2563EB] hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[28px]">sync_alt</span>
                </div>
                <h3 className="text-xl font-extrabold text-[#0F172A] mb-3">Tasación y Toma de Usados</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Cotización profesional en el día de tu vehículo usado al mejor valor del mercado. Realizá la operación llave contra llave sin quedarte sin movilidad ni un solo día.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECCIÓN NOSOTROS (#nosotros)
          ========================================================================= */}
      <section className="w-full bg-[#0F172A] text-white py-16 lg:py-20 scroll-mt-32" id="nosotros">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <span className="text-xs uppercase tracking-widest text-blue-400 font-extrabold">
                Trayectoria &amp; Excelencia
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-2 text-white">
                Más de una década liderando el mercado de vehículos premium y utilitarios.
              </h2>
              <p className="text-slate-300 mt-4 leading-relaxed text-sm sm:text-base">
                En Apex Motors combinamos calidad certificada, atención personalizada y asesoría integral de posventa. Nuestro showroom de Vicente López cuenta con los más altos estándares para que tu experiencia de compra sea transparente y satisfactoria.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                  <span className="material-symbols-outlined text-emerald-400 text-base">verified</span>
                  Gestoría propia y trámites inmediatos
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                  <span className="material-symbols-outlined text-emerald-400 text-base">verified</span>
                  Entrega a todo el país
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 grid grid-cols-2 gap-4 sm:gap-6">
              <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-blue-400">+12</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">Años de Trayectoria</div>
              </div>
              <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">+4.500</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">Operaciones Cerradas</div>
              </div>
              <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-white">98%</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">Satisfacción de Clientes</div>
              </div>
              <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-blue-400">2.000 m²</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">Showroom Cubierto</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SHOWROOM, HORARIOS & CONTACTO (#showroom)
          ========================================================================= */}
      <section className="w-full bg-[#F8FAFC] py-16 lg:py-24 scroll-mt-32" id="showroom">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="max-w-2xl mb-12">
            <span className="text-xs uppercase tracking-widest text-[#2563EB] font-extrabold">
              Atención Personalizada
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mt-1">
              Visitanos en nuestro Showroom
            </h2>
            <p className="text-base text-slate-600 mt-2">
              Acercate a conocer el stock en persona, realizar pruebas de manejo guiadas y recibir asesoramiento en nuestro espacio de Vicente López.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Columna Izquierda: Mapa Google Maps Real & Datos Directos */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Mapa Google Maps Real */}
              <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 relative bg-slate-100 shadow-sm">
                <iframe
                  title="Ubicación Showroom Apex Motors"
                  src= {urlMapaEmbebido}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>

              {/* Horarios y Líneas de Atención */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Horarios */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2563EB] flex items-center gap-1.5 mb-3">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    Horarios de Atención
                  </h4>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-800">Lunes a Viernes:</span>
                      <span>09:00 - 19:30 hs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-800">Sábados:</span>
                      <span>09:30 - 18:00 hs</span>
                    </div>
                   
                  </div>
                </div>

                {/* Teléfonos & WhatsApp (Verde Oficial Exclusivo #25D366) */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2563EB] flex items-center gap-1.5 mb-3">
                    <span className="material-symbols-outlined text-[16px]">call</span>
                    Líneas Directas
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <a
                      className="flex items-center gap-2 text-slate-700 hover:text-[#2563EB] font-semibold"
                      href={`tel:+${whatsappPhone}`}
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#2563EB]">call</span>
                      {formattedPhone} (Central)
                    </a>
                    <a
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs shadow-sm transition-all"
                      href={`https://wa.me/${whatsappPhone}`}
                      rel="noopener noreferrer"
                      target="_blank"
                      onClick={() => MetricasService.registrarEvento('CLICK_WHATSAPP')}
                    >
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                      <span>{formattedPhone} (WhatsApp)</span>
                    </a>
                    <p className="text-slate-500 text-[11px] pt-1">ventas@apexmotors.com.ar</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Formulario Agendar Test Drive */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xl">
              <h3 className="text-xl font-extrabold text-[#0F172A] mb-1">Agendar Visita / Test Drive</h3>
              <p className="text-xs text-slate-500 mb-6">
                Completá tus datos y un asesor confirmará el turno en menos de 15 minutos.
              </p>

              {visitaEnviada && (
                <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                  <span>¡Solicitud enviada con éxito! Un asesor se contactará para coordinar tu visita.</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleVisitaSubmit}>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre Completo
                  </label>
                  <input
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    placeholder="Ej: Mariano Rodríguez"
                    required
                    type="text"
                    value={visitaForm.nombre}
                    onChange={(e) => setVisitaForm({ ...visitaForm, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    placeholder="Ej: +54 9 11 1234-5678"
                    required
                    type="tel"
                    value={visitaForm.telefono}
                    onChange={(e) => setVisitaForm({ ...visitaForm, telefono: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Vehículo de Interés
                  </label>
                  <select
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] cursor-pointer"
                    value={visitaForm.vehiculo}
                    onChange={(e) => setVisitaForm({ ...visitaForm, vehiculo: e.target.value })}
                  >
                    {destacados.map((pub) => (
                      <option key={pub.idPublicacion ?? pub.id} value={pub.titulo}>
                        {pub.titulo}
                      </option>
                    ))}
                    <option value="Otro modelo del catálogo">Otro modelo del catálogo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Comentario o Consulta (Opcional)
                  </label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    placeholder="¿Querés entregar un vehículo en parte de pago o consultar financiación?"
                    rows="3"
                    value={visitaForm.comentario}
                    onChange={(e) => setVisitaForm({ ...visitaForm, comentario: e.target.value })}
                  ></textarea>
                </div>
                <button
                  className="w-full py-3.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold transition-all shadow-md shadow-blue-500/25 active:scale-95 cursor-pointer"
                  type="submit"
                >
                  Confirmar Solicitud de Visita
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
