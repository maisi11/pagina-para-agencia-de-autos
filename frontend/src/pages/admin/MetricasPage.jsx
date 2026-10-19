import { Link } from 'react-router-dom'

export default function MetricasPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-1">
            <Link to="/admin/inventario" className="hover:text-secondary transition-colors">Portal Vendedores</Link>
            <span>/</span>
            <span className="text-secondary font-semibold">Métricas y Reportes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Dashboard de Métricas & Rendimiento
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Analítica de interacción digital, conversión de leads por WhatsApp y demanda de vehículos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors">
            Últimos 30 días
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">sync</span>
            Sincronizar
          </button>
        </div>
      </div>

      {/* Metric KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between text-on-surface-variant text-xs font-bold uppercase">
            <span>Visitas al Catálogo</span>
            <span className="material-symbols-outlined text-secondary text-base">visibility</span>
          </div>
          <span className="text-3xl font-extrabold text-on-surface">48.650</span>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">trending_up</span> +14.2% vs mes anterior
          </span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between text-on-surface-variant text-xs font-bold uppercase">
            <span>Clics a WhatsApp</span>
            <span className="material-symbols-outlined text-emerald-600 text-base">chat</span>
          </div>
          <span className="text-3xl font-extrabold text-emerald-600">1.280</span>
          <span className="text-xs text-on-surface-variant">Leads comerciales directos</span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between text-on-surface-variant text-xs font-bold uppercase">
            <span>Interés Showroom</span>
            <span className="material-symbols-outlined text-blue-600 text-base">location_on</span>
          </div>
          <span className="text-3xl font-extrabold text-blue-600">840</span>
          <span className="text-xs text-on-surface-variant">Clics en Google Maps</span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between text-on-surface-variant text-xs font-bold uppercase">
            <span>Conversión Global</span>
            <span className="material-symbols-outlined text-secondary text-base">percent</span>
          </div>
          <span className="text-3xl font-extrabold text-on-surface">2.63%</span>
          <span className="text-xs text-on-surface-variant">Visitas $\rightarrow$ Leads WhatsApp</span>
        </div>
      </div>

      {/* Notice */}
      <div className="p-6 bg-surface-container-lowest rounded-2xl border border-surface-container text-xs text-on-surface-variant text-center">
        Gráficos y ranking de vehículos más vistos conectados a <code className="font-mono text-secondary">/api/metricas/dashboard</code> en el Paso 5.
      </div>
    </div>
  )
}
