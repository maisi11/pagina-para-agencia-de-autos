import { Link, useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()

  const handleSimulatedLogin = (e) => {
    e.preventDefault()
    // Más adelante aquí se integra el login real de Auth0
    navigate('/admin/inventario')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between font-sans text-on-surface">
      {/* Top Bar Minimal */}
      <header className="h-16 border-b border-surface-container px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-lg">directions_car</span>
          </div>
          <span className="font-extrabold text-base tracking-tight text-on-surface">Apex Motors</span>
        </Link>
        <Link
          to="/"
          className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Volver al Catálogo Público
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-3xl border border-surface-container shadow-2xl space-y-6">
          <div className="space-y-1 text-center">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary mx-auto flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-2xl">lock</span>
            </div>
            <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Portal Vendedores</h1>
            <p className="text-xs text-on-surface-variant">
              Ingresá con tu cuenta corporativa para administrar publicaciones y métricas.
            </p>
          </div>

          <form onSubmit={handleSimulatedLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface">Email Corporativo</label>
              <input
                type="email"
                defaultValue="vendedor@concesionaria.com"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-xs text-on-surface border border-transparent focus:border-secondary focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-on-surface">Contraseña</label>
              <input
                type="password"
                defaultValue="••••••••••••"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-xs text-on-surface border border-transparent focus:border-secondary focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">login</span>
              Ingresar al Backoffice
            </button>
          </form>

          <div className="pt-4 border-t border-surface-container text-center text-[11px] text-on-surface-variant">
            Autenticación protegida con <span className="font-semibold text-secondary">Auth0 RS256 JWT</span>
          </div>
        </div>
      </main>

      {/* Footer Minimal */}
      <footer className="py-4 text-center text-xs text-slate-400">
        Apex Motors Backoffice OS • Todos los derechos reservados
      </footer>
    </div>
  )
}
