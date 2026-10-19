import { Link } from 'react-router-dom'

export default function CatalogoPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Link to="/" className="hover:text-secondary transition-colors">Inicio</Link>
          <span className="text-slate-400">/</span>
          <span className="text-on-surface font-semibold">Catálogo de Vehículos</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
          Catálogo de Vehículos Disponibles
        </h1>
        <p className="text-sm text-on-surface-variant">
          Filtrá por marca, modelo, rango de precio, año y características técnicas.
        </p>
      </div>

      {/* Grid Structure: Sidebar Filters + Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters Placeholder */}
        <aside className="lg:col-span-1 bg-surface-container-lowest p-5 rounded-2xl border border-surface-container shadow-sm h-fit space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container">
            <span className="font-bold text-sm text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-secondary">tune</span>
              Filtros
            </span>
            <button className="text-xs text-secondary hover:underline">Limpiar</button>
          </div>
          <div className="space-y-2 text-xs text-on-surface-variant">
            <p>Marcas, Modelos y Segmentos se conectarán con <code className="font-mono text-secondary">/api/catalogos</code>.</p>
          </div>
        </aside>

        {/* Vehicle Cards Grid Placeholder */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="flex items-center justify-between bg-surface-container-lowest p-4 rounded-xl border border-surface-container text-xs">
            <span className="font-semibold text-on-surface">Mostrando vehículos en stock</span>
            <span className="text-on-surface-variant">Orden: Más recientes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example Card */}
            <div className="bg-surface-container-lowest rounded-2xl border border-surface-container overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <div className="h-44 bg-slate-200 relative flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-4xl">directions_car</span>
                <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                  Disponible
                </span>
              </div>
              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">Toyota</span>
                  <h3 className="text-base font-bold text-on-surface mt-0.5">Hilux SRX 4x4 2.8 TDI</h3>
                  <p className="text-xs text-on-surface-variant mt-1">2023 • 34.000 km • Automática</p>
                </div>
                <div className="pt-2 border-t border-surface-container flex items-center justify-between">
                  <span className="text-lg font-extrabold text-on-surface">USD 42.500</span>
                  <Link
                    to="/vehiculo/1"
                    className="px-3 py-1.5 rounded-lg bg-secondary text-white text-xs font-bold hover:bg-secondary-container transition-colors"
                  >
                    Ver Detalle
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
