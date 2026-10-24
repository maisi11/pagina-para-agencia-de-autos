import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { obtenerTokenActivo, limpiarSesion } from '../api/client'

export default function AdminLayout() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [usuarioNombre, setUsuarioNombre] = useState(
    localStorage.getItem('apex_user_name') || 'Martín Benítez'
  )
  const [usuarioEmail, setUsuarioEmail] = useState(
    localStorage.getItem('apex_user_email') || 'vendedor@concesionaria.com'
  )

  // Guardia de sesión: verifica autenticación y límite de 1 hora
  useEffect(() => {
    const token = obtenerTokenActivo()
    if (!token) {
      limpiarSesion()
      navigate('/login?expirada=1', { replace: true })
      return
    }

    const storedName = localStorage.getItem('apex_user_name')
    const storedEmail = localStorage.getItem('apex_user_email')
    if (storedName) setUsuarioNombre(storedName)
    if (storedEmail) setUsuarioEmail(storedEmail)

    // Vigilancia activa: auto-logout si transcurre la hora de vigencia
    const intervalId = setInterval(() => {
      const tokenVigente = obtenerTokenActivo()
      if (!tokenVigente) {
        limpiarSesion()
        navigate('/login?expirada=1', { replace: true })
      }
    }, 10000)

    return () => clearInterval(intervalId)
  }, [navigate])

  const handleLogout = () => {
    limpiarSesion()
    navigate('/login')
  }

  const iniciales = usuarioNombre
    ? usuarioNombre
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'MB'

  const navLinks = [
    {
      to: '/admin/metricas',
      label: 'Dashboard / Métricas',
      icon: 'analytics',
    },
    {
      to: '/admin/inventario',
      label: 'Catálogo & Inventario',
      icon: 'inventory_2',
      badge: null,
    },
    {
      to: '/admin/publicar',
      label: 'Nueva Publicación',
      icon: 'add_circle',
      badge: '+ Crear',
    },
  ]

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900 antialiased selection:bg-secondary selection:text-white">
      {/* =========================================================
          PERSISTENT DESKTOP SIDEBAR (md:flex w-64 fixed left-0)
          ========================================================= */}
      <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-slate-900 text-slate-200 z-40 border-r border-slate-800 shadow-2xl">
        {/* Brand Header */}
        <div className="h-18 px-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-secondary text-white flex items-center justify-center font-bold shadow-md shadow-secondary/20">
            <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-white tracking-tight leading-none">
              Apex Motors
            </span>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mt-1">
              Portal Vendedores
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 py-5 px-3 space-y-6 overflow-y-auto">
          {/* Main Menus */}
          <div>
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-2">
              Gestión Comercial
            </span>
            <nav className="space-y-1">
              {navLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-secondary text-white font-bold shadow-lg shadow-secondary/30 translate-x-1'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide ${
                        item.badge.includes('+')
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* External / Public Shortcuts */}
          <div>
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-2">
              Vista Cliente
            </span>
            <div className="space-y-1">
              <Link
                to="/catalogo"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
                title="Abrir catálogo público de clientes"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-lg text-emerald-400">storefront</span>
                  <span>Catálogo Público</span>
                </div>
                <span className="material-symbols-outlined text-sm text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all">
                  open_in_new
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* User Profile Card & Sign Out (Sticky Footer) */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-secondary text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                {iniciales}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">{usuarioNombre}</span>
                <span className="text-[10px] text-slate-400 truncate">{usuarioEmail}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700/60 transition-colors cursor-pointer"
              title="Cerrar Sesión"
              type="button"
            >
              <span className="material-symbols-outlined text-base">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================
          MOBILE TOPBAR & DRAWER (< md)
          ========================================================= */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 text-white border-b border-slate-800 px-4 h-16 flex items-center justify-between">
        <Link to="/admin/inventario" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-secondary text-white flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-white">Apex Motors</span>
            <span className="text-[9px] text-blue-400 font-bold uppercase">Backoffice</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/publicar"
            className="px-2.5 py-1.5 rounded-lg bg-secondary text-white text-xs font-bold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Publicar</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            type="button"
            aria-label="Abrir menú"
          >
            <span className="material-symbols-outlined text-xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-xs pt-16">
          <div className="bg-slate-900 border-b border-slate-800 p-5 space-y-4">
            <nav className="space-y-1.5">
              {navLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-secondary text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/20 font-bold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
              <Link
                to="/catalogo"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl text-emerald-400">storefront</span>
                  <span>Ver Catálogo Público</span>
                </div>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </Link>
            </nav>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-secondary text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {iniciales}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">{usuarioNombre}</span>
                  <span className="text-[10px] text-slate-400 truncate">{usuarioEmail}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-red-400 flex items-center gap-1 cursor-pointer shrink-0"
                type="button"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MAIN CONTENT WRAPPER WITH PROPER DESKTOP OFFSET
          ========================================================= */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 pt-16 md:pt-0">
        {/* Top Context Bar on Desktop */}
        <header className="hidden md:flex h-14 bg-white border-b border-slate-200 px-8 items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="material-symbols-outlined text-sm text-secondary">shield_person</span>
            <span className="font-semibold text-slate-800">Apex Motors Terminal</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-secondary-container transition-colors"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              <span>Visitar Salón Web</span>
            </Link>
            <span className="text-slate-200">|</span>
          </div>
        </header>

        {/* View Content (Outlet) */}
        <main className="flex-1 bg-surface">
          <Outlet />
        </main>

        {/* Minimal Operational Footer */}
        <footer className="w-full bg-white border-t border-slate-200 py-3 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Apex Motors • Terminal de Salón y Ventas</span>
          <span className="text-[11px] text-slate-400">© {new Date().getFullYear()} Todos los derechos reservados</span>
        </footer>
      </div>
    </div>
  )
}
