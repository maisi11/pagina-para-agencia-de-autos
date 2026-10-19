import { Link, useParams } from 'react-router-dom'

export default function DetallevehiculoPage() {
  const { id } = useParams()
  const whatsappPhone = import.meta.env.VITE_WHATSAPP_PHONE || '5491155608800'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-6 pb-4 border-b border-surface-container">
        <Link to="/" className="hover:text-secondary transition-colors">Inicio</Link>
        <span>/</span>
        <Link to="/catalogo" className="hover:text-secondary transition-colors">Catálogo</Link>
        <span>/</span>
        <span className="text-on-surface font-semibold">Toyota Hilux SRX 4x4 (ID: {id})</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Gallery & Technical Specs */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="h-96 bg-slate-200 rounded-3xl flex items-center justify-center text-slate-400 relative overflow-hidden shadow-inner">
            <span className="material-symbols-outlined text-6xl">directions_car</span>
            <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur text-white text-xs px-3 py-1.5 rounded-xl font-semibold">
              Galería de fotos
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-sm space-y-4">
            <h2 className="text-xl font-extrabold text-on-surface">Ficha Técnica & Especificaciones</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-surface-container-low rounded-xl">
                <span className="text-on-surface-variant block">Motorización</span>
                <span className="font-bold text-on-surface text-sm">2.8 TDI 204 CV</span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-xl">
                <span className="text-on-surface-variant block">Transmisión</span>
                <span className="font-bold text-on-surface text-sm">Automática 6 Vel</span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-xl">
                <span className="text-on-surface-variant block">Tracción</span>
                <span className="font-bold text-on-surface text-sm">4x4 Integral</span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-xl">
                <span className="text-on-surface-variant block">Kilometraje</span>
                <span className="font-bold text-on-surface text-sm">34.000 km</span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-xl">
                <span className="text-on-surface-variant block">Año</span>
                <span className="font-bold text-on-surface text-sm">2023</span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-xl">
                <span className="text-on-surface-variant block">Combustible</span>
                <span className="font-bold text-on-surface text-sm">Diésel</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Price & CTA Card */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-xl flex flex-col gap-5 sticky top-32">
            <div>
              <span className="text-xs font-bold text-secondary uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full">
                Garantía Certificada
              </span>
              <h1 className="text-2xl font-extrabold text-on-surface mt-3">Toyota Hilux SRX 4x4 2.8 TDI</h1>
              <span className="text-3xl font-extrabold text-secondary block mt-2">USD 42.500</span>
            </div>

            <div className="pt-4 border-t border-surface-container flex flex-col gap-3">
              <a
                href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(`Hola Apex Motors, consulto por la publicación #${id} (Toyota Hilux SRX 4x4)`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">chat</span>
                Consultar por WhatsApp
              </a>

              <button
                type="button"
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">calendar_month</span>
                Agendar Test Drive
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
