import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PublicacionesService } from '../../services/publicaciones.service'

export default function InventarioPage() {
  const [inventario, setInventario] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('all') // 'all' | 'disponible' | 'pausada' | 'finalizada'
  const [busqueda, setBusqueda] = useState('')
  const [filtroSegmento, setFiltroSegmento] = useState('')
  const [orden, setOrden] = useState('recent')
  const [mensajeToast, setMensajeToast] = useState(null)

  // Modal AlertDialog de Prevención de Borrado Accidental
  const [modalEliminar, setModalEliminar] = useState({
    abierto: false,
    id: null,
    titulo: '',
    sku: '',
  })
  const [eliminando, setEliminando] = useState(false)

  // Modal de Atributos Dinámicos (Equipamiento)
  const [modalAtributos, setModalAtributos] = useState({
    abierto: false,
    publicacion: null,
    nuevoAtributo: '',
    lista: [],
  })

  const notificar = (msg, tipo = 'success') => {
    setMensajeToast({ texto: msg, tipo })
    setTimeout(() => setMensajeToast(null), 3800)
  }

  const cargarPublicaciones = async () => {
    try {
      setCargando(true)
      const data = await PublicacionesService.listar()
      setInventario(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error cargando inventario:', err)
      notificar('Error al conectar con la base de datos de inventario', 'error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarPublicaciones()
  }, [])

  const getEstadoNombre = (p) => {
    return (
      p.historial?.[0]?.estado?.nombreEstado ||
      p.historial?.[0]?.nombreEstado ||
      p.historial?.[0]?.estado?.nombre ||
      p.estado ||
      'disponible'
    ).toLowerCase()
  }

  // Cambio directo de estado en la fila (Disponible / Pausada / Finalizada)
  const handleCambiarEstadoDirecto = async (id, nuevoEstado) => {
    try {
      await PublicacionesService.cambiarEstado(id, nuevoEstado)
      
      // Actualización optimista del estado local para feedback inmediato
      setInventario((prev) =>
        prev.map((item) => {
          const itemId = item.idPublicacion ?? item.id
          if (itemId === id) {
            const historialActualizado = [
              {
                ...(item.historial?.[0] || {}),
                estado: { nombreEstado: nuevoEstado, nombre: nuevoEstado },
                nombreEstado: nuevoEstado,
              },
              ...(item.historial?.slice(1) || []),
            ]
            return {
              ...item,
              estado: nuevoEstado,
              historial: historialActualizado,
            }
          }
          return item
        })
      )

      const nombreLimpio =
        nuevoEstado === 'disponible'
          ? 'DISPONIBLE (Tráfico Activo)'
          : nuevoEstado === 'pausada'
          ? 'PAUSADA (Reserva / Seña)'
          : 'FINALIZADA (Vendido)'

      notificar(`Publicación #${id} actualizada con éxito a estado: ${nombreLimpio}`)
    } catch (err) {
      console.error('Error al cambiar estado:', err)
      notificar(err.message || 'No se pudo actualizar el estado de la publicación', 'error')
      cargarPublicaciones()
    }
  }

  // Abrir Modal de Confirmación de Borrado
  const solicitarEliminacion = (pub) => {
    const id = pub.idPublicacion ?? pub.id
    const sku = pub.vehiculo?.codigoVehiculo || `APX-VEH-${id}`
    setModalEliminar({
      abierto: true,
      id,
      titulo: pub.titulo,
      sku,
    })
  }

  // Confirmar eliminación en Modal AlertDialog
  const ejecutarEliminacion = async () => {
    if (!modalEliminar.id) return
    try {
      setEliminando(true)
      await PublicacionesService.eliminar(modalEliminar.id)
      notificar(`Publicación #${modalEliminar.id} eliminada (borrado lógico aplicado, métricas históricas preservadas).`)
      setModalEliminar({ abierto: false, id: null, titulo: '', sku: '' })
      cargarPublicaciones()
    } catch (err) {
      console.error('Error al eliminar publicación:', err)
      notificar('Error al procesar la eliminación en el servidor', 'error')
    } finally {
      setEliminando(false)
    }
  }

  // Abrir modal de atributos dinámicos
  const abrirModalAtributos = (pub) => {
    setModalAtributos({
      abierto: true,
      publicacion: pub,
      nuevoAtributo: '',
      lista: [
        'Techo Solar Panorámico',
        'Tapizado de Cuero Bitono',
        'Cámara de Visión 360°',
        'Control Crucero Adaptativo',
        'Apple CarPlay & Android Auto',
      ],
    })
  }

  const agregarAtributoDinamico = () => {
    const nuevo = modalAtributos.nuevoAtributo.trim()
    if (!nuevo) return
    if (modalAtributos.lista.includes(nuevo)) {
      notificar('Este atributo ya está en la lista de equipamiento', 'error')
      return
    }
    setModalAtributos((prev) => ({
      ...prev,
      lista: [...prev.lista, nuevo],
      nuevoAtributo: '',
    }))
    notificar(`Atributo "${nuevo}" agregado al equipamiento`)
  }

  // Exportar a CSV
  const handleExportCSV = () => {
    if (inventario.length === 0) {
      notificar('No hay registros para exportar', 'error')
      return
    }

    const headers = ['ID', 'Código', 'Título', 'Precio USD', 'Año', 'Kilómetros', 'Patente', 'Estado']
    const rows = inventario.map((p) => {
      const v = p.vehiculo || {}
      const estado = getEstadoNombre(p)

      return [
        p.idPublicacion ?? p.id,
        v.codigoVehiculo || `APX-${p.idPublicacion ?? p.id}`,
        `"${(p.titulo || '').replace(/"/g, '""')}"`,
        p.precio,
        v.anio || '',
        v.kilometros || 0,
        v.patente || '',
        estado.toUpperCase(),
      ].join(',')
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `inventario_apex_motors_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    notificar('Reporte CSV descargado exitosamente')
  }

  // Métricas
  const totalStock = inventario.length
  const valuacionTotal = inventario.reduce((acc, p) => acc + (Number(p.precio) || 0), 0)

  const activasCount = inventario.filter((p) => {
    const e = getEstadoNombre(p)
    return e.includes('disponible') || e.includes('activa')
  }).length

  const pausadasCount = inventario.filter((p) => {
    const e = getEstadoNombre(p)
    return e.includes('pausad') || e.includes('reserv')
  }).length

  const finalizadasCount = inventario.filter((p) => {
    const e = getEstadoNombre(p)
    return e.includes('finaliz') || e.includes('vendid')
  }).length

  // Filtrado
  const inventarioFiltrado = inventario.filter((p) => {
    const estado = getEstadoNombre(p)
    if (filtroEstado === 'disponible' && !estado.includes('disponible') && !estado.includes('activa')) return false
    if (filtroEstado === 'pausada' && !estado.includes('pausad') && !estado.includes('reserv')) return false
    if (filtroEstado === 'finalizada' && !estado.includes('finaliz') && !estado.includes('vendid')) return false

    if (filtroSegmento) {
      const segNom = p.vehiculo?.segmento?.nombreSegmento || p.vehiculo?.tipoCarroceria?.nombreTipoCarroceria || ''
      if (!segNom.toLowerCase().includes(filtroSegmento.toLowerCase())) return false
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim()
      const tituloStr = (p.titulo || '').toLowerCase()
      const skuStr = (p.vehiculo?.codigoVehiculo || '').toLowerCase()
      const patStr = (p.vehiculo?.patente || '').toLowerCase()
      if (!tituloStr.includes(q) && !skuStr.includes(q) && !patStr.includes(q)) return false
    }

    return true
  })

  // Ordenamiento
  const inventarioOrdenado = [...inventarioFiltrado].sort((a, b) => {
    if (orden === 'price_asc') return Number(a.precio) - Number(b.precio)
    if (orden === 'price_desc') return Number(b.precio) - Number(a.precio)
    const idA = a.idPublicacion ?? a.id ?? 0
    const idB = b.idPublicacion ?? b.id ?? 0
    return idB - idA
  })

  return (
    <div className="w-full bg-slate-50 min-h-[calc(100vh-60px)] pb-16 selection:bg-secondary selection:text-white">
      {/* =========================================================
          TOAST FEEDBACK NOTIFICATION
          ========================================================= */}
      {mensajeToast && (
        <div
          className={`fixed top-18 right-6 z-50 text-white px-5 py-3.5 rounded-xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 ${
            mensajeToast.tipo === 'error'
              ? 'bg-rose-950 border-rose-700 text-rose-100'
              : 'bg-slate-900 border-slate-700'
          }`}
        >
          <span
            className={`material-symbols-outlined text-lg ${
              mensajeToast.tipo === 'error' ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {mensajeToast.tipo === 'error' ? 'error' : 'check_circle'}
          </span>
          <span className="text-xs font-semibold">{mensajeToast.texto}</span>
        </div>
      )}

      {/* =========================================================
          HEADER OPERACIONAL & ACCIONES RÁPIDAS
          ========================================================= */}
      <section className="w-full bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="material-symbols-outlined text-sm text-secondary">inventory_2</span>
              <span>Portal Vendedores</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-semibold">Gestión de Catálogo &amp; Stock</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sincronización en Vivo Activa
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Control de Catálogo &amp; Publicaciones
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Administración de estados operativos, disponibilidad para WhatsApp en tiempo real y prevención de borrado accidental con resguardo histórico.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/admin/metricas"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-sm hover:bg-slate-50 hover:text-secondary transition-all"
              >
                <span className="material-symbols-outlined text-base text-secondary">insights</span>
                Ver Métricas
              </Link>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-base text-slate-600">file_download</span>
                Exportar CSV
              </button>
              <Link
                to="/admin/publicar"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary-container text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                + Nueva Publicación
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MOSAICO DE ESTADOS DE STOCK (Z-Pattern Reading)
          ========================================================= */}
      <section className="w-full py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* TOTAL */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Total en Stock
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-base">directions_car</span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">{totalStock}</span>
                <span className="text-xs text-slate-500 font-semibold">unidades</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Valuación Total:</span>
                <span className="font-extrabold text-slate-900">
                  USD {(valuacionTotal / 1000).toFixed(1)}k
                </span>
              </div>
            </div>

            {/* DISPONIBLE (Verde Sólido) */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-200/80 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Disponibles
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">{activasCount}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                  {totalStock > 0 ? Math.round((activasCount / totalStock) * 100) : 100}% Stock
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>CTA WhatsApp:</span>
                <span className="font-bold text-emerald-600">Habilitado</span>
              </div>
            </div>

            {/* PAUSADAS (Amarillo/Naranja) */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-200/80 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Pausadas (Seña)
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-base">pause_circle</span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">{pausadasCount}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                  Reservadas
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>CTA WhatsApp:</span>
                <span className="font-bold text-amber-700">Inhabilitado</span>
              </div>
            </div>

            {/* FINALIZADAS (Gris "VENDIDO") */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  Finalizadas (Vendido)
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-base">verified</span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">{finalizadasCount}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold uppercase">
                  Vendidas
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Catálogo Público:</span>
                <span className="font-bold text-slate-500">Oculto</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CONTROLES DE FILTRADO Y BÚSQUEDA
          ========================================================= */}
      <section className="w-full pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Status Switcher Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                <button
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    filtroEstado === 'all'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  onClick={() => setFiltroEstado('all')}
                  type="button"
                >
                  <span>Todos</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-xs font-mono font-bold">
                    {totalStock}
                  </span>
                </button>
                <button
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    filtroEstado === 'disponible'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  onClick={() => setFiltroEstado('disponible')}
                  type="button"
                >
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  <span>Disponibles</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-xs font-mono font-bold">
                    {activasCount}
                  </span>
                </button>
                <button
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    filtroEstado === 'pausada'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  onClick={() => setFiltroEstado('pausada')}
                  type="button"
                >
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  <span>Pausadas</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-xs font-mono font-bold">
                    {pausadasCount}
                  </span>
                </button>
                <button
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    filtroEstado === 'finalizada'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  onClick={() => setFiltroEstado('finalizada')}
                  type="button"
                >
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                  <span>Finalizadas (Vendido)</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-xs font-mono font-bold">
                    {finalizadasCount}
                  </span>
                </button>
              </div>

              {/* Búsqueda Rápida */}
              <div className="relative w-full lg:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                  search
                </span>
                <input
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                  placeholder="Buscar por marca, modelo, SKU o patente..."
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            {/* Dropdown Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Carrocería / Segmento
                </label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white cursor-pointer font-semibold"
                  value={filtroSegmento}
                  onChange={(e) => setFiltroSegmento(e.target.value)}
                >
                  <option value="">Todos los Segmentos</option>
                  <option value="Pick-up">Pick-up / Utilitario</option>
                  <option value="SUV">SUV Premium</option>
                  <option value="Sedán">Sedán</option>
                  <option value="Hatchback">Hatchback</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Ordenar Inventario
                </label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white cursor-pointer font-semibold"
                  value={orden}
                  onChange={(e) => setOrden(e.target.value)}
                >
                  <option value="recent">Más recientes (Última carga)</option>
                  <option value="price_desc">Mayor precio a menor</option>
                  <option value="price_asc">Menor precio a mayor</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setFiltroEstado('all')
                    setBusqueda('')
                    setFiltroSegmento('')
                    setOrden('recent')
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* =========================================================
              DATA TABLE CON BADGES SEMÁNTICOS Y SELECTOR EN FILA
              ========================================================= */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Vehículo &amp; SKU</th>
                    <th className="py-3.5 px-3">Segmento</th>
                    <th className="py-3.5 px-4">Precio Publicado</th>
                    <th className="py-3.5 px-4">Asesor Asignado</th>
                    <th className="py-3.5 px-4 text-center">Estado Semántico</th>
                    <th className="py-3.5 px-4 text-center">Cambiar Estado</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-800 font-medium">
                  {cargando ? (
                    <tr>
                      <td colSpan="7" className="py-14 text-center text-slate-500 font-semibold">
                        <span className="material-symbols-outlined text-3xl animate-spin text-secondary block mb-2">
                          sync
                        </span>
                        Cargando inventario de vehículos sincronizado...
                      </td>
                    </tr>
                  ) : inventarioOrdenado.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-14 text-center text-slate-500">
                        <div className="max-w-sm mx-auto flex flex-col items-center">
                          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">
                            directions_car
                          </span>
                          <span className="font-bold text-slate-700 mb-1">
                            No se encontraron vehículos
                          </span>
                          <p className="text-xs text-slate-400">
                            Prueba con otros términos de búsqueda o restablece los filtros aplicados.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    inventarioOrdenado.map((pub) => {
                      const id = pub.idPublicacion ?? pub.id
                      const v = pub.vehiculo || {}
                      const estadoNombre = getEstadoNombre(pub)
                      const isDisponible = estadoNombre.includes('disponible') || estadoNombre.includes('activa')
                      const isPausada = estadoNombre.includes('pausad') || estadoNombre.includes('reserv')
                      const isFinalizada = estadoNombre.includes('finaliz') || estadoNombre.includes('vendid')
                      const isEliminada = estadoNombre.includes('eliminad')
                      
                      const foto =
                        pub.multimedia?.[0]?.urlArchMultimedia ||
                        pub.multimedia?.[0]?.url ||
                        'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=400&q=80'
                      const sku = v.codigoVehiculo || `APX-VEH-${id}`
                      const km = v.kilometros ? `${Number(v.kilometros).toLocaleString()} km` : '0 km'

                      // Valor actual del selector
                      const estadoSelectValue = isFinalizada ? 'finalizada' : isPausada ? 'pausada' : 'disponible'

                      return (
                        <tr key={id} className="hover:bg-slate-50/90 transition-colors">
                          {/* Vehículo / SKU */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 shadow-sm border border-slate-200">
                                <img className="w-full h-full object-cover" src={foto} alt={pub.titulo} />
                                <span className="absolute top-0.5 left-0.5 px-1 rounded bg-black/80 text-white text-[9px] font-bold">
                                  {v.anio || 2024}
                                </span>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-slate-900 truncate max-w-xs text-sm">
                                  {pub.titulo}
                                </span>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                  <span className="font-mono text-secondary bg-blue-50 px-1 rounded font-bold">
                                    {sku}
                                  </span>
                                  <span>•</span>
                                  <span>{km}</span>
                                  <span>•</span>
                                  <span className="uppercase font-mono">{v.patente || 'AF 123 CD'}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Segmento */}
                          <td className="py-3.5 px-3">
                            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wide">
                              {v.segmento?.nombreSegmento || v.tipoCarroceria?.nombreTipoCarroceria || 'Utilitario'}
                            </span>
                          </td>

                          {/* Precio Publicado */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-slate-900 text-sm">
                                USD {Number(pub.precio).toLocaleString('es-AR')}
                              </span>
                              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-xs">sync_alt</span>
                                Permuta / Cuotas
                              </span>
                            </div>
                          </td>

                          {/* Asesor */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                                MB
                              </div>
                              <span className="text-xs font-semibold text-slate-800">
                                {pub.usuario?.nombre || 'Martín Benítez'}
                              </span>
                            </div>
                          </td>

                          {/* Badges de Estado Semánticos Unificados con Regla de No-Dependencia Cromática */}
                          <td className="py-3.5 px-4 text-center">
                            {isDisponible && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                                <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                <span>Disponible</span>
                              </span>
                            )}
                            {isPausada && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                                <span className="material-symbols-outlined text-[13px]">pause_circle</span>
                                <span>Pausada</span>
                              </span>
                            )}
                            {isFinalizada && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                                <span className="material-symbols-outlined text-[13px]">cancel</span>
                                <span>VENDIDO</span>
                              </span>
                            )}
                            {isEliminada && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-300 text-[10px] font-extrabold uppercase tracking-wider">
                                <span className="material-symbols-outlined text-[13px]">delete</span>
                                <span>Eliminada</span>
                              </span>
                            )}
                          </td>

                          {/* Selector Directo en Fila con Notificación Toast */}
                          <td className="py-3.5 px-4 text-center">
                            <select
                              aria-label={`Cambiar estado de publicación ${sku}`}
                              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer shadow-2xs"
                              value={estadoSelectValue}
                              onChange={(e) => handleCambiarEstadoDirecto(id, e.target.value)}
                            >
                              <option value="disponible">🟢 Disponible</option>
                              <option value="pausada">🟠 Pausada (Seña)</option>
                              <option value="finalizada">⚪ Finalizada (Vendido)</option>
                            </select>
                          </td>

                          {/* Acciones Rápidas */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Atributos / Equipamiento */}
                              <button
                                onClick={() => abrirModalAtributos(pub)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-secondary hover:bg-blue-50 transition-all cursor-pointer"
                                title="Gestionar Equipamiento & Atributos"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-base">tune</span>
                              </button>

                              {/* Ver Detalle Público */}
                              <Link
                                to={`/vehiculo/${id}`}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-secondary hover:bg-blue-50 transition-all cursor-pointer"
                                title="Ver Ficha Pública"
                              >
                                <span className="material-symbols-outlined text-base">visibility</span>
                              </Link>

                              {/* Botón de Borrado con Modal de Confirmación */}
                              <button
                                onClick={() => solicitarEliminacion(pub)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                                title="Eliminar Publicación (con confirmación)"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MODAL ALERTDIALOG: PREVENCIÓN DE BORRADO ACCIDENTAL
          ========================================================= */}
      {modalEliminar.abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  ¿Confirmar eliminación de publicación?
                </h3>
                <p className="text-xs text-slate-500">
                  Estás a punto de dar de baja la unidad de venta del catálogo público.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{modalEliminar.titulo}</div>
              <div className="text-slate-500 font-mono">Ref: {modalEliminar.sku}</div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-base flex-shrink-0">shield</span>
              <span>
                <strong>Borrado seguro:</strong> Se aplica un borrado lógico en base de datos preservando las métricas históricas de WhatsApp y visitas.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalEliminar({ abierto: false, id: null, titulo: '', sku: '' })}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={ejecutarEliminacion}
                disabled={eliminando}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {eliminando ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">delete_forever</span>
                    <span>Sí, Eliminar Publicación</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL DE ATRIBUTOS DINÁMICOS & EQUIPAMIENTO (ZOD / LIVE VALIDATION)
          ========================================================= */}
      {modalAtributos.abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">tune</span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Equipamiento &amp; Atributos Dinámicos
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {modalAtributos.publicacion?.titulo}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalAtributos({ abierto: false, publicacion: null, nuevoAtributo: '', lista: [] })}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Input con Validación */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Agregar nuevo atributo / equipamiento</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: Techo Solar, Apple CarPlay, Frenado Autónomo..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-white"
                  value={modalAtributos.nuevoAtributo}
                  onChange={(e) =>
                    setModalAtributos((prev) => ({ ...prev, nuevoAtributo: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      agregarAtributoDinamico()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={agregarAtributoDinamico}
                  disabled={!modalAtributos.nuevoAtributo.trim()}
                  className="px-4 py-2 bg-secondary hover:bg-secondary-container text-white text-xs font-bold rounded-xl disabled:opacity-50 transition-all cursor-pointer"
                >
                  Agregar
                </button>
              </div>
            </div>

            {/* Chips de Atributos */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Atributos configurados en ficha:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1">
                {modalAtributos.lista.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-xs text-emerald-600">check</span>
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setModalAtributos((prev) => ({
                          ...prev,
                          lista: prev.lista.filter((_, i) => i !== index),
                        }))
                      }
                      className="text-slate-400 hover:text-rose-500 ml-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalAtributos({ abierto: false, publicacion: null, nuevoAtributo: '', lista: [] })}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  notificar('Equipamiento actualizado en la publicación')
                  setModalAtributos({ abierto: false, publicacion: null, nuevoAtributo: '', lista: [] })
                }}
                className="px-5 py-2 rounded-xl bg-secondary hover:bg-secondary-container text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Guardar Atributos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
