import { Link } from 'react-router-dom'

export default function InventarioPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
      {/* Backoffice Header & Operative Context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-1">
            <span className="material-symbols-outlined text-sm text-secondary">admin_panel_settings</span>
            <span>Portal Vendedores</span>
            <span>/</span>
            <span className="text-on-surface font-semibold">Gestión de Inventario</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Gestión de Inventario & Publicaciones
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/metricas"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container text-on-surface font-semibold text-xs hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined text-base text-secondary">insights</span>
            Ver Métricas
          </Link>
          <Link
            to="/admin/publicar"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-base text-tertiary-fixed">add_circle</span>
            + Nueva Publicación
          </Link>
        </div>
      </div>

      {/* KPI Cards Mosaic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Publicaciones</span>
            <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-base">directions_car</span>
            </span>
          </div>
          <span className="text-3xl font-extrabold text-on-surface">184</span>
          <span className="text-xs text-on-surface-variant">Conectado a PostgreSQL</span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Disponibles</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">check_circle</span>
            </span>
          </div>
          <span className="text-3xl font-extrabold text-emerald-600">142</span>
          <span className="text-xs text-on-surface-variant">Activas en catálogo</span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Pausadas / Seña</span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">pause_circle</span>
            </span>
          </div>
          <span className="text-3xl font-extrabold text-amber-600">28</span>
          <span className="text-xs text-on-surface-variant">Reserva comercial</span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Finalizadas</span>
            <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">task_alt</span>
            </span>
          </div>
          <span className="text-3xl font-extrabold text-slate-700">14</span>
          <span className="text-xs text-on-surface-variant">Ventas concretadas</span>
        </div>
      </div>

      {/* Inventory Table Container */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm overflow-hidden">
        <div className="p-4 border-b border-surface-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">search</span>
            <input
              type="text"
              placeholder="Buscar por marca, modelo o ID..."
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          <div className="text-xs text-on-surface-variant">
            Próximamente: listado y cambios de estado en vivo vía <code className="font-mono text-secondary">/api/publicaciones</code>.
          </div>
        </div>
        <div className="p-8 text-center text-on-surface-variant text-sm">
          Tabla de publicaciones en construcción para el Paso 5.
        </div>
      </div>
    </div>
  )
}
