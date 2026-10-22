import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('vendedor@concesionaria.com')
  const [password, setPassword] = useState('Probandofuncionamiento123@')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState(null)

  const handleAuthSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setFeedbackMsg('Validando credenciales corporativas en Apex Gateway...')

    setTimeout(() => {
      // Guardar token demo para autenticar peticiones API
      localStorage.setItem('apex_auth_token', 'dev-token-vendedor')
      localStorage.setItem('apex_user_name', 'Martín Benítez')
      localStorage.setItem('apex_user_email', email)

      setFeedbackMsg('Sesión iniciada con éxito. Redirigiendo a inventario...')
      setTimeout(() => {
        navigate('/admin/inventario')
      }, 600)
    }, 800)
  }

  const fillDemoAccount = (demoEmail, demoPass, demoName) => {
    setEmail(demoEmail)
    setPassword(demoPass)
    setFeedbackMsg(`Perfil cargado: ${demoName}. Presioná "Iniciar Sesión" para ingresar.`)
    setTimeout(() => setFeedbackMsg(null), 4000)
  }

  return (
    <div className="min-h-screen bg-background font-sans text-on-surface antialiased flex flex-col justify-between selection:bg-secondary selection:text-white">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-slate-200">
        <div className="h-20 max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                <span className="material-symbols-outlined text-xl">directions_car</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
                Apex Motors
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 pl-6 border-l border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Acceso Seguro Portal Vendedores
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">arrow_back</span>
              <span>Volver a Catálogo</span>
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full pt-28 pb-16 flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Ambient geometric background accents */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

        {/* Technical watermark tag */}
        <div className="mb-6 flex items-center gap-3 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm z-10">
          <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-ping"></span>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Apex Enterprise Gateway • Terminal 04
          </span>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMsg && (
          <div className="mb-4 w-full max-w-xl p-4 rounded-xl bg-secondary text-white shadow-lg flex items-center justify-between gap-3 animate-in fade-in duration-200 z-10">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
              <span className="text-xs font-semibold">{feedbackMsg}</span>
            </div>
            <span className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded">
              Apex Auth
            </span>
          </div>
        )}

        {/* Main Central Auth Frame */}
        <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 z-10">
          {/* Card Top Security Badge & Identity */}
          <div className="flex flex-col items-start gap-4 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 text-slate-800 text-xs font-bold">
              <span className="material-symbols-outlined text-[18px] text-secondary">security</span>
              <span className="text-[11px] uppercase tracking-wider text-slate-600">
                Portal Interno de Asesores &amp; Administración
              </span>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Ingreso al Sistema de Gestión
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Ingresá con tu cuenta corporativa para acceder al panel de inventario y gestión de publicaciones de Apex Motors.
              </p>
            </div>
          </div>

          {/* Authentication Form */}
          <form className="space-y-6" onSubmit={handleAuthSubmit}>
            {/* Corporate Email Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800" htmlFor="corporateEmail">
                  Correo electrónico corporativo
                </label>
                <span className="text-[11px] text-slate-400">Requerido</span>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-slate-400 text-[20px] pointer-events-none">
                  alternate_email
                </span>
                <input
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                  id="corporateEmail"
                  name="email"
                  placeholder="ej: mbenitez@apexmotors.com.ar"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800" htmlFor="corporatePassword">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => alert('Para soporte o blanqueo de clave corporativa, contactá a it@apexmotors.com.ar')}
                  className="text-xs text-secondary hover:underline cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-slate-400 text-[20px] pointer-events-none">
                  lock
                </span>
                <input
                  className="w-full pl-12 pr-20 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                  id="corporatePassword"
                  name="password"
                  placeholder="••••••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute right-3 px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                  <span>{showPassword ? 'Ocultar' : 'Ver'}</span>
                </button>
              </div>
            </div>

            {/* Utility Row: Remember session & TLS Badge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  className="w-4 h-4 rounded border-slate-300 text-secondary focus:ring-secondary cursor-pointer"
                  id="rememberSession"
                  name="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="text-xs text-slate-600">Recordar sesión en este equipo</span>
              </label>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">
                <span className="material-symbols-outlined text-[14px] text-secondary">verified_user</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  TLS 256-bit Encriptado
                </span>
              </div>
            </div>

            {/* Primary CTA Button */}
            <div className="pt-2">
              <button
                className="w-full py-4 px-6 rounded-lg bg-primary hover:bg-slate-800 text-white font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-md cursor-pointer active:scale-[0.99] disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'Ingresando...' : 'Iniciar Sesión'}</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </form>

          {/* Testing / Demo Fast Fill Roles Selector */}
          <div className="mt-8 pt-8 bg-slate-50 -mx-8 sm:-mx-12 px-8 sm:px-12 rounded-b-2xl border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-secondary">quick_reference</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Accesos Rápidos Demo / Perfiles Internos
                </span>
              </div>
              <span className="text-[10px] font-bold text-secondary uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                1-Click Test
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="group px-3 py-2 rounded-lg bg-white border border-slate-200 text-left shadow-sm hover:border-secondary hover:shadow transition-all flex items-center gap-2.5 cursor-pointer"
                onClick={() => fillDemoAccount('vendedor@concesionaria.com', 'Probandofuncionamiento123@', 'Martín Benítez')}
                type="button"
              >
                <span className="w-2 h-2 rounded-full bg-secondary group-hover:scale-125 transition-transform"></span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Martín Benítez</p>
                  <p className="text-[10px] text-slate-500">Ventas 4x4 / Pick-ups</p>
                </div>
              </button>
              <button
                className="group px-3 py-2 rounded-lg bg-white border border-slate-200 text-left shadow-sm hover:border-secondary hover:shadow transition-all flex items-center gap-2.5 cursor-pointer"
                onClick={() => fillDemoAccount('vendedor@concesionaria.com', 'Probandofuncionamiento123@', 'Gonzalo Martínez')}
                type="button"
              >
                <span className="w-2 h-2 rounded-full bg-blue-600 group-hover:scale-125 transition-transform"></span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Gonzalo Martínez</p>
                  <p className="text-[10px] text-slate-500">Asesor SUVs &amp; Familiares</p>
                </div>
              </button>
              <button
                className="group px-3 py-2 rounded-lg bg-white border border-slate-200 text-left shadow-sm hover:border-secondary hover:shadow transition-all flex items-center gap-2.5 cursor-pointer"
                onClick={() => fillDemoAccount('vendedor@concesionaria.com', 'Probandofuncionamiento123@', 'Sofía Albarracín')}
                type="button"
              >
                <span className="w-2 h-2 rounded-full bg-secondary group-hover:scale-125 transition-transform"></span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Sofía Albarracín</p>
                  <p className="text-[10px] text-slate-500">Atención Comercial</p>
                </div>
              </button>
            </div>

            {/* System Alerts / Notice of Restriction */}
            <div className="pt-4 pb-2 space-y-3">
              <div className="flex items-start gap-2.5 text-slate-500">
                <span className="material-symbols-outlined text-[16px] text-red-500 mt-0.5">policy</span>
                <p className="text-xs leading-relaxed">
                  Acceso restringido únicamente a colaboradores autorizados de Apex Motors S.A. Toda actividad dentro de este portal es monitoreada y auditada según los protocolos de compliance.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
                <Link
                  className="inline-flex items-center gap-1.5 font-bold text-secondary hover:underline cursor-pointer"
                  to="/catalogo"
                >
                  <span className="material-symbols-outlined text-[16px]">storefront</span>
                  <span>Volver a la Web Pública / Catálogo</span>
                </Link>
                <button
                  type="button"
                  onClick={() => alert('Mesa de ayuda TI: it@apexmotors.com.ar • Interno 4402')}
                  className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">help_center</span>
                  <span>Mesa de ayuda TI / Soporte</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Telemetry Indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">dns</span>
            <span className="font-mono uppercase text-[10px] font-bold">Nodo Cluster: APEX-BUE-01</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-secondary">lan</span>
            <span className="font-mono uppercase text-[10px] font-bold">Red Segura Intranet</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-slate-500">sync</span>
            <span className="font-mono uppercase text-[10px] font-bold">Sincronización de Stock: En Línea</span>
          </div>
        </div>
      </main>
    </div>
  )
}
