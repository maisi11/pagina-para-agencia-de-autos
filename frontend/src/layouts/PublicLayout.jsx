import { Link, NavLink, Outlet } from 'react-router-dom'

export default function PublicLayout() {
  const whatsappPhone = import.meta.env.VITE_WHATSAPP_PHONE || '5491155608800'

  return (
    <div className="min-h-screen flex flex-col bg-surface font-sans text-on-surface antialiased selection:bg-secondary selection:text-white">
      {/* ==========================================
          HEADER & TOPBAR
          ========================================== */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-surface-container shadow-sm">
        {/* Top Bar */}
        <div className="w-full bg-slate-900 text-slate-300 px-4 sm:px-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto h-10 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-4 sm:gap-6">
              <a
                className="flex items-center gap-1.5 hover:text-white transition-colors"
                href="tel:+541148902300"
              >
                <span className="material-symbols-outlined text-[16px] text-blue-400">call</span>
                <span>+54 11 4890-2300</span>
              </a>
              <a
                className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors"
                href={`https://wa.me/${whatsappPhone}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="material-symbols-outlined text-[16px] text-emerald-400">chat</span>
                <span>WhatsApp: +54 9 11 5560-8800</span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:inline text-slate-400">Lun - Sáb: 09:00 - 19:30</span>
              <Link
                to="/admin/inventario"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors border border-slate-700"
              >
                <span className="material-symbols-outlined text-[14px] text-blue-400">lock</span>
                Portal Vendedores
              </Link>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="w-full px-4 sm:px-8">
          <div className="max-w-7xl mx-auto h-18 py-3 flex items-center justify-between gap-4">
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-extrabold text-xl shadow-md group-hover:bg-secondary transition-colors">
                <span className="material-symbols-outlined text-2xl">directions_car</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-secondary transition-colors">
                  Apex Motors
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 -mt-1">
                  Selección Certificada
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive ? 'text-secondary bg-blue-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                Inicio
              </NavLink>
              <NavLink
                to="/catalogo"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-secondary bg-blue-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <span className="material-symbols-outlined text-base">directions_car</span>
                Catálogo de Vehículos
              </NavLink>
              <a
                href="/#servicios"
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Financiamiento & Servicios
              </a>
              <a
                href="/#nosotros"
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Nosotros
              </a>
              <a
                href="/#showroom"
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Contacto & Showroom
              </a>
            </nav>

            {/* Right Action Items */}
            <div className="flex items-center gap-3">
              <a
                href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Hola Apex Motors, quisiera agendar una visita / test drive.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary hover:bg-secondary-container text-white text-sm font-bold transition-all shadow-sm shadow-blue-500/20 active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                <span className="hidden sm:inline">Agendar Visita</span>
                <span className="sm:hidden">Visita</span>
              </a>
              <Link
                to="/login"
                className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
                title="Acceso Asesores"
              >
                <span className="material-symbols-outlined text-[20px]">person</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ==========================================
          DYNAMIC PAGE CONTENT (OUTLET)
          ========================================== */}
      <main className="w-full pt-28 flex-1">
        <Outlet />
      </main>

      {/* ==========================================
          FOOTER INSTITUCIONAL
          ========================================== */}
      <footer className="w-full bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
            {/* Col 1: Brand & Bio */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">directions_car</span>
                </div>
                <span className="text-xl font-extrabold text-white tracking-tight">Apex Motors</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Concesionaria oficial multimarca. Líderes en comercialización de vehículos 0km y seleccionados certificados con peritaje computarizado en 150 puntos y garantía de transferencia inmediata.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <a
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-secondary hover:text-white flex items-center justify-center text-slate-300 transition-colors"
                  href={import.meta.env.VITE_INSTAGRAM_URL || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram"
                >
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                </a>
                <a
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-secondary hover:text-white flex items-center justify-center text-slate-300 transition-colors"
                  href={import.meta.env.VITE_FACEBOOK_URL || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Facebook"
                >
                  <span className="material-symbols-outlined text-[18px]">public</span>
                </a>
                <a
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-secondary hover:text-white flex items-center justify-center text-slate-300 transition-colors"
                  href={`https://wa.me/${whatsappPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                </a>
              </div>
            </div>

            {/* Col 2: Horarios */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Horarios Comerciales</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-300 font-semibold block">Lunes a Viernes:</span>
                  <span className="text-slate-400">09:00 a 19:30 hs</span>
                </div>
                <div>
                  <span className="text-slate-300 font-semibold block">Sábados:</span>
                  <span className="text-slate-400">09:30 a 18:00 hs</span>
                </div>
                <div>
                  <span className="text-slate-300 font-semibold block">Domingos & Feriados:</span>
                  <span className="text-slate-400">Guardia Pasiva WhatsApp</span>
                </div>
              </div>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-800/80 border border-slate-700 text-[11px] text-emerald-400 font-bold w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Showroom Abierto Hoy
              </div>
            </div>

            {/* Col 3: Contacto Showroom */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Showroom Central</h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-blue-400 text-[16px] shrink-0 mt-0.5">location_on</span>
                  <span>Av. del Libertador 4580, Vicente López, Buenos Aires</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-400 text-[16px] shrink-0">call</span>
                  <span>Central: +54 11 4890-2300</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-[16px] shrink-0">chat</span>
                  <span>WhatsApp: +54 9 11 5560-8800</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-400 text-[16px] shrink-0">mail</span>
                  <span>ventas@apexmotors.com.ar</span>
                </div>
              </div>
            </div>

            {/* Col 4: Navegación Rápida */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Navegación</h4>
              <ul className="space-y-2 text-xs">
                <li><Link className="hover:text-white transition-colors" to="/">Inicio</Link></li>
                <li><Link className="hover:text-white transition-colors" to="/catalogo">Catálogo de Vehículos</Link></li>
                <li><a className="hover:text-white transition-colors" href="/#servicios">Financiamiento & Permutas</a></li>
                <li><a className="hover:text-white transition-colors" href="/#nosotros">Nosotros & Trayectoria</a></li>
                <li><Link className="hover:text-white transition-colors" to="/login">Acceso Vendedores</Link></li>
              </ul>
            </div>
          </div>

          {/* Legal & Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Apex Motors S.A. CUIT: 30-71489023-9. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-300 transition-colors cursor-pointer">Términos y Condiciones</span>
              <span className="hover:text-slate-300 transition-colors cursor-pointer">Privacidad de Datos</span>
              <span className="hover:text-slate-300 transition-colors cursor-pointer">Defensa del Consumidor</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
