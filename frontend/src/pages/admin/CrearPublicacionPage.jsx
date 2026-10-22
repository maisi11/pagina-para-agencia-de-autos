import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CatalogosService } from '../../services/catalogos.service'
import { PublicacionesService } from '../../services/publicaciones.service'

export default function CrearPublicacionPage() {
  const navigate = useNavigate()
  const [catalogos, setCatalogos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [statusState, setStatusState] = useState('disponible') // 'disponible' | 'pausada'
  const [toastMessage, setToastMessage] = useState(null)

  // Step 1: Identificación
  const [idMarca, setIdMarca] = useState(1)
  const [idModelo, setIdModelo] = useState(1)
  const [titulo, setTitulo] = useState('Toyota Hilux SRX 4x4 2.8 TDI AT6 2024')
  const [version, setVersion] = useState('SRX 4x4 2.8 TDI 6AT Cuero Bi-Tono')
  const [idCarroceria, setIdCarroceria] = useState(8) // Pick-up
  const [idSegmento, setIdSegmento] = useState(4) // Segmento D
  const [idCondicion, setIdCondicion] = useState(1) // Usado
  const [anio, setAnio] = useState(2024)
  const [kilometros, setKilometros] = useState(18400)
  const [es0km, setEs0km] = useState(false)
  const [patente, setPatente] = useState('AF 892 XQ')
  const [colorExt, setColorExt] = useState('Blanco Perlado')
  const [colorInt, setColorInt] = useState('Cuero Negro')

  // Step 2: Mecánica & Tren Motriz
  const [idCombustible, setIdCombustible] = useState(4) // Gasoil Grado 3
  const [idCaja, setIdCaja] = useState(2) // Automática
  const [idTraccion, setIdTraccion] = useState(4) // 4x4 conectable
  const [idTipoDireccion, setIdTipoDireccion] = useState(1) // Eléctrica
  const [idTipoTapizado, setIdTipoTapizado] = useState(2) // Cuero
  const [idMotor, setIdMotor] = useState(1) // 2.8 TDI
  const [puertas, setPuertas] = useState(4)
  const [asientos, setAsientos] = useState(5)
  const [airbags, setAirbags] = useState(7)
  const [remolque, setRemolque] = useState(3500)
  const [baul, setBaul] = useState(1000)
  const [tanque, setTanque] = useState(80)

  // Dimensiones
  const [largo, setLargo] = useState(5325)
  const [ancho, setAncho] = useState(1855)
  const [alto, setAlto] = useState(1815)

  // Step 3: Precio, Descripción & Galería de Imágenes
  const [precio, setPrecio] = useState(47500)
  const [descripcion, setDescripcion] = useState(
    'Unidad seleccionada en estado inmaculado. Servicios oficiales al día en concesionario oficial. Tratamiento cerámico recién aplicado y garantía mecánica oficial certificada. Lista para transferir con entrega inmediata.'
  )

  // Galería de fotos con soporte de reordenamiento
  const [galeria, setGaleria] = useState([
    'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  ])
  const [nuevaFotoUrl, setNuevaFotoUrl] = useState('')

  // Control de campos tocados (touched) para feedback UX en tiempo real
  const [touched, setTouched] = useState({
    titulo: false,
    precio: false,
    patente: false,
    anio: false,
    kilometros: false,
    nuevaFotoUrl: false,
  })

  const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }))

  const notificar = (msg, tipo = 'success') => {
    setToastMessage({ texto: msg, tipo })
    setTimeout(() => setToastMessage(null), 4000)
  }

  // =========================================================
  // MOTOR DE VALIDACIÓN EN TIEMPO REAL (ZOD COMPATIBLE)
  // =========================================================
  const errores = useMemo(() => {
    const errs = {}

    // Título: min 5, max 120
    if (!titulo || titulo.trim().length < 5) {
      errs.titulo = 'El título debe tener al menos 5 caracteres.'
    } else if (titulo.trim().length > 120) {
      errs.titulo = 'El título no puede superar los 120 caracteres.'
    }

    // Precio: numérico > 0
    if (isNaN(Number(precio)) || Number(precio) <= 0) {
      errs.precio = 'El precio debe ser un valor mayor a 0 USD.'
    }

    // Patente: 6 a 8 caracteres alfanuméricos
    const patenteClean = patente.replace(/\s+/g, '')
    if (!patenteClean || patenteClean.length < 6 || patenteClean.length > 8) {
      errs.patente = 'Patente inválida (debe contener entre 6 y 8 caracteres).'
    }

    // Año: 1990 - 2026
    const anioNum = Number(anio)
    if (isNaN(anioNum) || anioNum < 1990 || anioNum > 2026) {
      errs.anio = 'El año debe estar entre 1990 y 2026.'
    }

    // Kilómetros: >= 0
    if (isNaN(Number(kilometros)) || Number(kilometros) < 0) {
      errs.kilometros = 'Los kilómetros no pueden ser un valor negativo.'
    }

    // Galería: al menos 1 foto válida
    if (galeria.length === 0) {
      errs.galeria = 'Debe cargar al menos una fotografía de portada.'
    }

    return errs
  }, [titulo, precio, patente, anio, kilometros, galeria])

  const formularioValido = Object.keys(errores).length === 0

  useEffect(() => {
    async function cargarCatalogos() {
      try {
        const data = await CatalogosService.obtenerTodos()
        if (data) {
          setCatalogos(data)
          if (data.marcas?.[0]) setIdMarca(data.marcas[0].idMarca ?? data.marcas[0].id)
          if (data.modelos?.[0]) setIdModelo(data.modelos[0].idModelo ?? data.modelos[0].id)
          if (data.carrocerias?.[0]) setIdCarroceria(data.carrocerias[0].idTipoCarroceria ?? data.carrocerias[0].id)
          if (data.segmentos?.[0]) setIdSegmento(data.segmentos[0].idSegmento ?? data.segmentos[0].id)
          if (data.combustibles?.[0]) setIdCombustible(data.combustibles[0].idCombustible ?? data.combustibles[0].id)
          if (data.cajas?.[0]) setIdCaja(data.cajas[0].idCaja ?? data.cajas[0].id)
          if (data.tracciones?.[0]) setIdTraccion(data.tracciones[0].idTraccion ?? data.tracciones[0].id)
          if (data.condiciones?.[0]) setIdCondicion(data.condiciones[0].idCondicion ?? data.condiciones[0].id)
          if (data.direcciones?.[0]) setIdTipoDireccion(data.direcciones[0].idTipoDireccion ?? data.direcciones[0].id)
          if (data.tapizados?.[0]) setIdTipoTapizado(data.tapizados[0].idTipoTapizado ?? data.tapizados[0].id)
        }
      } catch (err) {
        console.error('Error cargando catálogos:', err)
      } finally {
        setCargando(false)
      }
    }
    cargarCatalogos()
  }, [])

  // Modelos filtrados por marca
  const modelosFiltrados = catalogos?.modelos
    ? catalogos.modelos.filter((m) => Number(m.idMarca) === Number(idMarca))
    : []

  const handleMarcaChange = (e) => {
    const nuevaMarcaId = Number(e.target.value)
    setIdMarca(nuevaMarcaId)
    const primerModelo = catalogos?.modelos?.find((m) => Number(m.idMarca) === nuevaMarcaId)
    if (primerModelo) {
      setIdModelo(primerModelo.idModelo ?? primerModelo.id)
    }
  }

  const handleCheckbox0km = (checked) => {
    setEs0km(checked)
    if (checked) {
      setKilometros(1)
      setIdCondicion(2) // 0km / Nuevo
    } else {
      setKilometros(18400)
      setIdCondicion(1) // Usado
    }
  }

  // Gestión de Galería: Reordenar / Eliminar / Agregar
  const moverFoto = (index, direccion) => {
    const nuevaLista = [...galeria]
    const destino = index + direccion
    if (destino < 0 || destino >= nuevaLista.length) return
    const temp = nuevaLista[index]
    nuevaLista[index] = nuevaLista[destino]
    nuevaLista[destino] = temp
    setGaleria(nuevaLista)
  }

  const eliminarFoto = (index) => {
    if (galeria.length <= 0) {
      notificar('Debe mantener al menos una fotografía de portada', 'error')
      return
    }
    setGaleria(galeria.filter((_, i) => i !== index))
  }

  const agregarFoto = () => {
    const url = nuevaFotoUrl.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      notificar('La URL debe comenzar con http:// o https://', 'error')
      return
    }
    setGaleria([...galeria, url])
    setNuevaFotoUrl('')
    notificar('Fotografía agregada a la galería')
  }

  // Guardar publicación
  const handleSubmit = async (e) => {
    if (e) e.preventDefault()

    // Marcar todos como tocados
    setTouched({
      titulo: true,
      precio: true,
      patente: true,
      anio: true,
      kilometros: true,
      nuevaFotoUrl: false,
    })

    if (!formularioValido) {
      notificar('Por favor corrija los campos marcados en rojo antes de publicar.', 'error')
      return
    }

    setGuardando(true)

    const codigoGenerado = `APX-${patente.replace(/\s+/g, '').slice(0, 6).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`

    const payload = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      precio: Number(precio),
      idUsuario: 1, // Vendedor logueado (Martín Benítez)
      vehiculo: {
        codigoVehiculo: codigoGenerado,
        patente: patente.trim().toUpperCase(),
        anio: Number(anio),
        kilometros: Number(kilometros),
        cantidadPuertas: Number(puertas),
        color: colorExt.trim(),
        cantidadAsientos: Number(asientos),
        capacidadRemolque: Number(remolque),
        capacidadBaul: Number(baul),
        capacidadTanque: Number(tanque),
        cantidadAirbags: Number(airbags),

        idMarca: Number(idMarca),
        idModelo: Number(idModelo),
        idSegmento: Number(idSegmento),
        idTipoCarroceria: Number(idCarroceria),
        idCondicion: Number(idCondicion),
        idCaja: Number(idCaja),
        idTraccion: Number(idTraccion),
        idCombustible: Number(idCombustible),
        idTipoDireccion: Number(idTipoDireccion),
        idTipoTapizado: Number(idTipoTapizado),
        idMotor: Number(idMotor),

        dimensiones: {
          largo: Number(largo),
          alto: Number(alto),
          ancho: Number(ancho),
        },
      },
    }

    try {
      const resp = await PublicacionesService.crear(payload)
      const nuevoId = resp?.idPublicacion ?? resp?.id
      
      // Si el vendedor seleccionó estado inicial 'pausada', actualizamos de inmediato
      if (statusState === 'pausada' && nuevoId) {
        await PublicacionesService.cambiarEstado(nuevoId, 'pausada')
      }

      notificar('¡Publicación creada exitosamente en la base de datos!')
      setTimeout(() => {
        navigate('/admin/inventario')
      }, 1000)
    } catch (err) {
      console.error('Error al crear publicación:', err)
      notificar(err.message || 'Error al validar o guardar la publicación en el backend', 'error')
      setGuardando(false)
    }
  }

  // Estilo reactivo según validación
  const getInputClass = (fieldName, base = '') => {
    const isTouched = touched[fieldName]
    const hasError = Boolean(errores[fieldName])

    if (!isTouched) {
      return `${base} bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-secondary`
    }
    if (hasError) {
      return `${base} bg-rose-50/50 border-rose-500 text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-400`
    }
    return `${base} bg-emerald-50/40 border-emerald-500 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-400`
  }

  const fotoPrincipal = galeria[0] || 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80'

  return (
    <div className="w-full bg-slate-50 min-h-[calc(100vh-60px)] pb-20 selection:bg-secondary selection:text-white">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed top-18 right-6 z-50 text-white px-5 py-3.5 rounded-xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastMessage.tipo === 'error'
              ? 'bg-rose-950 border-rose-700 text-rose-100'
              : 'bg-slate-900 border-slate-700'
          }`}
        >
          <span
            className={`material-symbols-outlined text-lg ${
              toastMessage.tipo === 'error' ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {toastMessage.tipo === 'error' ? 'error' : 'check_circle'}
          </span>
          <span className="text-xs font-semibold">{toastMessage.texto}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="w-full bg-white shadow-sm border-b border-slate-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5">
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Link to="/admin/inventario" className="hover:text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">inventory_2</span>
              Portal Vendedores
            </Link>
            <span className="material-symbols-outlined text-xs text-slate-300">chevron_right</span>
            <Link to="/admin/inventario" className="hover:text-secondary">Inventario Activo</Link>
            <span className="material-symbols-outlined text-xs text-slate-300">chevron_right</span>
            <span className="text-secondary font-semibold">Alta de Publicación</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-1">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Alta de Vehículo para Salón
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
                  Validación Zod Activa
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Ficha técnica oficial, validación en tiempo real y reordenamiento de fotos para el showroom.
              </p>
            </div>

            {/* Estado Inicial y Botón de Publicación */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl shadow-inner">
                <button
                  type="button"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusState === 'disponible' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'
                  }`}
                  onClick={() => setStatusState('disponible')}
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  Disponible (Tráfico)
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusState === 'pausada' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600'
                  }`}
                  onClick={() => setStatusState('pausada')}
                >
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  Pausada (Seña)
                </button>
              </div>

              <Link
                to="/admin/inventario"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-all"
              >
                Cancelar
              </Link>

              {/* Botón Guardar - Inhabilitado si el formulario tiene errores */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!formularioValido || guardando}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer ${
                  formularioValido && !guardando
                    ? 'bg-secondary hover:bg-secondary-container shadow-secondary/30'
                    : 'bg-slate-400 cursor-not-allowed opacity-60'
                }`}
                title={!formularioValido ? 'Corrija los campos requeridos para habilitar' : 'Publicar vehículo'}
              >
                <span className="material-symbols-outlined text-base">
                  {guardando ? 'sync' : 'rocket_launch'}
                </span>
                <span>{guardando ? 'Publicando...' : 'Publicar Vehículo'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Master Form (8 cols) */}
          <form className="lg:col-span-8 flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* STEP 1: Identificación & Datos Clave */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                    01
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Identificación &amp; Datos Clave</h2>
                    <p className="text-xs text-slate-500">Datos de patente, modelo vehicular y año de fabricación</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-wider">
                  Obligatorio
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Título de la Publicación con Validación */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">
                      Título de la Publicación *
                    </label>
                    {touched.titulo && !errores.titulo && (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        Válido
                      </span>
                    )}
                  </div>
                  <input
                    className={getInputClass('titulo', 'w-full h-11 px-3.5 border rounded-xl text-sm transition-all')}
                    type="text"
                    required
                    value={titulo}
                    onFocus={() => markTouched('titulo')}
                    onChange={(e) => {
                      setTitulo(e.target.value)
                      markTouched('titulo')
                    }}
                  />
                  {touched.titulo && errores.titulo && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">error</span>
                      {errores.titulo}
                    </p>
                  )}
                </div>

                {/* Brand Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Marca *</label>
                  <select
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                    value={idMarca}
                    onChange={handleMarcaChange}
                  >
                    {catalogos?.marcas?.map((m) => (
                      <option key={m.idMarca ?? m.id} value={m.idMarca ?? m.id}>
                        {m.nombreMarca ?? m.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Model Selector (Cascading) */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Modelo *</label>
                  <select
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                    value={idModelo}
                    onChange={(e) => setIdModelo(Number(e.target.value))}
                  >
                    {modelosFiltrados.map((m) => (
                      <option key={m.idModelo ?? m.id} value={m.idModelo ?? m.id}>
                        {m.nombreModelo ?? m.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Versión específica */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Versión / Configuración Específica
                  </label>
                  <input
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="Ej: SRX 4x4 2.8 TDI 6AT Cuero"
                  />
                </div>

                {/* Carrocería */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Carrocería *</label>
                  <select
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                    value={idCarroceria}
                    onChange={(e) => setIdCarroceria(Number(e.target.value))}
                  >
                    {catalogos?.carrocerias?.map((c) => (
                      <option key={c.idTipoCarroceria ?? c.id} value={c.idTipoCarroceria ?? c.id}>
                        {c.nombreTipoCarroceria ?? c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Año con Validación */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">Año de Fabricación *</label>
                    {touched.anio && !errores.anio && (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        Válido
                      </span>
                    )}
                  </div>
                  <select
                    className={getInputClass('anio', 'w-full h-11 px-3.5 border rounded-xl text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer')}
                    value={anio}
                    onFocus={() => markTouched('anio')}
                    onChange={(e) => {
                      setAnio(Number(e.target.value))
                      markTouched('anio')
                    }}
                  >
                    {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  {touched.anio && errores.anio && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">error</span>
                      {errores.anio}
                    </p>
                  )}
                </div>

                {/* Kilometraje con Validación */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">Kilometraje Actual *</label>
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
                      <input
                        className="w-3.5 h-3.5 rounded text-secondary cursor-pointer"
                        type="checkbox"
                        checked={es0km}
                        onChange={(e) => handleCheckbox0km(e.target.checked)}
                      />
                      <span>0km / Sin rodar</span>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      className={getInputClass('kilometros', 'w-full h-11 pl-3.5 pr-12 border rounded-xl text-sm')}
                      type="number"
                      min="0"
                      value={kilometros}
                      onFocus={() => markTouched('kilometros')}
                      onChange={(e) => {
                        setKilometros(Number(e.target.value))
                        markTouched('kilometros')
                      }}
                    />
                    <span className="absolute right-3.5 top-3 text-xs text-slate-400 font-bold">KM</span>
                  </div>
                  {touched.kilometros && errores.kilometros && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">error</span>
                      {errores.kilometros}
                    </p>
                  )}
                </div>

                {/* Patente con Validación */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">
                      Patente / Identificador *
                    </label>
                    {touched.patente && !errores.patente && (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        Válido
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      className={getInputClass('patente', 'w-full h-11 px-3.5 border rounded-xl font-mono text-sm uppercase')}
                      type="text"
                      maxLength={8}
                      value={patente}
                      onFocus={() => markTouched('patente')}
                      onChange={(e) => {
                        setPatente(e.target.value.toUpperCase())
                        markTouched('patente')
                      }}
                    />
                    <span className="material-symbols-outlined absolute right-3.5 top-2.5 text-slate-400 text-base">
                      verified
                    </span>
                  </div>
                  {touched.patente && errores.patente && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">error</span>
                      {errores.patente}
                    </p>
                  )}
                </div>

                {/* Colores */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Color Exterior</label>
                  <input
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                    type="text"
                    value={colorExt}
                    onChange={(e) => setColorExt(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Acabado Interior</label>
                  <input
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                    type="text"
                    value={colorInt}
                    onChange={(e) => setColorInt(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* STEP 2: Mecánica & Tren Motriz */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  02
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Mecánica &amp; Tren Motriz</h2>
                  <p className="text-xs text-slate-500">Tracción, combustible, transmisión y seguridad activa</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Combustible */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Tipo de Combustible</label>
                  <select
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                    value={idCombustible}
                    onChange={(e) => setIdCombustible(Number(e.target.value))}
                  >
                    {catalogos?.combustibles?.map((c) => (
                      <option key={c.idCombustible ?? c.id} value={c.idCombustible ?? c.id}>
                        {c.nombreCombustible ?? c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transmisión */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Transmisión</label>
                  <select
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                    value={idCaja}
                    onChange={(e) => setIdCaja(Number(e.target.value))}
                  >
                    {catalogos?.cajas?.map((c) => (
                      <option key={c.idCaja ?? c.id} value={c.idCaja ?? c.id}>
                        {c.nombreCaja ?? c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tracción */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Tracción</label>
                  <select
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer"
                    value={idTraccion}
                    onChange={(e) => setIdTraccion(Number(e.target.value))}
                  >
                    {catalogos?.tracciones?.map((t) => (
                      <option key={t.idTraccion ?? t.id} value={t.idTraccion ?? t.id}>
                        {t.nombreTraccion ?? t.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Puertas y Asientos */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Puertas</label>
                    <input
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
                      type="number"
                      min="2"
                      max="6"
                      value={puertas}
                      onChange={(e) => setPuertas(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Airbags</label>
                    <input
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
                      type="number"
                      min="0"
                      max="12"
                      value={airbags}
                      onChange={(e) => setAirbags(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Dimensiones (mm) */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Dimensiones del Vehículo (en milímetros)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Largo (mm)</span>
                      <input
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                        type="number"
                        value={largo}
                        onChange={(e) => setLargo(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Ancho (mm)</span>
                      <input
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                        type="number"
                        value={ancho}
                        onChange={(e) => setAncho(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Alto (mm)</span>
                      <input
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                        type="number"
                        value={alto}
                        onChange={(e) => setAlto(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: Precio, Galería con Reordenamiento & Descripción */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  03
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Precio &amp; Galería Fotográfica</h2>
                  <p className="text-xs text-slate-500">Valor de venta en dólares y fotos de alta resolución con reordenamiento</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Precio USD con Validación */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">Precio de Contado (USD) *</label>
                    {touched.precio && !errores.precio && (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        Válido
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-bold text-slate-700">USD</span>
                    <input
                      className={getInputClass('precio', 'w-full h-11 pl-14 pr-4 border rounded-xl font-bold text-base')}
                      type="number"
                      min="1000"
                      step="500"
                      value={precio}
                      onFocus={() => markTouched('precio')}
                      onChange={(e) => {
                        setPrecio(Number(e.target.value))
                        markTouched('precio')
                      }}
                    />
                  </div>
                  {touched.precio && errores.precio && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">error</span>
                      {errores.precio}
                    </p>
                  )}
                </div>

                {/* Galería de Fotos con Reordenamiento y Previsualización */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block">
                        Galería de Fotografías de Showroom
                      </label>
                      <span className="text-[11px] text-slate-500">
                        La primera imagen corresponde a la portada del catálogo. Usa las flechas para reordenar.
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-secondary bg-blue-50 px-2 py-0.5 rounded">
                      {galeria.length} fotos cargadas
                    </span>
                  </div>

                  {/* Strip de Miniaturas con Controles */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {galeria.map((url, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-xl overflow-hidden border p-2 bg-white flex flex-col gap-2 shadow-sm ${
                          idx === 0 ? 'border-secondary ring-2 ring-secondary/20' : 'border-slate-200'
                        }`}
                      >
                        <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-slate-900">
                          <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                          {idx === 0 && (
                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-secondary text-white text-[9px] font-bold uppercase tracking-wide">
                              ★ Portada Principal
                            </span>
                          )}
                          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono">
                            #{idx + 1}
                          </span>
                        </div>

                        {/* Botones de Reordenamiento */}
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moverFoto(idx, -1)}
                              disabled={idx === 0}
                              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                              title="Mover a la izquierda"
                            >
                              <span className="material-symbols-outlined text-sm">arrow_back</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => moverFoto(idx, 1)}
                              disabled={idx === galeria.length - 1}
                              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                              title="Mover a la derecha"
                            >
                              <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => eliminarFoto(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                            title="Quitar foto"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input para Agregar Nueva Foto */}
                  <div className="flex gap-2 pt-2">
                    <input
                      className="flex-1 h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                      type="url"
                      value={nuevaFotoUrl}
                      onChange={(e) => setNuevaFotoUrl(e.target.value)}
                      placeholder="Pegar URL de foto adicional (https://...)"
                    />
                    <button
                      type="button"
                      onClick={agregarFoto}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
                      <span>Agregar Foto</span>
                    </button>
                  </div>
                </div>

                {/* Descripción */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-800 mb-1">Descripción de la Unidad</label>
                  <textarea
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary leading-relaxed"
                    rows="3"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>
          </form>

          {/* Right Column: Live Card Preview & Compliance Check (~32%) */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-20">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  Previsualización en Vivo
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    statusState === 'disponible'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {statusState}
                </span>
              </div>

              {/* Card visual matching VehicleCard con gradientes de protección WCAG */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
                  <img className="w-full h-full object-cover" src={fotoPrincipal} alt={titulo} />
                  {/* Gradientes Oscuros de Protección WCAG */}
                  <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-1"></div>
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-1"></div>

                  <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wide z-10 flex items-center gap-1 shadow">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                    {statusState.toUpperCase()}
                  </span>
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/80 text-white text-[10px] font-bold z-10 shadow">
                    {anio}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{titulo}</h3>
                  <div className="text-base font-extrabold text-slate-900">
                    USD {Number(precio).toLocaleString('es-AR')}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>{kilometros > 0 ? `${Number(kilometros).toLocaleString()} km` : '0 km'}</span>
                    <span className="text-right truncate">{version.slice(0, 16)}</span>
                  </div>
                </div>
              </div>

              {/* Compliance Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                  <span>Documentación e informe de dominio al día</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                  <span>Garantía oficial y transferencia inmediata</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                  <span>Fotografía real verificada de showroom</span>
                </div>
              </div>

              {/* Estado de Validación */}
              {!formularioValido ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                  <span className="font-bold block">Campos pendientes de validación:</span>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5">
                    {Object.values(errores).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                  <span className="font-semibold">Todos los campos técnicos son válidos.</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!formularioValido || guardando}
                className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                  formularioValido && !guardando
                    ? 'bg-secondary hover:bg-secondary-container shadow-secondary/30'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-70'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {guardando ? 'sync' : 'rocket_launch'}
                </span>
                <span>{guardando ? 'Guardando en Base de Datos...' : 'Confirmar y Publicar en Catálogo'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
