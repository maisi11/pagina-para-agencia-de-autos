import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PublicacionesService } from '../../services/publicaciones.service'
import { CatalogosService } from '../../services/catalogos.service'
import VehicleCard from '../../components/public/VehicleCard'

export default function CatalogoPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [publicaciones, setPublicaciones] = useState([])
  const [catalogos, setCatalogos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Mobile Drawer State
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Filtros reactivos sincronizados con URL SearchParams
  const [busquedaTexto, setBusquedaTexto] = useState(searchParams.get('q') || '')
  const [marcaFiltro, setMarcaFiltro] = useState(searchParams.get('marca') || '')
  const [modeloFiltro, setModeloFiltro] = useState(searchParams.get('modelo') || '')
  const [carroceriaFiltro, setCarroceriaFiltro] = useState(searchParams.get('carroceria') || '')
  const [segmentoFiltro, setSegmentoFiltro] = useState(searchParams.get('segmento') || '')
  const [condicionFiltro, setCondicionFiltro] = useState(searchParams.get('condicion') || '')
  const [cajaFiltro, setCajaFiltro] = useState(searchParams.get('caja') || '')
  const [combustibleFiltro, setCombustibleFiltro] = useState(searchParams.get('combustible') || '')
  const [traccionFiltro, setTraccionFiltro] = useState(searchParams.get('traccion') || '')
  const [tipoMotorFiltro, setTipoMotorFiltro] = useState(searchParams.get('tipoMotor') || '')
  const [tapizadoFiltro, setTapizadoFiltro] = useState(searchParams.get('tapizado') || '')
  const [direccionFiltro, setDireccionFiltro] = useState(searchParams.get('direccion') || '')
  const [precioMinFiltro, setPrecioMinFiltro] = useState(searchParams.get('precioMin') || '')
  const [precioMaxFiltro, setPrecioMaxFiltro] = useState(searchParams.get('precioMax') || '')
  const [anioDesdeFiltro, setAnioDesdeFiltro] = useState(searchParams.get('anioDesde') || '')
  const [anioHastaFiltro, setAnioHastaFiltro] = useState(searchParams.get('anioHasta') || '')
  const [orden, setOrden] = useState('recientes')

  const anioActual = new Date().getFullYear()
  const listaAnios = Array.from({ length: anioActual - 2014 }, (_, i) => anioActual - i)

  useEffect(() => {
    async function cargarDatos() {
      try {
        setCargando(true)
        const [pubData, catData] = await Promise.all([
          PublicacionesService.listar(),
          CatalogosService.obtenerTodos().catch(() => null),
        ])
        setPublicaciones(pubData || [])
        setCatalogos(catData || null)
      } catch (err) {
        console.error('Error cargando catálogo:', err)
        setError('No pudimos conectar con el servidor. Verificá que el backend esté encendido.')
      } finally {
        setTimeout(() => setCargando(false), 200)
      }
    }

    cargarDatos()
  }, [])

  // Modelos filtrados según la marca seleccionada
  const modelosDisponibles = catalogos?.modelos
    ? marcaFiltro
      ? catalogos.modelos.filter((m) => {
          const mNom = m.marca?.nombreMarca || m.marca?.nombre || ''
          const mId = m.idMarca
          return (
            String(mId) === String(marcaFiltro) ||
            mNom.toLowerCase() === String(marcaFiltro).toLowerCase()
          )
        })
      : catalogos.modelos
    : []

  // Filtrado multivariable
  const publicacionesFiltradas = publicaciones.filter((pub) => {
    const v = pub.vehiculo || {}

    // 1. Texto libre (Buscador general)
    const mNom = v.modelo?.marca?.nombreMarca ?? v.modelo?.marca?.nombre ?? ''
    const modNom = v.modelo?.nombreModelo ?? v.modelo?.nombre ?? ''
    const texto = `${mNom} ${modNom} ${v.version?.nombreVersion || ''} ${pub.titulo || ''}`.toLowerCase()
    const matchTexto = !busquedaTexto || texto.includes(busquedaTexto.toLowerCase().trim())

    // 2. Marca
    const mId = v.modelo?.marca?.idMarca ?? v.idMarca
    const matchMarca =
      !marcaFiltro ||
      String(mId) === String(marcaFiltro) ||
      mNom.toLowerCase() === String(marcaFiltro).toLowerCase()

    // 3. Modelo
    const modId = v.modelo?.idModelo ?? v.idModelo
    const matchModelo =
      !modeloFiltro ||
      String(modId) === String(modeloFiltro) ||
      modNom.toLowerCase().includes(String(modeloFiltro).toLowerCase())

    // 4. Carrocería
    const carrNom = v.tipoCarroceria?.nombreTipoCarroceria ?? ''
    const matchCarroceria =
      !carroceriaFiltro ||
      carrNom.toLowerCase() === String(carroceriaFiltro).toLowerCase() ||
      String(v.idTipoCarroceria) === String(carroceriaFiltro)

    // 5. Segmento
    const segNom = v.segmento?.nombreSegmento ?? ''
    const matchSegmento =
      !segmentoFiltro ||
      segNom.toLowerCase() === String(segmentoFiltro).toLowerCase() ||
      String(v.idSegmento) === String(segmentoFiltro)

    // 6. Condición
    const condNom = v.condicion?.nombreCondicion ?? ''
    const matchCondicion =
      !condicionFiltro ||
      condNom.toLowerCase() === String(condicionFiltro).toLowerCase() ||
      String(v.idCondicion) === String(condicionFiltro)

    // 7. Caja
    const cajaNom = v.caja?.nombreCaja ?? ''
    const matchCaja =
      !cajaFiltro ||
      cajaNom.toLowerCase() === String(cajaFiltro).toLowerCase() ||
      String(v.idCaja) === String(cajaFiltro)

    // 8. Combustible
    const combNom = v.combustible?.nombreCombustible ?? ''
    const matchCombustible =
      !combustibleFiltro ||
      combNom.toLowerCase() === String(combustibleFiltro).toLowerCase() ||
      String(v.idCombustible) === String(combustibleFiltro)

    // 9. Tracción
    const tracNom = v.traccion?.nombreTraccion ?? ''
    const matchTraccion =
      !traccionFiltro ||
      tracNom.toLowerCase() === String(traccionFiltro).toLowerCase() ||
      String(v.idTraccion) === String(traccionFiltro)

    // 10. Tipo de Motor
    const motNom = v.motor?.tipoMotor?.nombreTipo ?? ''
    const matchTipoMotor =
      !tipoMotorFiltro ||
      motNom.toLowerCase() === String(tipoMotorFiltro).toLowerCase() ||
      String(v.motor?.idTipoMotor) === String(tipoMotorFiltro)

    // 11. Tapizado
    const tapNom = v.tipoTapizado?.nombreTipoTapizado ?? ''
    const matchTapizado =
      !tapizadoFiltro ||
      tapNom.toLowerCase() === String(tapizadoFiltro).toLowerCase() ||
      String(v.idTipoTapizado) === String(tapizadoFiltro)

    // 12. Dirección
    const dirNom = v.tipoDireccion?.nombre ?? ''
    const matchDireccion =
      !direccionFiltro ||
      dirNom.toLowerCase() === String(direccionFiltro).toLowerCase() ||
      String(v.idTipoDireccion) === String(direccionFiltro)

    // 13. Rango de Precios
    const precio = Number(pub.precio)
    const matchPrecioMin = !precioMinFiltro || precio >= Number(precioMinFiltro)
    const matchPrecioMax = !precioMaxFiltro || precio <= Number(precioMaxFiltro)

    // 14. Rango de Años
    const anioVehiculo = Number(v.anio)
    const matchAnioDesde = !anioDesdeFiltro || anioVehiculo >= Number(anioDesdeFiltro)
    const matchAnioHasta = !anioHastaFiltro || anioVehiculo <= Number(anioHastaFiltro)

    return (
      matchTexto &&
      matchMarca &&
      matchModelo &&
      matchCarroceria &&
      matchSegmento &&
      matchCondicion &&
      matchCaja &&
      matchCombustible &&
      matchTraccion &&
      matchTipoMotor &&
      matchTapizado &&
      matchDireccion &&
      matchPrecioMin &&
      matchPrecioMax &&
      matchAnioDesde &&
      matchAnioHasta
    )
  })

  // Ordenamiento
  const publicacionesOrdenadas = [...publicacionesFiltradas].sort((a, b) => {
    if (orden === 'menor-precio') return Number(a.precio) - Number(b.precio)
    if (orden === 'mayor-precio') return Number(b.precio) - Number(a.precio)
    const kmA = Number(a.vehiculo?.kilometros ?? 0)
    const kmB = Number(b.vehiculo?.kilometros ?? 0)
    if (orden === 'km') return kmA - kmB
    const idA = a.idPublicacion ?? a.id ?? 0
    const idB = b.idPublicacion ?? b.id ?? 0
    return idB - idA
  })

  // Limpiar todos los filtros
  const handleLimpiarFiltros = () => {
    setBusquedaTexto('')
    setMarcaFiltro('')
    setModeloFiltro('')
    setCarroceriaFiltro('')
    setSegmentoFiltro('')
    setCondicionFiltro('')
    setCajaFiltro('')
    setCombustibleFiltro('')
    setTraccionFiltro('')
    setTipoMotorFiltro('')
    setTapizadoFiltro('')
    setDireccionFiltro('')
    setPrecioMinFiltro('')
    setPrecioMaxFiltro('')
    setAnioDesdeFiltro('')
    setAnioHastaFiltro('')
    setOrden('recientes')
    setSearchParams({})
  }

  // Contar cantidad de filtros activos
  const filtrosActivos = [
    busquedaTexto ? { id: 'q', label: `"${busquedaTexto}"`, clear: () => setBusquedaTexto('') } : null,
    marcaFiltro ? { id: 'marca', label: `Marca: ${marcaFiltro}`, clear: () => setMarcaFiltro('') } : null,
    modeloFiltro ? { id: 'modelo', label: `Modelo: ${modeloFiltro}`, clear: () => setModeloFiltro('') } : null,
    carroceriaFiltro ? { id: 'carroceria', label: `Carrocería: ${carroceriaFiltro}`, clear: () => setCarroceriaFiltro('') } : null,
    segmentoFiltro ? { id: 'segmento', label: `Segmento: ${segmentoFiltro}`, clear: () => setSegmentoFiltro('') } : null,
    condicionFiltro ? { id: 'condicion', label: `Condición: ${condicionFiltro}`, clear: () => setCondicionFiltro('') } : null,
    cajaFiltro ? { id: 'caja', label: `Transmisión: ${cajaFiltro}`, clear: () => setCajaFiltro('') } : null,
    combustibleFiltro ? { id: 'combustible', label: `Combustible: ${combustibleFiltro}`, clear: () => setCombustibleFiltro('') } : null,
    traccionFiltro ? { id: 'traccion', label: `Tracción: ${traccionFiltro}`, clear: () => setTraccionFiltro('') } : null,
    tipoMotorFiltro ? { id: 'tipoMotor', label: `Motor: ${tipoMotorFiltro}`, clear: () => setTipoMotorFiltro('') } : null,
    tapizadoFiltro ? { id: 'tapizado', label: `Tapizado: ${tapizadoFiltro}`, clear: () => setTapizadoFiltro('') } : null,
    direccionFiltro ? { id: 'direccion', label: `Dirección: ${direccionFiltro}`, clear: () => setDireccionFiltro('') } : null,
    precioMinFiltro || precioMaxFiltro
      ? {
          id: 'precio',
          label: `Precio: ${precioMinFiltro ? `$${Number(precioMinFiltro).toLocaleString()}` : '$0'} - ${
            precioMaxFiltro ? `$${Number(precioMaxFiltro).toLocaleString()}` : 'Sin tope'
          }`,
          clear: () => {
            setPrecioMinFiltro('')
            setPrecioMaxFiltro('')
          },
        }
      : null,
    anioDesdeFiltro || anioHastaFiltro
      ? {
          id: 'anio',
          label: `Año: ${anioDesdeFiltro || '2015'} - ${anioHastaFiltro || anioActual}`,
          clear: () => {
            setAnioDesdeFiltro('')
            setAnioHastaFiltro('')
          },
        }
      : null,
  ].filter(Boolean)

  // =========================================================================
  // FILTROS ESTRUCTURADOS CON BUSCADOR ARRIBA Y DESPLEGABLES PARAMÉTRICOS
  // =========================================================================
  const FilterControls = () => (
    <div className="space-y-5">
      {/* 1. BUSCADOR POR PALABRA CLAVE (Arriba de todo según UX) */}
      <div className="space-y-1.5 pb-4 border-b border-slate-100">
        <label className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#2563EB]">search</span>
          Buscar por Palabra Clave
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Ej: Hilux, 4x4, Automática..."
            value={busquedaTexto}
            onChange={(e) => setBusquedaTexto(e.target.value)}
            className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all"
          />
          {busquedaTexto && (
            <button
              onClick={() => setBusquedaTexto('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
            </button>
          )}
        </div>
      </div>
            {/* 13. Rango de Precios (USD) con 'Menos de...' y 'Más de...' */}
      <div className="space-y-2 pb-4 border-b border-slate-100">
        <label className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider block">
          Rango de Precio (USD)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-500 font-bold block mb-1">Desde</span>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={precioMinFiltro}
              onChange={(e) => setPrecioMinFiltro(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold block mb-1">Hasta</span>
            <input
              type="number"
              min="0"
              placeholder="Sin tope"
              value={precioMaxFiltro}
              onChange={(e) => setPrecioMaxFiltro(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => {
              setPrecioMinFiltro('')
              setPrecioMaxFiltro('25000')
            }}
            className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-bold transition-colors cursor-pointer ${
              precioMaxFiltro === '25000' && !precioMinFiltro
                ? 'bg-[#2563EB] text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Menos de USD 25.000
          </button>
          <button
            type="button"
            onClick={() => {
              setPrecioMinFiltro('25000')
              setPrecioMaxFiltro('45000')
            }}
            className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-bold transition-colors cursor-pointer ${
              precioMinFiltro === '25000' && precioMaxFiltro === '45000'
                ? 'bg-[#2563EB] text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            USD 25.000 a USD 45.000
          </button>
          <button
            type="button"
            onClick={() => {
              setPrecioMinFiltro('45000')
              setPrecioMaxFiltro('')
            }}
            className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-bold transition-colors cursor-pointer ${
              precioMinFiltro === '45000' && !precioMaxFiltro
                ? 'bg-[#2563EB] text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Más de USD 45.000
          </button>
        </div>
      </div>

      {/* 14. Rango de Años */}
      <div className="space-y-2">
        <label className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider block">
          Año del Vehículo
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-500 font-bold block mb-1">Desde</span>
            <select
              value={anioDesdeFiltro}
              onChange={(e) => setAnioDesdeFiltro(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
            >
              <option value="">Cualquiera</option>
              {listaAnios.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold block mb-1">Hasta</span>
            <select
              value={anioHastaFiltro}
              onChange={(e) => setAnioHastaFiltro(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
            >
              <option value="">Cualquiera</option>
              {listaAnios.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Marca */}
      <div className="space-y-1.5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#2563EB]">directions_car</span>
            Marca
          </label>
          {marcaFiltro && (
            <button onClick={() => setMarcaFiltro('')} className="text-[10px] text-[#2563EB] font-bold hover:underline cursor-pointer">
              Limpiar
            </button>
          )}
        </div>
        <select
          value={marcaFiltro}
          onChange={(e) => {
            setMarcaFiltro(e.target.value)
            setModeloFiltro('')
          }}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all cursor-pointer"
        >
          <option value="">Todas las marcas</option>
          {catalogos?.marcas?.map((m) => {
            const nom = m.nombreMarca ?? m.nombre
            return (
              <option key={m.idMarca ?? m.id} value={nom}>
                {nom}
              </option>
            )
          })}
        </select>
      </div>

      {/* 3. Modelo (En cascada según la marca seleccionada) */}
      <div className="space-y-1.5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#2563EB]">model_training</span>
            Modelo
          </label>
          {modeloFiltro && (
            <button onClick={() => setModeloFiltro('')} className="text-[10px] text-[#2563EB] font-bold hover:underline cursor-pointer">
              Limpiar
            </button>
          )}
        </div>
        <select
          value={modeloFiltro}
          onChange={(e) => setModeloFiltro(e.target.value)}
          disabled={modelosDisponibles.length === 0}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all disabled:opacity-50 cursor-pointer"
        >
          <option value="">
            {marcaFiltro ? `Todos los modelos de ${marcaFiltro}` : 'Todos los modelos'}
          </option>
          {modelosDisponibles.map((m) => {
            const nom = m.nombreModelo ?? m.nombre
            return (
              <option key={m.idModelo ?? m.id} value={nom}>
                {nom}
              </option>
            )
          })}
        </select>
      </div>

      {/* 4. Carrocería (Desplegable conectado a la BD) */}
      <div className="space-y-1.5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#2563EB]">directions_car_filled</span>
            Tipo de Carrocería
          </label>
          {carroceriaFiltro && (
            <button onClick={() => setCarroceriaFiltro('')} className="text-[10px] text-[#2563EB] font-bold hover:underline cursor-pointer">
              Limpiar
            </button>
          )}
        </div>
        <select
          value={carroceriaFiltro}
          onChange={(e) => setCarroceriaFiltro(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all cursor-pointer"
        >
          <option value="">Todas las carrocerías</option>
          {catalogos?.carrocerias?.map((c) => {
            const nom = c.nombreTipoCarroceria ?? c.nombre
            return (
              <option key={c.idTipoCarroceria ?? c.id} value={nom}>
                {nom}
              </option>
            )
          })}
        </select>
      </div>

      {/* 5. Segmento (Desplegable conectado a la BD) */}
      <div className="space-y-1.5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#2563EB]">category</span>
            Segmento
          </label>
          {segmentoFiltro && (
            <button onClick={() => setSegmentoFiltro('')} className="text-[10px] text-[#2563EB] font-bold hover:underline cursor-pointer">
              Limpiar
            </button>
          )}
        </div>
        <select
          value={segmentoFiltro}
          onChange={(e) => setSegmentoFiltro(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all cursor-pointer"
        >
          <option value="">Todos los segmentos</option>
          {catalogos?.segmentos?.map((s) => {
            const nom = s.nombreSegmento ?? s.nombre
            return (
              <option key={s.idSegmento ?? s.id} value={nom}>
                {nom}
              </option>
            )
          })}
        </select>
      </div>

      {/* 6. Condición (0km, Usado, Nuevo) */}
      <div className="space-y-1.5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#2563EB]">new_releases</span>
            Condición
          </label>
          {condicionFiltro && (
            <button onClick={() => setCondicionFiltro('')} className="text-[10px] text-[#2563EB] font-bold hover:underline cursor-pointer">
              Limpiar
            </button>
          )}
        </div>
        <select
          value={condicionFiltro}
          onChange={(e) => setCondicionFiltro(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all cursor-pointer"
        >
          <option value="">Todas las condiciones</option>
          {catalogos?.condiciones?.map((cd) => {
            const nom = cd.nombreCondicion ?? cd.nombre
            return (
              <option key={cd.idCondicion ?? cd.id} value={nom}>
                {nom}
              </option>
            )
          })}
        </select>
      </div>

      {/* 7. Caja / Transmisión (Manual, Automática) */}
      <div className="space-y-1.5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#2563EB]">settings</span>
            Transmisión / Caja
          </label>
          {cajaFiltro && (
            <button onClick={() => setCajaFiltro('')} className="text-[10px] text-[#2563EB] font-bold hover:underline cursor-pointer">
              Limpiar
            </button>
          )}
        </div>
        <select
          value={cajaFiltro}
          onChange={(e) => setCajaFiltro(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all cursor-pointer"
        >
          <option value="">Todas las transmisiones</option>
          {catalogos?.cajas?.map((cj) => {
            const nom = cj.nombreCaja ?? cj.nombre
            return (
              <option key={cj.idCaja ?? cj.id} value={nom}>
                {nom}
              </option>
            )
          })}
        </select>
      </div>

      {/* 8. Combustible (Nafta, Diésel, GNC) */}
      <div className="space-y-1.5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#2563EB]">local_gas_station</span>
            Combustible
          </label>
          {combustibleFiltro && (
            <button onClick={() => setCombustibleFiltro('')} className="text-[10px] text-[#2563EB] font-bold hover:underline cursor-pointer">
              Limpiar
            </button>
          )}
        </div>
        <select
          value={combustibleFiltro}
          onChange={(e) => setCombustibleFiltro(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all cursor-pointer"
        >
          <option value="">Todos los combustibles</option>
          {catalogos?.combustibles?.map((cb) => {
            const nom = cb.nombreCombustible ?? cb.nombre
            return (
              <option key={cb.idCombustible ?? cb.id} value={nom}>
                {nom}
              </option>
            )
          })}
        </select>
      </div>

      {/* 9. Tracción (FWD, RWD, AWD, 4WD) */}
      <div className="space-y-1.5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#2563EB]">tire_repair</span>
            Tracción
          </label>
          {traccionFiltro && (
            <button onClick={() => setTraccionFiltro('')} className="text-[10px] text-[#2563EB] font-bold hover:underline cursor-pointer">
              Limpiar
            </button>
          )}
        </div>
        <select
          value={traccionFiltro}
          onChange={(e) => setTraccionFiltro(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all cursor-pointer"
        >
          <option value="">Todas las tracciones</option>
          {catalogos?.tracciones?.map((tr) => {
            const nom = tr.nombreTraccion ?? tr.nombre
            return (
              <option key={tr.idTraccion ?? tr.id} value={nom}>
                {nom}
              </option>
            )
          })}
        </select>
      </div>

      {/* 10. Tipo de Motor (Combustión, Híbrido, Eléctrico) */}
      <div className="space-y-1.5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#2563EB]">electric_bolt</span>
            Tipo de Motor
          </label>
          {tipoMotorFiltro && (
            <button onClick={() => setTipoMotorFiltro('')} className="text-[10px] text-[#2563EB] font-bold hover:underline cursor-pointer">
              Limpiar
            </button>
          )}
        </div>
        <select
          value={tipoMotorFiltro}
          onChange={(e) => setTipoMotorFiltro(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all cursor-pointer"
        >
          <option value="">Todos los tipos de motor</option>
          {catalogos?.tiposMotor?.map((tm) => {
            const nom = tm.nombreTipo ?? tm.nombre
            return (
              <option key={tm.idTipoMotor ?? tm.id} value={nom}>
                {nom}
              </option>
            )
          })}
        </select>
      </div>

      {/* 11. Tipo de Tapizado */}
      <div className="space-y-1.5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#2563EB]">airline_seat_recline_extra</span>
            Tapizado
          </label>
          {tapizadoFiltro && (
            <button onClick={() => setTapizadoFiltro('')} className="text-[10px] text-[#2563EB] font-bold hover:underline cursor-pointer">
              Limpiar
            </button>
          )}
        </div>
        <select
          value={tapizadoFiltro}
          onChange={(e) => setTapizadoFiltro(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all cursor-pointer"
        >
          <option value="">Todos los tapizados</option>
          {catalogos?.tapizados?.map((tp) => {
            const nom = tp.nombreTipoTapizado ?? tp.nombre
            return (
              <option key={tp.idTipoTapizado ?? tp.id} value={nom}>
                {nom}
              </option>
            )
          })}
        </select>
      </div>

      {/* 12. Tipo de Dirección */}
      <div className="space-y-1.5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#2563EB]">turn_sharp_right</span>
            Dirección
          </label>
          {direccionFiltro && (
            <button onClick={() => setDireccionFiltro('')} className="text-[10px] text-[#2563EB] font-bold hover:underline cursor-pointer">
              Limpiar
            </button>
          )}
        </div>
        <select
          value={direccionFiltro}
          onChange={(e) => setDireccionFiltro(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all cursor-pointer"
        >
          <option value="">Todas las direcciones</option>
          {catalogos?.direcciones?.map((dr) => {
            const nom = dr.nombre ?? dr.nombreTipoDireccion
            return (
              <option key={dr.idTipoDireccion ?? dr.id} value={nom}>
                {nom}
              </option>
            )
          })}
        </select>
      </div>


    </div>
  )

  return (
    <div className="w-full bg-[#F8FAFC] py-8 lg:py-12 selection:bg-[#2563EB] selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 flex flex-col gap-6">
        {/* Breadcrumb & Encabezado */}
        <div className="flex flex-col gap-1 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link to="/" className="hover:text-[#2563EB] transition-colors">
              Inicio
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-semibold">Catálogo Público</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Catálogo de Vehículos en Stock
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Unidades verificadas en salón con documentación lista para transferencia inmediata.
              </p>
            </div>

            {/* Mobile Filter Trigger Button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0F172A] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                <span>Filtros {filtrosActivos.length > 0 ? `(${filtrosActivos.length})` : ''}</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            GRID PRINCIPAL DE 12 COLUMNAS (SIDEBAR 3-4 COLS + FEED 8-9 COLS)
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* SIDEBAR DESKTOP */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-28 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2563EB] text-lg">tune</span>
                <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
                  Filtros de Búsqueda
                </h3>
              </div>
              {filtrosActivos.length > 0 && (
                <button
                  onClick={handleLimpiarFiltros}
                  className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <span className="material-symbols-outlined text-xs">restart_alt</span>
                  Limpiar
                </button>
              )}
            </div>

            <FilterControls />
          </aside>

          {/* FEED DE VEHÍCULOS (8-9 Cols con Grilla Modular de 3 Cols en Desktop) */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-5">
            {/* Control Bar: Contador y Orden */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-[#0F172A]">
                  {publicacionesOrdenadas.length}{' '}
                  {publicacionesOrdenadas.length === 1 ? 'vehículo encontrado' : 'vehículos disponibles'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] text-xs font-extrabold border border-blue-100">
                  Stock Real
                </span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                  Ordenar:
                </label>
                <div className="relative">
                  <select
                    value={orden}
                    onChange={(e) => setOrden(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 appearance-none pr-8 cursor-pointer focus:ring-2 focus:ring-[#2563EB]"
                  >
                    <option value="recientes">Más recientes</option>
                    <option value="menor-precio">Menor precio</option>
                    <option value="mayor-precio">Mayor precio</option>
                    <option value="km">Menor kilometraje</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* Chips de Filtros Activos */}
            {filtrosActivos.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-extrabold text-slate-500 mr-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#2563EB]">filter_alt</span>
                  Activos ({filtrosActivos.length}):
                </span>
                {filtrosActivos.map((f) => (
                  <span
                    key={f.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-[#2563EB]"
                  >
                    <span>{f.label}</span>
                    <button
                      onClick={f.clear}
                      className="hover:text-red-500 transition-colors cursor-pointer"
                      title="Eliminar filtro"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                ))}
                <button
                  onClick={handleLimpiarFiltros}
                  className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors ml-auto cursor-pointer"
                >
                  Limpiar todos
                </button>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3">
                <span className="material-symbols-outlined text-xl">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Loading Skeleton */}
            {cargando ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl h-88 animate-pulse border border-slate-200"></div>
                ))}
              </div>
            ) : publicacionesOrdenadas.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-3xl">search_off</span>
                </div>
                <h3 className="text-lg font-extrabold text-[#0F172A]">
                  No encontramos vehículos con los filtros seleccionados
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Probá ajustando el rango de precios, seleccionando otra marca o limpiando los filtros para ver todo el inventario disponible.
                </p>
                <button
                  type="button"
                  onClick={handleLimpiarFiltros}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  Ver Todas las Unidades
                </button>
              </div>
            ) : (
              /* Vehicle Cards Grid (Modular Bento: 3 cols en Desktop, 2 en Tablet, 1 en Mobile) */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {publicacionesOrdenadas.map((pub) => (
                  <VehicleCard key={pub.idPublicacion ?? pub.id} publicacion={pub} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* =========================================================================
          MOBILE DRAWER / BOTTOM SHEET DE FILTROS
          ========================================================================= */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2563EB]">tune</span>
                <h3 className="text-sm font-extrabold text-[#0F172A]">Filtros de Búsqueda</h3>
              </div>
              <div className="flex items-center gap-3">
                {filtrosActivos.length > 0 && (
                  <button
                    onClick={handleLimpiarFiltros}
                    className="text-xs font-bold text-[#2563EB] hover:underline"
                  >
                    Limpiar
                  </button>
                )}
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>

            {/* Drawer Body Scrollable */}
            <div className="p-5 overflow-y-auto space-y-6">
              <FilterControls />
            </div>

            {/* Drawer Footer CTA */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3.5 rounded-xl bg-[#2563EB] text-white font-extrabold text-sm shadow-md active:scale-95 cursor-pointer"
              >
                Ver {publicacionesOrdenadas.length} {publicacionesOrdenadas.length === 1 ? 'resultado' : 'resultados'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
