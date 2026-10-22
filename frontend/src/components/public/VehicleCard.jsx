import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MetricasService } from '../../services/metricas.service'

export default function VehicleCard({ publicacion }) {
  if (!publicacion) return null

  const id = publicacion.idPublicacion ?? publicacion.id
  const { vehiculo, precio, moneda, multimedia } = publicacion
  const whatsappPhone = import.meta.env.VITE_WHATSAPP_PHONE || '5491155608800'

  const [esFavorito, setEsFavorito] = useState(false)

  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('apex_wishlist') || '[]')
      setEsFavorito(favs.includes(id))
    } catch {
      // Ignorar error de parsing
    }
  }, [id])

  const toggleFavorito = (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const favs = JSON.parse(localStorage.getItem('apex_wishlist') || '[]')
      let nuevosFavs
      if (favs.includes(id)) {
        nuevosFavs = favs.filter((favId) => favId !== id)
        setEsFavorito(false)
      } else {
        nuevosFavs = [...favs, id]
        setEsFavorito(true)
      }
      localStorage.setItem('apex_wishlist', JSON.stringify(nuevosFavs))
    } catch {
      setEsFavorito(!esFavorito)
    }
  }

  const fotoPortada =
    multimedia && multimedia.length > 0
      ? multimedia[0].urlArchMultimedia || multimedia[0].url
      : 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80'

  const marcaNombre =
    vehiculo?.modelo?.marca?.nombreMarca || vehiculo?.modelo?.marca?.nombre || 'Vehículo'
  const modeloNombre = vehiculo?.modelo?.nombreModelo || vehiculo?.modelo?.nombre || ''
  const versionNombre = vehiculo?.version?.nombreVersion || vehiculo?.version?.nombre || ''
  const anio = vehiculo?.anio || ''
  const tituloCompleto = `${marcaNombre} ${modeloNombre} ${versionNombre} ${anio}`.trim()

  const precioUSD = Number(precio) || 0
  const precioFormateado = `${moneda || 'USD'} ${precioUSD.toLocaleString('es-AR')}`
  const kilometros = vehiculo?.kilometros ?? vehiculo?.kilometraje
  const cajaNombre = vehiculo?.caja?.nombreCaja || vehiculo?.caja?.nombre || 'Manual'
  const segmentoNombre =
    vehiculo?.segmento?.nombreSegmento || vehiculo?.tipoCarroceria?.nombreTipoCarroceria

  // Estado semántico de la publicación
  const estadoNombre = (
    publicacion.historial?.[0]?.estado?.nombreEstado ||
    publicacion.historial?.[0]?.nombreEstado ||
    publicacion.estado ||
    'disponible'
  ).toLowerCase()

  const isPausada = estadoNombre.includes('pausad') || estadoNombre.includes('reserv')
  const isVendida = estadoNombre.includes('finaliz') || estadoNombre.includes('vendid')
  const isDisponible = !isPausada && !isVendida

  const sku = vehiculo?.codigoVehiculo || `APX-${id}`

  const handleWhatsAppClick = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isDisponible) return

    MetricasService.registrarConsultaWhatsApp(id)

    // Plantilla de mensaje inequívoca ("No me hagas pensar")
    const mensaje = encodeURIComponent(
      `¡Hola! Quiero consultar sobre el vehículo ${tituloCompleto} (Ref: #${sku}) publicado en ${precioFormateado}. ¿Sigue disponible?`
    )
    window.open(`https://wa.me/${whatsappPhone}?text=${mensaje}`, '_blank')
  }

  return (
    <article
      className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative ${
        isVendida ? 'opacity-85' : ''
      }`}
    >
      {/* =========================================================================
          CONTENEDOR DE IMAGEN (16:9) CON GRADIENTES DE PROTECCIÓN WCAG Y BADGES
          ========================================================================= */}
      <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden">
        <Link to={`/vehiculo/${id}`} className="block w-full h-full">
          <img
            src={fotoPortada}
            alt={`${tituloCompleto} - Vista concesionaria`}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              isVendida ? 'filter grayscale contrast-90 brightness-90' : ''
            }`}
            loading="lazy"
          />
        </Link>

        {/* Gradientes Oscuros Lineales de Protección (WCAG 2.1) contra fondos blancos/brillantes */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none z-1"></div>
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none z-1"></div>

        {/* Listón Diagonal / Badge Destacado para Unidad Vendida */}
        {isVendida && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none z-10">
            <span className="px-5 py-2 rounded-xl bg-slate-900/95 text-white font-extrabold text-sm uppercase tracking-widest border border-white/60 shadow-2xl rotate-[-6deg] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-slate-300">cancel</span>
              VENDIDO
            </span>
          </div>
        )}

        {/* Wishlist Button (Esquina superior derecha - Sobre gradiente protector) */}
        <button
          onClick={toggleFavorito}
          aria-label={esFavorito ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer shadow-md z-10 ${
            esFavorito
              ? 'bg-rose-500 text-white shadow-rose-500/30'
              : 'bg-black/40 hover:bg-white text-white hover:text-rose-500 border border-white/30'
          }`}
        >
          <span
            className="material-symbols-outlined text-[19px]"
            style={{ fontVariationSettings: esFavorito ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>

        {/* Badges de Estado con Regla de No-Dependencia Cromática (Ícono + Texto) */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none z-10">
          {isDisponible && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">check_circle</span>
              Disponible
            </span>
          )}
          {isPausada && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">pause_circle</span>
              Pausada
            </span>
          )}
          {isVendida && (
            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-white text-[10px] font-extrabold uppercase tracking-wider shadow flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              Vendido
            </span>
          )}
        </div>

        {/* Segmento / Carrocería Pill (Esquina inferior izquierda) */}
        {segmentoNombre && (
          <div className="absolute bottom-2.5 left-3 pointer-events-none z-10">
            <span className="px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold tracking-wide border border-white/20">
              {segmentoNombre}
            </span>
          </div>
        )}
      </div>

      {/* =========================================================================
          CONTENIDO CON MICRO-ESPACIOS LIMPIOS (Paddings 16px - 20px)
          ========================================================================= */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3.5">
        <div>
          {/* Título Principal (H3 Bold) con Puntos de Anclaje Tipográficos */}
          <Link to={`/vehiculo/${id}`} className="block group-hover:text-blue-600 transition-colors">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug line-clamp-1 tracking-tight">
              {marcaNombre} {modeloNombre}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-1 font-medium mt-0.5">
              {versionNombre || 'Edición Oficial Certificada'}
            </p>
          </Link>

          {/* Límite de Máximo 3 Atributos Clave (Año, Kilometraje, Transmisión) */}
          <div className="grid grid-cols-3 gap-1.5 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
            {/* 1. Año */}
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-lg font-medium text-slate-700 justify-center">
              <span className="material-symbols-outlined text-[15px] text-blue-600">calendar_today</span>
              <span className="truncate">{anio || 2024}</span>
            </div>

            {/* 2. Kilometraje */}
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-lg font-medium text-slate-700 justify-center">
              <span className="material-symbols-outlined text-[15px] text-blue-600">speed</span>
              <span className="truncate">
                {kilometros === undefined || kilometros === 0
                  ? '0 km'
                  : `${Number(kilometros).toLocaleString('es-AR')} km`}
              </span>
            </div>

            {/* 3. Transmisión */}
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-lg font-medium text-slate-700 justify-center">
              <span className="material-symbols-outlined text-[15px] text-blue-600">settings</span>
              <span className="truncate">{cajaNombre}</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            PRECIO EN ALTO CONTRASTE (WCAG 2.1) Y ACCIÓN DIRECTA DE WHATSAPP
            ========================================================================= */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
              Precio Contado
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {precioFormateado}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* CTA Primario con Verde Oficial de WhatsApp (#25D366) Exclusivo para Conversión */}
            {isDisponible ? (
              <button
                onClick={handleWhatsAppClick}
                title="Consultar por WhatsApp con un Asesor"
                aria-label={`Consultar por WhatsApp por ${tituloCompleto}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-extrabold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">chat</span>
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            ) : (
              <span
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed border border-slate-200"
                title="Publicación no disponible para consultas directas"
              >
                <span className="material-symbols-outlined text-[15px]">lock</span>
                <span>{isPausada ? 'Pausado' : 'Vendido'}</span>
              </span>
            )}

            <Link
              to={`/vehiculo/${id}`}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors inline-flex items-center gap-1 border border-slate-200/60"
            >
              <span>Ver</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
