import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-b from-white via-slate-50 to-surface py-16 lg:py-24 border-b border-surface-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-wrap items-center gap-2.5 mb-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-secondary text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
              Stock Oficial Actualizado Hoy
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-600 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
              150 puntos de peritaje computarizado
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
            <div className="lg:col-span-8">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Tu próximo vehículo seleccionado y certificado con{' '}
                <span className="text-secondary underline decoration-blue-200 underline-offset-8">
                  entrega inmediata.
                </span>
              </h1>
              <p className="text-base text-slate-600 leading-relaxed mt-6 max-w-2xl">
                Concesionaria oficial multimarca premium y utilitarios. Financiación a medida, toma de permutas al mejor valor y garantía mecánica extendida.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-8">
                <Link
                  to="/catalogo"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-md active:scale-95"
                >
                  Ver Catálogo Completo
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
                <Link
                  to="/admin/inventario"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-sm transition-all shadow-sm active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm text-secondary">admin_panel_settings</span>
                  Portal Vendedores
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 bg-surface-container-lowest p-6 rounded-2xl shadow-xl border border-surface-container flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-secondary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-2xl">search</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">Buscador Rápido</h3>
                  <p className="text-xs text-on-surface-variant">Encontrá tu auto por segmento y marca</p>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-surface-container-low rounded-xl text-xs text-on-surface-variant">
                  Próximamente: filtros en vivo conectados a <code className="font-mono text-secondary">/api/catalogos</code>.
                </div>
                <Link
                  to="/catalogo"
                  className="w-full py-2.5 rounded-lg bg-secondary text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-secondary-container transition-colors"
                >
                  Explorar Catálogo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
