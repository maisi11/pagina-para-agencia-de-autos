import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiClient, guardarSesion, limpiarSesion } from '../../api/client'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  // Detectar si fue redirigido por sesión expirada (1 hora)
  useEffect(() => {
    if (searchParams.get('expirada') === '1') {
      limpiarSesion()
      setFeedback({
        tipo: 'warning',
        texto: 'La sesión ha excedido el tiempo limite. Por favor, ingresá nuevamente.',
      })
    }
  }, [searchParams])

  const handleAuthSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim() || !password) {
      setFeedback({
        tipo: 'error',
        texto: 'Por favor completá tanto el correo como la contraseña.',
      })
      return
    }

    setLoading(true)
    setFeedback({
      tipo: 'info',
      texto: 'Validando credenciales en la base de datos de Apex Motors...',
    })

    try {
      // Petición real al backend: POST /api/auth/login
      const data = await apiClient('/auth/login', {
        body: {
          email: email.trim(),
          contrasena: password,
        },
      })

      if (!data?.token) {
        throw new Error('No se recibió el token de autenticación del servidor.')
      }

      // Guardar token JWT real con expiración de 1 hora (3600 segundos)
      guardarSesion(data)

      setFeedback({
        tipo: 'success',
        texto: `¡Bienvenido, ${data.usuario?.nombre || 'Asesor'}! Sesión iniciada con éxito. Redirigiendo...`,
      })

      setTimeout(() => {
        navigate('/admin/inventario')
      }, 700)
    } catch (err) {
      console.error('Error de autenticación:', err)
      setLoading(false)
      setFeedback({
        tipo: 'error',
        texto:
          err.message ||
          'Credenciales inválidas. Verificá que el correo y la contraseña coincidan con los registrados en el sistema.',
      })
    }
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
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full pt-28 pb-16 flex-1 flex flex-col items-center justify-center relative overflow-hidden px-4">
        {/* Ambient geometric background accents */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

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
                Ingresá tus credenciales registradas para acceder al inventario y gestión de publicaciones de Apex Motors. Duración máxima de sesión: 1 hora.
              </p>
            </div>
          </div>

          {/* Authentication Form */}
          <form className="space-y-6" onSubmit={handleAuthSubmit}>
            {/* Mensaje de error / estado ubicado directamente arriba del campo de correo */}
            {feedback && (
              <div
                className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in duration-200 text-xs font-semibold ${
                  feedback.tipo === 'error'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : feedback.tipo === 'warning'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : feedback.tipo === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] shrink-0 ${
                    feedback.tipo === 'error'
                      ? 'text-rose-600'
                      : feedback.tipo === 'warning'
                      ? 'text-amber-600'
                      : feedback.tipo === 'success'
                      ? 'text-emerald-600'
                      : 'text-blue-600'
                  }`}
                >
                  {feedback.tipo === 'error'
                    ? 'error'
                    : feedback.tipo === 'warning'
                    ? 'timer'
                    : feedback.tipo === 'success'
                    ? 'check_circle'
                    : 'sync'}
                </span>
                <span className="flex-1 leading-snug">{feedback.texto}</span>
              </div>
            )}

            {/* Corporate Email Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800" htmlFor="corporateEmail">
                  Correo electrónico
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
                  placeholder="ej: vendedor@concesionaria.com"
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
                  onClick={() =>
                    alert('Para soporte o blanqueo de clave corporativa, contactá al administrador del sistema.')
                  }
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

            {/* Utility Row: Remember session */}
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
                <span className="text-xs text-slate-600">Recordar usuario en este equipo</span>
              </label>
            </div>

            {/* Primary CTA Button */}
            <div className="pt-2">
              <button
                className="w-full py-4 px-6 rounded-lg bg-primary hover:bg-slate-800 text-white font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-md cursor-pointer active:scale-[0.99] disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'Validando en la Base de Datos...' : 'Iniciar Sesión'}</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 bg-slate-50 -mx-8 sm:-mx-12 px-8 sm:px-12 rounded-b-2xl border-t border-slate-200 space-y-4">
            <div className="pt-4 pb-2 space-y-3">
              <div className="flex items-start gap-2.5 text-slate-500">
                <span className="material-symbols-outlined text-[16px] text-rose-500 mt-0.5">policy</span>
                <p className="text-xs leading-relaxed">
                  Acceso restringido únicamente a colaboradores autorizados de Apex Motors. Las credenciales son verificadas contra la base de datos oficial.
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
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
