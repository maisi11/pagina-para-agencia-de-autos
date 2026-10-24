import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MetricasService } from '../../services/metricas.service'
import { PublicacionesService } from '../../services/publicaciones.service'

export default function MetricasPage() {
  // Selector temporal segmentado: semana | mes | trimestre | anio
  const [periodo, setPeriodo] = useState('semana')

  // Datos 100% reales provenientes de la base de datos PostgreSQL
  const [kpis, setKpis] = useState(null)
  const [chartData, setChartData] = useState([])
  const [segmentosInfo, setSegmentosInfo] = useState({ datos: [], esDistribucionStock: false, totalVisitas: 0 })
  const [carrocerias, setCarrocerias] = useState([])
  const [topVehiculos, setTopVehiculos] = useState([])
  const [demandaInsatisfecha, setDemandaInsatisfecha] = useState([])
  const [publicaciones, setPublicaciones] = useState([])

  const [cargando, setCargando] = useState(true)
  const [syncing, setSyncing] = useState(false)

  // Carga de datos reales desde el backend
  const cargarDatos = async () => {
    try {
      setSyncing(true)
      const [kpiData, barrasData, segData, carrData, topData, demandaData, pubsData] = await Promise.all([
        MetricasService.obtenerKpis(periodo).catch(() => null),
        MetricasService.obtenerGraficoBarras(periodo).catch(() => []),
        MetricasService.obtenerDistribucionSegmentos().catch(() => ({ datos: [], esDistribucionStock: false, totalVisitas: 0 })),
        MetricasService.obtenerDistribucionCarrocerias().catch(() => []),
        MetricasService.obtenerTopVehiculos(5).catch(() => []),
        MetricasService.obtenerDemandaInsatisfecha().catch(() => []),
        PublicacionesService.listar().catch(() => []),
      ])

      if (kpiData) setKpis(kpiData)
      if (Array.isArray(barrasData)) setChartData(barrasData)
      if (segData) {
        if (Array.isArray(segData)) {
          setSegmentosInfo({ datos: segData, esDistribucionStock: false, totalVisitas: 0 })
        } else {
          setSegmentosInfo(segData)
        }
      }
      if (Array.isArray(carrData)) setCarrocerias(carrData)
      if (Array.isArray(topData)) setTopVehiculos(topData)
      if (Array.isArray(demandaData)) setDemandaInsatisfecha(demandaData)
      if (Array.isArray(pubsData)) setPublicaciones(pubsData)
    } catch (err) {
      console.error('Error al sincronizar métricas de la base de datos:', err)
    } finally {
      setCargando(false)
      setSyncing(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [periodo])

  // Valores monetarios y numéricos reales sin simulaciones
  const valorInventarioFormateado = useMemo(() => {
    const val = kpis?.valorInventarioTotal ?? 0
    if (val >= 1000000) {
      return `$${(val / 1000000).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M`
    }
    if (val >= 1000) {
      return `$${(val / 1000).toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mil`
    }
    return `$${val.toLocaleString('es-AR')}`
  }, [kpis])

  const tasaConversionFormateada = useMemo(() => {
    const tasa = kpis?.tasaConversionGlobal ?? 0
    return `${tasa.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} %`
  }, [kpis])

  const consultasWppPub = kpis?.totalConsultasWhatsappPub ?? 0
  const consultasWppGen = kpis?.consultasWhatsappGenerales ?? 0
  const totalConsultasWpp = kpis?.totalConsultasWhatsappTotal ?? (consultasWppPub + consultasWppGen)
  const clicsMaps = kpis?.clicsGoogleMaps ?? 0
  const totalVisitas = kpis?.totalVisitasAutos ?? 0
  const ticketPromedio = kpis?.precioPromedio ?? 0

  const listaSegmentos = segmentosInfo.datos || []
  const maxVisitasSegmento = useMemo(() => {
    if (listaSegmentos.length === 0) return 1
    return Math.max(...listaSegmentos.map((s) => s.totalVisitas), 1)
  }, [listaSegmentos])

  const hayDatosBarras = useMemo(() => {
    return chartData.some((b) => (b.visitasVal || 0) > 0 || (b.waVal || 0) > 0)
  }, [chartData])

  const coloresDonut = ['#2563EB', '#1D4ED8', '#F59E0B', '#7C3AED']

  return (
    <div className="w-full bg-[#F3F4F6] min-h-[calc(100vh-60px)] pb-24 font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">

        {/* =========================================================
            HEADER EJECUTIVO & SELECTOR TEMPORAL SEGMENTADO
            ========================================================= */}
        <div className="bg-[#1E3A8A] rounded-2xl p-6 sm:p-7 text-white shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Resumen comercial
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Segmented Pills: Semana, Mes, Trimestre, Año */}
            <div className="inline-flex items-center bg-blue-900/90 p-1 rounded-xl shadow-inner border border-blue-700/60">
              <button
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  periodo === 'semana'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-blue-200 hover:text-white'
                }`}
                onClick={() => setPeriodo('semana')}
                type="button"
              >
                Semana (7d)
              </button>
              <button
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  periodo === 'mes'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-blue-200 hover:text-white'
                }`}
                onClick={() => setPeriodo('mes')}
                type="button"
              >
                Mes (30d)
              </button>
              <button
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  periodo === 'trimestre'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-blue-200 hover:text-white'
                }`}
                onClick={() => setPeriodo('trimestre')}
                type="button"
              >
                Trimestre (90d)
              </button>
              <button
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  periodo === 'anio'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-blue-200 hover:text-white'
                }`}
                onClick={() => setPeriodo('anio')}
                type="button"
              >
                Año (365d)
              </button>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2">
              <button
                onClick={cargarDatos}
                disabled={syncing}
                className="p-2 rounded-xl bg-blue-800/80 hover:bg-blue-800 text-white transition-all border border-blue-700/60 shadow-sm cursor-pointer"
                title="Sincronizar con PostgreSQL"
                type="button"
              >
                <span className={`material-symbols-outlined text-base ${syncing ? 'animate-spin' : ''}`}>
                  sync
                </span>
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold transition-all shadow-sm hover:bg-slate-100 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-sm text-slate-700">download</span>
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================
            BANNER INFORMATIVO REAL DEL PERÍODO
            ========================================================= */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${totalConsultasWpp > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
            <span className="text-slate-600 font-medium">
              Consultas en este período ({periodo}):
            </span>
            <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
              {kpis?.comparativaConsultas?.texto || `${totalConsultasWpp} consultas acumuladas`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <span className="material-symbols-outlined text-sm text-blue-600">award_star</span>
            <span>Auto más consultado del período:</span>
            {kpis?.autoMasConsultado ? (
              <span className="font-extrabold text-slate-900 bg-blue-50 px-2 py-0.5 rounded-md text-blue-900 truncate max-w-xs">
                {kpis.autoMasConsultado}
              </span>
            ) : (
              <span className="text-slate-400 italic">Sin interacciones registradas aún</span>
            )}
          </div>
        </div>

        {/* =========================================================
            KPIS PRINCIPALES: VALORES REALES DE LA BASE DE DATOS
            ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* KPI 1: LEADS WHATSAPP (POR AUTO VS GENERALES) */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-200 flex flex-col justify-between gap-2.5 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">
                Leads WhatsApp (Total)
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">
                KPI #1
              </span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 tracking-tight">
                {totalConsultasWpp}
              </span>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                <span className="font-extrabold text-emerald-700">{consultasWppPub} por auto</span>
                <span className="text-slate-400 mx-1">|</span>
                <span className="font-extrabold text-slate-700">{consultasWppGen} web central</span>
              </p>
            </div>
            <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-medium">
              Consultas directas al vendedor
            </div>
          </div>

          {/* KPI 2: TASA DE CONVERSIÓN REAL */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between gap-2.5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                Tasa Conversión (CR)
              </span>
              <span className="material-symbols-outlined text-blue-600 text-lg">conversion_path</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {tasaConversionFormateada}
              </span>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                (Consultas Wpp / Visitas) × 100
              </p>
            </div>
            <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-medium">
              {totalVisitas > 0 ? `${consultasWppPub} de ${totalVisitas} visitas` : 'Esperando visitas iniciales'}
            </div>
          </div>

          {/* KPI 3: VISITAS AL CATÁLOGO */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between gap-2.5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                Visitas al Catálogo
              </span>
              <span className="material-symbols-outlined text-blue-600 text-lg">visibility</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {totalVisitas.toLocaleString('es-AR')}
              </span>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                Tráfico registrado en showroom web
              </p>
            </div>
            <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-medium">
              Autos que atraen la mirada
            </div>
          </div>

          {/* KPI 4: CLICS EN GOOGLE MAPS */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between gap-2.5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                Visitas Físicas (Maps)
              </span>
              <span className="material-symbols-outlined text-amber-600 text-lg">pin_drop</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {clicsMaps}
              </span>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                Clics a ubicación del showroom
              </p>
            </div>
            <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-medium">
              Intención de visita presencial
            </div>
          </div>

          {/* KPI 5: VALOR DEL INVENTARIO ACTIVO */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between gap-2.5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                Valor del Inventario
              </span>
              <span className="material-symbols-outlined text-blue-600 text-lg">monetization_on</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {valorInventarioFormateado}
              </span>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                Promedio: ${Math.round(ticketPromedio).toLocaleString('es-AR')} USD
              </p>
            </div>
            <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-medium">
              {kpis?.totalPublicacionesActivas ?? publicaciones.length} unidades disponibles
            </div>
          </div>

        </div>

        {/* =========================================================
            GRÁFICO DE BARRAS REAL: VISITAS WEB VS LEADS WHATSAPP
            ========================================================= */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Volumen: Visitas Web vs Clics a WhatsApp ({periodo.toUpperCase()})
              </h2>
              <p className="text-xs text-slate-500">
                Registros acumulados para el período seleccionado.
              </p>
            </div>
            
            <div className="flex items-center gap-5 text-xs font-bold">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-3.5 h-3.5 rounded-md bg-[#2563EB]"></span>
                <span>Visitas Web</span>
              </span>
              <span className="flex items-center gap-2 text-emerald-700">
                <span className="w-3.5 h-3.5 rounded-md bg-[#10B981]"></span>
                <span>Leads WhatsApp</span>
              </span>
            </div>
          </div>

          {/* Si no hay datos registrados para ese período, mostrar mensaje claro sin inventar */}
          {!hayDatosBarras ? (
            <div className="py-14 flex flex-col items-center justify-center text-slate-400 gap-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <span className="material-symbols-outlined text-4xl text-slate-300">bar_chart</span>
              <p className="text-xs font-bold text-slate-600">
                Sin interacciones registradas en este período ({periodo})
              </p>
              <p className="text-[11px] text-slate-400 max-w-md text-center">
                A medida que los compradores visiten el catálogo o consulten por WhatsApp, las barras se generarán automáticamente con las cifras exactas.
              </p>
            </div>
          ) : (
            <div
              className="grid gap-2 sm:gap-4 items-end h-64 pt-6 border-b border-slate-200"
              style={{
                gridTemplateColumns: `repeat(${chartData.length}, minmax(0, 1fr))`,
              }}
            >
              {chartData.map((bar, i) => (
                <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                    {/* Barra Visitas */}
                    <div
                      className="w-3 sm:w-6 lg:w-8 bg-[#2563EB]/85 group-hover:bg-[#2563EB] rounded-t-lg transition-all relative cursor-pointer shadow-sm flex items-start justify-center pt-1"
                      style={{ height: `${Math.max(bar.visitasVal > 0 ? 12 : 0, bar.visitas)}%` }}
                      title={`${bar.etiqueta}: ${bar.visitasVal} Visitas Web`}
                    >
                      {bar.visitasVal > 0 && (
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-extrabold text-white">
                          {bar.visitasVal}
                        </span>
                      )}
                    </div>

                    {/* Barra WhatsApp */}
                    <div
                      className="w-3 sm:w-6 lg:w-8 bg-[#10B981]/85 group-hover:bg-[#10B981] rounded-t-lg transition-all relative cursor-pointer shadow-sm flex items-start justify-center pt-1"
                      style={{ height: `${Math.max(bar.waVal > 0 ? 8 : 0, bar.wa)}%` }}
                      title={`${bar.etiqueta}: ${bar.waVal} Leads WhatsApp`}
                    >
                      {bar.waVal > 0 && (
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-extrabold text-white">
                          {bar.waVal}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 text-center">
                    {bar.etiqueta}
                  </span>
                </div>
              ))}
            </div>
          )}

          
        </div>

        {/* =========================================================
            FILA 2: DEMANDA POR SEGMENTO & DEMANDA INSATISFECHA (REALES)
            ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* GRÁFICO 2: DEMANDA POR SEGMENTO (BARRAS HORIZONTALES) */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between gap-5">
            <div>
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-slate-900">
                    Interés por Segmento (Guía de Stock)
                  </h2>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    {segmentosInfo.esDistribucionStock ? 'Inventario Físico' : 'Demanda Web'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {segmentosInfo.esDistribucionStock
                    ? 'Proporción de unidades en inventario físico actualmente en stock.'
                    : 'Distribución de visitas por segmento registradas en el catálogo.'}
                </p>
              </div>

              {listaSegmentos.length === 0 ? (
                <div className="py-10 flex flex-col items-center justify-center text-slate-400 gap-1 text-center">
                  <span className="material-symbols-outlined text-3xl text-slate-300">category</span>
                  <p className="text-xs font-semibold text-slate-600">No hay datos de segmentos en la base de datos.</p>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {listaSegmentos.map((s, idx) => {
                    const ancho = Math.min(100, (s.totalVisitas / maxVisitasSegmento) * 100)
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span className="font-bold text-slate-900">{s.segmento}</span>
                          <span className="font-extrabold text-blue-700">
                            {s.porcentaje}% ({s.totalVisitas} {segmentosInfo.esDistribucionStock ? 'unidades' : 'visitas'})
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-5 rounded-lg overflow-hidden flex items-center">
                          <div
                            className="bg-[#2563EB] h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-2 text-white text-[10px] font-extrabold shadow-sm"
                            style={{ width: `${Math.max(10, ancho)}%` }}
                          >
                            {s.totalVisitas}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  <div className="mt-4 pt-2 border-t border-slate-200 flex justify-between text-[10px] font-bold text-slate-400">
                    <span>0</span>
                    <span>{Math.round(maxVisitasSegmento * 0.25)}</span>
                    <span>{Math.round(maxVisitasSegmento * 0.5)}</span>
                    <span>{Math.round(maxVisitasSegmento * 0.75)}</span>
                    <span>{maxVisitasSegmento}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-blue-50/80 rounded-xl text-xs text-blue-950 border border-blue-100 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-blue-700 text-lg shrink-0 mt-0.5">
                lightbulb
              </span>
              <div>
                <strong>Guía de compras de stock:</strong> Datos directos del inventario y consultas en catálogo para orientar la compra de unidades hacia los segmentos de mayor tracción.
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: DEMANDA INSATISFECHA / BÚSQUEDAS DEL CATÁLOGO */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between gap-5">
            <div>
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-slate-900">
                    Marcas y Modelos más Buscados (Demanda Insatisfecha)
                  </h2>
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                    Búsquedas Web
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Términos ingresados por compradores en los filtros y buscador del catálogo.
                </p>
              </div>

              {demandaInsatisfecha.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 gap-2">
                  <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
                  <p className="text-xs font-bold text-slate-700">Sin búsquedas de clientes registradas aún</p>
                  <p className="text-[11px] text-slate-500 max-w-sm">
                    A medida que los compradores busquen marcas y modelos en el catálogo web, aquí se identificarán automáticamente las oportunidades de compra para reventa sin stock.
                  </p>
                </div>
              ) : (
                <div className="mt-4 divide-y divide-slate-100">
                  {demandaInsatisfecha.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-extrabold text-slate-900 text-sm">
                            {item.termino}
                          </span>
                          <p className="text-[11px] text-slate-500">
                            {item.busquedas} {item.busquedas === 1 ? 'búsqueda registrada' : 'búsquedas registradas'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-0.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            item.enStock
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {item.estado}
                        </span>
                        {!item.enStock && (
                          <span className="text-[10px] text-red-600 font-bold">
                            Oportunidad de compra
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3.5 bg-amber-50/70 rounded-xl text-xs text-amber-900 border border-amber-100 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-amber-700 text-lg shrink-0 mt-0.5">
                notification_important
              </span>
              <div>
                <strong>Detección de demanda insatisfecha:</strong> Cruza las búsquedas reales en el catálogo contra las unidades actualmente en stock para alertar sobre oportunidades de compra.
              </div>
            </div>
          </div>

        </div>

        {/* =========================================================
            TABLA RANKING: RENDIMIENTO REAL DE CADA PUBLICACIÓN
            ========================================================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Rendimiento por Publicación: Visitas vs WhatsApp &amp; Conversión
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Detección de <strong>Autos Estrella</strong> (alta conversión) y <strong>Alertas / Autos Clavo</strong> (muchas visitas sin consultas).
              </p>
            </div>
            <Link
              to="/admin/inventario"
              className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 hover:underline"
            >
              <span>Ver todas las publicaciones</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Vehículo</th>
                  <th className="py-3 px-4 text-right">Precio USD</th>
                  <th className="py-3 px-4 text-center">Visitas Web</th>
                  <th className="py-3 px-4 text-center">Consultas Wpp</th>
                  <th className="py-3 px-4 text-center">Tasa Conversión</th>
                  <th className="py-3 px-4 text-center">Diagnóstico Comercial</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800 font-medium">
                {topVehiculos.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-10 text-center text-slate-400 text-xs">
                      No hay publicaciones cargadas en la base de datos aún.
                    </td>
                  </tr>
                ) : (
                  topVehiculos.map((v, idx) => (
                    <tr key={v.idPublicacion || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            className="w-12 h-9 rounded-lg object-cover shadow-sm border border-slate-200"
                            src={
                              v.fotoPortada ||
                              'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=200&q=80'
                            }
                            alt={v.titulo}
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 max-w-xs truncate text-sm">
                              {v.titulo}
                            </span>
                            <span className="text-[10px] text-slate-400">ID #{v.idPublicacion}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        USD ${Number(v.precio).toLocaleString('es-AR')}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                        {v.visitas}
                      </td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-emerald-600">
                        {v.consultasWhatsapp}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[11px]">
                          {v.tasaConversion} %
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                            v.clasificacionTipo === 'estrella'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : v.clasificacionTipo === 'alerta'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                          title={v.alertaComercial}
                        >
                          {v.clasificacion}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/vehiculo/${v.idPublicacion}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Ver Ficha</span>
                          <span className="material-symbols-outlined text-xs">open_in_new</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                ⭐ Auto Estrella: &gt;10% conversión.
              </span>
              <span className="flex items-center gap-1 text-red-700 font-bold">
                ⚠️ Auto Clavo: Muchas visitas y 0 consultas (revisar precio o fotos).
              </span>
            </div>
            <span className="text-slate-400">Total unidades analizadas: {topVehiculos.length}</span>
          </div>
        </div>

      </div>
    </div>
  )
}
