import { Link } from 'react-router-dom'

export default function CrearPublicacionPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
      {/* Navigation & Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-1">
          <Link to="/admin/inventario" className="hover:text-secondary transition-colors">Portal Vendedores</Link>
          <span>/</span>
          <Link to="/admin/inventario" className="hover:text-secondary transition-colors">Inventario</Link>
          <span>/</span>
          <span className="text-secondary font-semibold">Nueva Publicación</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              Crear Publicación de Venta
            </h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Cargue la ficha técnica, precio, dimensiones y galería de fotos.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/inventario"
              className="px-4 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="button"
              className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container shadow-md transition-colors"
            >
              Publicar Vehículo
            </button>
          </div>
        </div>
      </div>

      {/* Form Card Placeholder */}
      <div className="bg-surface-container-lowest p-8 rounded-3xl border border-surface-container shadow-sm space-y-6">
        <div className="p-4 bg-blue-50 rounded-2xl text-xs text-blue-900 flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-2xl">info</span>
          <span>
            Este formulario consumirá el endpoint maestro <code className="font-mono font-bold">GET /api/catalogos</code> para poblar automáticamente los desplegables de marcas, modelos, versiones, carrocerías y transmisiones.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface">Marca</label>
            <div className="p-3 bg-surface-container-low rounded-xl text-xs text-on-surface-variant">
              Cargando catálogo...
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface">Modelo</label>
            <div className="p-3 bg-surface-container-low rounded-xl text-xs text-on-surface-variant">
              Seleccione una marca primero
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-on-surface">Precio (USD / ARS)</label>
            <div className="p-3 bg-surface-container-low rounded-xl text-xs text-on-surface-variant">
              USD 0
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
