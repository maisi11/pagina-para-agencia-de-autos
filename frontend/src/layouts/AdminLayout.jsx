import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'

export default function AdminLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    // Más adelante aquí llamamos al logout de Auth0
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface font-sans text-on-surface antialiased">
      {/* ==========================================
          BACKOFFICE HEADER & SYSTEM BAR
          ========================================== */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(11,28,48,0.04)] border-b border-surface-container">
        {/* System Bar */}
        <div className="w-full bg-primary text-on-primary px-4 sm:px-8">
          <div className="max-w-7xl mx-auto h-9 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse"></span>
              <span className="text-tertiary-fixed font-semibold">Apex Backoffice OS</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400 hidden sm:inline">v2.4.1 Estable · Conexión Segura SSL</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                title="Abrir vista de clientes"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                <span>Ver Catálogo Público</span>
              </Link>
              <span className="text-slate-600">•</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-slate-300 hover:text-red-400 transition-colors bg-transparent border-0 cursor-pointer p-0"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>

        {/* Operational Header */}
        <div className="w-full px-4 sm:px-8 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              {/* Brand */}
              <Link to="/admin/inventario" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-sm group-hover:bg-secondary transition-colors">
                  <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-on-surface tracking-tight leading-none">
                    Apex Motors
                  </span>
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-wider mt-0.5">
                    Portal Vendedores & Backoffice
                  </span>
                </div>
              </Link>

              {/* Navigation Tabs */}
              <nav className="hidden md:flex items-center gap-1">
                <NavLink
                  to="/admin/inventario"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-surface-container-high text-on-surface font-bold shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-base text-secondary">inventory_2</span>
                  <span>Inventario de Publicaciones</span>
                </NavLink>
                <NavLink
                  to="/admin/metricas"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-surface-container-high text-on-surface font-bold shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-base text-blue-600">analytics</span>
                  <span>Métricas y Reportes</span>
                </NavLink>
              </nav>
            </div>

            {/* Right Actions & Profile */}
            <div className="flex items-center gap-4">
              <Link
                to="/admin/publicar"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold shadow-sm hover:bg-primary-container transition-all cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-base text-tertiary-fixed">add_circle</span>
                <span className="hidden sm:inline">+ Nueva Publicación</span>
                <span className="sm:hidden">Publicar</span>
              </Link>

              <div className="flex items-center gap-2.5 pl-3 border-l border-surface-container">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  MB
                </div>
                <div className="hidden lg:flex flex-col">
                  <span className="text-xs font-bold text-on-surface leading-tight">
                    Martín Benítez
                  </span>
                  <span className="text-[10px] text-on-surface-variant leading-none">
                    Asesor Senior • Sucursal Norte
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ==========================================
          BACKOFFICE VIEW CONTENT (OUTLET)
          ========================================== */}
      <main className="w-full pt-26 flex-1 bg-surface">
        <Outlet />
      </main>

      {/* ==========================================
          FOOTER MINIMALISTA OPERACIONAL
          ========================================== */}
      <footer className="w-full bg-surface-container-lowest border-t border-surface-container py-3 px-4 sm:px-8 text-xs text-on-surface-variant">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Apex Motors Backoffice • Terminal Segura de Gestión de Stock y Leads</span>
          <span className="text-[11px] text-slate-400">© {new Date().getFullYear()} Sistema Interno Homologado</span>
        </div>
      </footer>
    </div>
  )
}
