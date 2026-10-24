// src/modules/metricas/metricas.service.ts
import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { MetricasPublicacionRepository } from "../../repository/metricas-publicacion.repository.ts";
import { TipoEventoRepository } from "../../repository/tipo-evento.repository.ts";
import { PublicacionRepository } from "../../repository/publicacion.repository.ts";
import type { RegistrarEventoDto, FiltroFechasMetricasDto } from "./dto/metricas.dto.ts";

@Injectable()
export class MetricasService {
  constructor(
    @Inject(MetricasPublicacionRepository)
    private readonly metricasRepo: MetricasPublicacionRepository,
    @Inject(TipoEventoRepository)
    private readonly tipoEventoRepo: TipoEventoRepository,
    @Inject(PublicacionRepository)
    private readonly publicacionRepo: PublicacionRepository,
  ) {}

  async registrarEvento(dto: RegistrarEventoDto) {
    let idPub = dto.idPublicacion;
    if (idPub) {
      const pub = await this.publicacionRepo.findById(idPub);
      if (!pub) {
        throw new NotFoundException(`La publicación ${idPub} no existe`);
      }
    } else {
      const primeraPub = await this.publicacionRepo.findAll({ limit: 1 });
      idPub = primeraPub[0]?.idPublicacion ?? 1;
    }

    // Si es búsqueda de catálogo con término, registrar nombre descriptivo para análisis de demanda
    let nombreEvento = dto.tipoEvento;
    if (dto.tipoEvento === "BUSQUEDA_CATALOGO" && dto.metadata?.busqueda) {
      nombreEvento = `BUSQUEDA: ${String(dto.metadata.busqueda).trim().toUpperCase()}`;
    }

    let tipo = await this.tipoEventoRepo.findByNombre(nombreEvento);
    if (!tipo) {
      tipo = await this.tipoEventoRepo.create({ nombre: nombreEvento });
    }

    return await this.metricasRepo.create({
      idTipoEvento: tipo.idTipoEvento,
      idPublicacion: idPub,
      fechaHora: new Date().toISOString(),
    });
  }

  // KPIs 100% REALES calculados directamente desde la base de datos
  async obtenerKpis(filtros?: FiltroFechasMetricasDto, periodo: string = "semana") {
    const metricas = await this.metricasRepo.findAll();
    const tipos = await this.tipoEventoRepo.findAll();
    const mapaTipos = new Map(tipos.map((t) => [t.idTipoEvento, t.nombre]));

    const ahora = new Date();
    let duracionMs = 7 * 24 * 60 * 60 * 1000;
    if (periodo === "mes") duracionMs = 30 * 24 * 60 * 60 * 1000;
    else if (periodo === "trimestre") duracionMs = 90 * 24 * 60 * 60 * 1000;
    else if (periodo === "anio") duracionMs = 365 * 24 * 60 * 60 * 1000;

    const fechaCorteActual = new Date(ahora.getTime() - duracionMs);
    const fechaCorteAnterior = new Date(fechaCorteActual.getTime() - duracionMs);

    // Métricas del período seleccionado
    const metricasPeriodo = metricas.filter((m) => {
      if (!m.fechaHora) return false;
      const f = new Date(m.fechaHora);
      if (filtros?.desde && m.fechaHora.slice(0, 10) < filtros.desde) return false;
      if (filtros?.hasta && m.fechaHora.slice(0, 10) > filtros.hasta) return false;
      if (!filtros?.desde && f < fechaCorteActual) return false;
      return true;
    });

    // Métricas del período inmediatamente anterior (para comparación real)
    const metricasPeriodoAnterior = metricas.filter((m) => {
      if (!m.fechaHora) return false;
      const f = new Date(m.fechaHora);
      return f >= fechaCorteAnterior && f < fechaCorteActual;
    });

    let totalVisitasAutos = 0;
    let totalConsultasWhatsapp = 0; // Por publicaciones específicas
    let clicsGoogleMaps = 0; // Intención de visita física
    let consultasWhatsappGenerales = 0; // Botón flotante / general
    let clicsRedesSociales = 0;

    const visitasPorPublicacion = new Map<number, number>();
    const consultasPorPublicacion = new Map<number, number>();

    for (const m of metricasPeriodo) {
      const nombreEvento = mapaTipos.get(m.idTipoEvento) || "";
      if (nombreEvento === "VISITA_PUBLICACION") {
        totalVisitasAutos++;
        if (m.idPublicacion) {
          visitasPorPublicacion.set(
            m.idPublicacion,
            (visitasPorPublicacion.get(m.idPublicacion) ?? 0) + 1
          );
        }
      } else if (nombreEvento === "WHATSAPP_PUBLICACION") {
        totalConsultasWhatsapp++;
        if (m.idPublicacion) {
          consultasPorPublicacion.set(
            m.idPublicacion,
            (consultasPorPublicacion.get(m.idPublicacion) ?? 0) + 1
          );
        }
      } else if (nombreEvento === "CLICK_MAPS") {
        clicsGoogleMaps++;
      } else if (nombreEvento === "WHATSAPP_GENERAL" || nombreEvento === "CLICK_WHATSAPP") {
        consultasWhatsappGenerales++;
      } else if (nombreEvento === "CLICK_REDES") {
        clicsRedesSociales++;
      }
    }

    // Contar consultas del período anterior para variación real
    let consultasAnterior = 0;
    for (const m of metricasPeriodoAnterior) {
      const nombreEvento = mapaTipos.get(m.idTipoEvento) || "";
      if (
        nombreEvento === "WHATSAPP_PUBLICACION" ||
        nombreEvento === "WHATSAPP_GENERAL" ||
        nombreEvento === "CLICK_WHATSAPP"
      ) {
        consultasAnterior++;
      }
    }

    const totalConsultasWhatsappTotal = totalConsultasWhatsapp + consultasWhatsappGenerales;

    // Variación real vs período anterior (sin inventar números)
    let comparativaConsultasTexto: string | null = null;
    let variacionPositiva: boolean = true;
    if (consultasAnterior > 0) {
      const diff = ((totalConsultasWhatsappTotal - consultasAnterior) / consultasAnterior) * 100;
      variacionPositiva = diff >= 0;
      comparativaConsultasTexto = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}% vs período anterior`;
    } else if (totalConsultasWhatsappTotal > 0) {
      comparativaConsultasTexto = `+${totalConsultasWhatsappTotal} consultas este período`;
    } else {
      comparativaConsultasTexto = "Sin consultas registradas en este período";
    }

    const tasaConversionGlobal =
      totalVisitasAutos > 0
        ? Number(((totalConsultasWhatsapp / totalVisitasAutos) * 100).toFixed(2))
        : 0;

    // Publicaciones en la base de datos
    const publicaciones = await this.publicacionRepo.findAllComplete();
    const publicacionesActivas = publicaciones.filter((p) => {
      const estadoActual = p.historial?.find((h) => !h.fechaHoraFinalizacion)?.estado?.nombre;
      return estadoActual === "disponible" || !estadoActual;
    });

    const valorInventarioTotal = publicacionesActivas.reduce((acc, p) => acc + (p.precio || 0), 0);
    const precioPromedio =
      publicacionesActivas.length > 0
        ? Math.round(valorInventarioTotal / publicacionesActivas.length)
        : 0;

    // Auto más consultado del período (100% real de la BD)
    let idAutoMasConsultado: number | null = null;
    let maxConsultasAuto = -1;
    for (const [idPub, cant] of consultasPorPublicacion.entries()) {
      if (cant > maxConsultasAuto) {
        maxConsultasAuto = cant;
        idAutoMasConsultado = idPub;
      }
    }

    if (!idAutoMasConsultado) {
      let maxVisitasAuto = -1;
      for (const [idPub, cant] of visitasPorPublicacion.entries()) {
        if (cant > maxVisitasAuto) {
          maxVisitasAuto = cant;
          idAutoMasConsultado = idPub;
        }
      }
    }

    const pubMasConsultada = idAutoMasConsultado
      ? publicaciones.find((p) => p.idPublicacion === idAutoMasConsultado)
      : null;

    return {
      totalVisitasAutos,
      totalConsultasWhatsappPub: totalConsultasWhatsapp,
      consultasWhatsappGenerales,
      totalConsultasWhatsappTotal,
      tasaConversionGlobal,
      clicsGoogleMaps,
      clicsRedesSociales,
      valorInventarioTotal,
      precioPromedio,
      totalPublicacionesActivas: publicacionesActivas.length,
      totalPublicaciones: publicaciones.length,
      autoMasConsultado: pubMasConsultada ? pubMasConsultada.titulo : null,
      comparativaConsultas: {
        texto: comparativaConsultasTexto,
        positiva: variacionPositiva,
        consultasAnterior,
      },
    };
  }

  // Gráfico de Barras DUAL con datos 100% REALES de la base de datos
  async obtenerGraficoBarras(periodo: string = "semana") {
    const metricas = await this.metricasRepo.findAll();
    const tipos = await this.tipoEventoRepo.findAll();
    const mapaTipos = new Map(tipos.map((t) => [t.idTipoEvento, t.nombre]));

    const ahora = new Date();

    if (periodo === "semana") {
      const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      const dias: Array<{ fechaISO: string; etiqueta: string; visitasVal: number; waVal: number }> = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(ahora.getTime() - i * 24 * 60 * 60 * 1000);
        const fechaISO = d.toISOString().slice(0, 10);
        const diaNombre = diasSemana[d.getDay()];
        const etiqueta = `${diaNombre} ${d.getDate()}/${d.getMonth() + 1}`;
        dias.push({ fechaISO, etiqueta, visitasVal: 0, waVal: 0 });
      }

      for (const m of metricas) {
        if (!m.fechaHora) continue;
        const fISO = m.fechaHora.slice(0, 10);
        const diaBucket = dias.find((d) => d.fechaISO === fISO);
        if (!diaBucket) continue;

        const nombreEvento = mapaTipos.get(m.idTipoEvento) || "";
        if (nombreEvento === "VISITA_PUBLICACION") diaBucket.visitasVal++;
        else if (nombreEvento === "WHATSAPP_PUBLICACION" || nombreEvento === "WHATSAPP_GENERAL") {
          diaBucket.waVal++;
        }
      }

      const maxVal = Math.max(...dias.map((d) => Math.max(d.visitasVal, d.waVal)), 1);

      return dias.map((d) => ({
        etiqueta: d.etiqueta,
        visitasVal: d.visitasVal,
        waVal: d.waVal,
        visitas: maxVal > 0 && d.visitasVal > 0 ? Math.round((d.visitasVal / maxVal) * 100) : 0,
        wa: maxVal > 0 && d.waVal > 0 ? Math.round((d.waVal / maxVal) * 100) : 0,
      }));
    } else if (periodo === "mes") {
      // 4 semanas cronológicas del mes
      const semanas = [
        { etiqueta: "Sem 1", diasAtrasInicio: 28, diasAtrasFin: 21, visitasVal: 0, waVal: 0 },
        { etiqueta: "Sem 2", diasAtrasInicio: 21, diasAtrasFin: 14, visitasVal: 0, waVal: 0 },
        { etiqueta: "Sem 3", diasAtrasInicio: 14, diasAtrasFin: 7, visitasVal: 0, waVal: 0 },
        { etiqueta: "Sem 4", diasAtrasInicio: 7, diasAtrasFin: 0, visitasVal: 0, waVal: 0 },
      ];

      for (const sem of semanas) {
        const fin = new Date(ahora.getTime() - sem.diasAtrasFin * 24 * 60 * 60 * 1000);
        const inicio = new Date(ahora.getTime() - sem.diasAtrasInicio * 24 * 60 * 60 * 1000);

        for (const m of metricas) {
          if (!m.fechaHora) continue;
          const f = new Date(m.fechaHora);
          if (f >= inicio && f <= fin) {
            const nombreEvento = mapaTipos.get(m.idTipoEvento) || "";
            if (nombreEvento === "VISITA_PUBLICACION") sem.visitasVal++;
            else if (nombreEvento === "WHATSAPP_PUBLICACION" || nombreEvento === "WHATSAPP_GENERAL") {
              sem.waVal++;
            }
          }
        }
      }

      const maxVal = Math.max(...semanas.map((s) => Math.max(s.visitasVal, s.waVal)), 1);

      return semanas.map((s) => ({
        etiqueta: s.etiqueta,
        visitasVal: s.visitasVal,
        waVal: s.waVal,
        visitas: maxVal > 0 && s.visitasVal > 0 ? Math.round((s.visitasVal / maxVal) * 100) : 0,
        wa: maxVal > 0 && s.waVal > 0 ? Math.round((s.waVal / maxVal) * 100) : 0,
      }));
    } else if (periodo === "trimestre") {
      // Últimos 3 meses cronológicos
      const mesesNombres = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
      ];
      const trimMeses: Array<{ mesIndex: number; etiqueta: string; anio: number; visitasVal: number; waVal: number }> = [];

      for (let i = 2; i >= 0; i--) {
        const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
        trimMeses.push({
          mesIndex: d.getMonth(),
          etiqueta: `${mesesNombres[d.getMonth()]} ${d.getFullYear()}`,
          anio: d.getFullYear(),
          visitasVal: 0,
          waVal: 0,
        });
      }

      for (const m of metricas) {
        if (!m.fechaHora) continue;
        const f = new Date(m.fechaHora);
        const bucket = trimMeses.find(
          (b) => b.mesIndex === f.getMonth() && b.anio === f.getFullYear()
        );
        if (!bucket) continue;

        const nombreEvento = mapaTipos.get(m.idTipoEvento) || "";
        if (nombreEvento === "VISITA_PUBLICACION") bucket.visitasVal++;
        else if (nombreEvento === "WHATSAPP_PUBLICACION" || nombreEvento === "WHATSAPP_GENERAL") {
          bucket.waVal++;
        }
      }

      const maxVal = Math.max(...trimMeses.map((b) => Math.max(b.visitasVal, b.waVal)), 1);

      return trimMeses.map((b) => ({
        etiqueta: b.etiqueta,
        visitasVal: b.visitasVal,
        waVal: b.waVal,
        visitas: maxVal > 0 && b.visitasVal > 0 ? Math.round((b.visitasVal / maxVal) * 100) : 0,
        wa: maxVal > 0 && b.waVal > 0 ? Math.round((b.waVal / maxVal) * 100) : 0,
      }));
    } else {
      // 12 meses cronológicos del año actual
      const mesesNombres = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
      ];
      const anioActual = ahora.getFullYear();
      const anioBuckets = mesesNombres.map((etiqueta, mesIndex) => ({
        mesIndex,
        etiqueta,
        visitasVal: 0,
        waVal: 0,
      }));

      for (const m of metricas) {
        if (!m.fechaHora) continue;
        const f = new Date(m.fechaHora);
        if (f.getFullYear() !== anioActual) continue;

        const bucket = anioBuckets[f.getMonth()];
        if (!bucket) continue;

        const nombreEvento = mapaTipos.get(m.idTipoEvento) || "";
        if (nombreEvento === "VISITA_PUBLICACION") bucket.visitasVal++;
        else if (nombreEvento === "WHATSAPP_PUBLICACION" || nombreEvento === "WHATSAPP_GENERAL") {
          bucket.waVal++;
        }
      }

      const maxVal = Math.max(...anioBuckets.map((b) => Math.max(b.visitasVal, b.waVal)), 1);

      return anioBuckets.map((b) => ({
        etiqueta: b.etiqueta,
        visitasVal: b.visitasVal,
        waVal: b.waVal,
        visitas: maxVal > 0 && b.visitasVal > 0 ? Math.round((b.visitasVal / maxVal) * 100) : 0,
        wa: maxVal > 0 && b.waVal > 0 ? Math.round((b.waVal / maxVal) * 100) : 0,
      }));
    }
  }

  // Top vehículos con diagnóstico comercial real derivado de la BD
  async obtenerTopVehiculos(limite: number = 5) {
    const publicaciones = await this.publicacionRepo.findAllComplete();
    const metricas = await this.metricasRepo.findAll();
    const tipos = await this.tipoEventoRepo.findAll();
    const mapaTipos = new Map(tipos.map((t) => [t.idTipoEvento, t.nombre]));

    const conteo = new Map<number, { visitas: number; consultas: number }>();

    for (const m of metricas) {
      if (!m.idPublicacion) continue;
      const actual = conteo.get(m.idPublicacion) ?? { visitas: 0, consultas: 0 };
      const nombre = mapaTipos.get(m.idTipoEvento);

      if (nombre === "VISITA_PUBLICACION") actual.visitas++;
      if (nombre === "WHATSAPP_PUBLICACION") actual.consultas++;

      conteo.set(m.idPublicacion, actual);
    }

    const ranking = publicaciones.map((pub) => {
      const stats = conteo.get(pub.idPublicacion) ?? { visitas: 0, consultas: 0 };
      const tasaConversion =
        stats.visitas > 0 ? Number(((stats.consultas / stats.visitas) * 100).toFixed(1)) : 0;

      let clasificacion = "Buen Rendimiento";
      let clasificacionTipo: "estrella" | "alerta" | "normal" = "normal";
      let alertaComercial = "Rendimiento comercial equilibrado.";

      if (stats.visitas === 0 && stats.consultas === 0) {
        clasificacion = "Sin visitas aún";
        clasificacionTipo = "normal";
        alertaComercial = "Sin actividad registrada en este período.";
      } else if (stats.visitas >= 15 && stats.consultas === 0) {
        clasificacion = "⚠️ Alerta Roja: Auto Clavo";
        clasificacionTipo = "alerta";
        alertaComercial = "Atrae miradas pero 0 consultas. Revisar precio o fotos.";
      } else if (tasaConversion >= 10 && stats.consultas > 0) {
        clasificacion = "⭐ Auto Estrella";
        clasificacionTipo = "estrella";
        alertaComercial = "¡Auto muy buscado y con alta tasa de conversión a consulta!";
      } else if (stats.consultas > 0) {
        clasificacion = "Buen Rendimiento";
        clasificacionTipo = "normal";
        alertaComercial = "Consultas activas registradas.";
      } else {
        clasificacion = "En observación";
        clasificacionTipo = "normal";
        alertaComercial = "Pocas visitas acumuladas.";
      }

      return {
        idPublicacion: pub.idPublicacion,
        titulo: pub.titulo,
        precio: pub.precio,
        visitas: stats.visitas,
        consultasWhatsapp: stats.consultas,
        tasaConversion,
        fotoPortada: pub.multimedia?.[0]?.urlArchMultimedia ?? null,
        clasificacion,
        clasificacionTipo,
        alertaComercial,
      };
    });

    return ranking.sort((a, b) => b.visitas - a.visitas).slice(0, limite);
  }

  // Demanda por segmento: 100% de la BD (visitas reales o stock real)
  async obtenerDistribucionSegmentos() {
    const publicaciones = await this.publicacionRepo.findAllComplete();
    const metricas = await this.metricasRepo.findAll();
    const tipos = await this.tipoEventoRepo.findAll();
    const mapaTipos = new Map(tipos.map((t) => [t.idTipoEvento, t.nombre]));

    const segmentoPorPub = new Map<number, string>();
    for (const pub of publicaciones) {
      const segNombre = (pub.vehiculo as any)?.segmento?.nombreSegmento?.trim() ?? "Sin Segmento";
      segmentoPorPub.set(pub.idPublicacion, segNombre);
    }

    const visitasPorSegmento = new Map<string, number>();
    let totalVisitas = 0;

    for (const m of metricas) {
      if (!m.idPublicacion) continue;
      if (mapaTipos.get(m.idTipoEvento) !== "VISITA_PUBLICACION") continue;

      const seg = segmentoPorPub.get(m.idPublicacion) ?? "Otros";
      visitasPorSegmento.set(seg, (visitasPorSegmento.get(seg) ?? 0) + 1);
      totalVisitas++;
    }

    // Si no hay visitas registradas, computar proporción del inventario físico en stock
    let esDistribucionStock = false;
    if (totalVisitas === 0) {
      esDistribucionStock = true;
      for (const pub of publicaciones) {
        const seg = (pub.vehiculo as any)?.segmento?.nombreSegmento?.trim() ?? "Otros";
        visitasPorSegmento.set(seg, (visitasPorSegmento.get(seg) ?? 0) + 1);
        totalVisitas++;
      }
    }

    const resultado: Array<{ segmento: string; totalVisitas: number; porcentaje: number }> = [];
    visitasPorSegmento.forEach((visitas, segmento) => {
      resultado.push({
        segmento,
        totalVisitas: visitas,
        porcentaje: totalVisitas > 0 ? Number(((visitas / totalVisitas) * 100).toFixed(1)) : 0,
      });
    });

    return {
      datos: resultado.sort((a, b) => b.totalVisitas - a.totalVisitas),
      esDistribucionStock,
      totalVisitas,
    };
  }

  // Demanda insatisfecha 100% REAL: consulta eventos "BUSQUEDA: ..." en TipoEvento
  async obtenerDemandaInsatisfecha() {
    const publicaciones = await this.publicacionRepo.findAllComplete();
    const metricas = await this.metricasRepo.findAll();
    const tipos = await this.tipoEventoRepo.findAll();

    // Filtrar solo los tipos de evento que corresponden a búsquedas reales en el catálogo
    const tiposBusqueda = tipos.filter((t) => t.nombre.startsWith("BUSQUEDA: "));

    if (tiposBusqueda.length === 0) {
      // CERO DATOS HARDCODEADOS: Si no hay búsquedas registradas aún, retornar array vacío
      return [];
    }

    const conteoBusquedas = new Map<number, number>();
    for (const m of metricas) {
      conteoBusquedas.set(m.idTipoEvento, (conteoBusquedas.get(m.idTipoEvento) ?? 0) + 1);
    }

    const publicacionesActivas = publicaciones.filter((p) => {
      const estado = p.historial?.find((h) => !h.fechaHoraFinalizacion)?.estado?.nombre;
      return estado === "disponible" || !estado;
    });

    const resultado = [];
    for (const tipo of tiposBusqueda) {
      const termino = tipo.nombre.replace("BUSQUEDA: ", "").trim();
      const cantBusquedas = conteoBusquedas.get(tipo.idTipoEvento) ?? 0;
      if (cantBusquedas === 0) continue;

      // Verificar si hay vehículos en stock que coincidan con la búsqueda
      const terminoLower = termino.toLowerCase();
      const enStockCoincidencias = publicacionesActivas.filter((p) => {
        const titulo = p.titulo.toLowerCase();
        const modelo = (p.vehiculo as any)?.modelo?.nombreModelo?.toLowerCase() || "";
        const marca = (p.vehiculo as any)?.modelo?.marca?.nombreMarca?.toLowerCase() || "";
        return (
          titulo.includes(terminoLower) ||
          modelo.includes(terminoLower) ||
          marca.includes(terminoLower)
        );
      });

      const enStock = enStockCoincidencias.length > 0;
      const stockCantidad = enStockCoincidencias.length;

      resultado.push({
        termino,
        busquedas: cantBusquedas,
        enStock,
        stockCantidad,
        estado: enStock ? `🟢 ${stockCantidad} en stock` : "⚠️ Sin stock en inventario",
        insight: enStock
          ? "Unidad en stock disponible para atender la demanda."
          : `Demanda insatisfecha (${cantBusquedas} búsquedas). Oportunidad de compra para reventa.`,
      });
    }

    return resultado.sort((a, b) => b.busquedas - a.busquedas);
  }

  // Carrocerías 100% REALES de la base de datos
  async obtenerDistribucionCarrocerias() {
    const publicaciones = await this.publicacionRepo.findAllComplete();
    const metricas = await this.metricasRepo.findAll();
    const tipos = await this.tipoEventoRepo.findAll();
    const mapaTipos = new Map(tipos.map((t) => [t.idTipoEvento, t.nombre]));

    if (publicaciones.length === 0) {
      return [];
    }

    const carroceriaPorPub = new Map<number, string>();
    for (const pub of publicaciones) {
      const carrNombre =
        (pub.vehiculo as any)?.tipoCarroceria?.nombreTipoCarroceria?.trim() ||
        (pub.vehiculo as any)?.tipoCarroceria?.nombreCarroceria?.trim() ||
        (pub.vehiculo as any)?.tipoCarroceria?.nombre?.trim();
      carroceriaPorPub.set(
        pub.idPublicacion,
        carrNombre && carrNombre.length > 0 ? carrNombre : "Otros"
      );
    }

    const conteo = new Map<string, number>();
    let total = 0;

    for (const m of metricas) {
      if (!m.idPublicacion) continue;
      if (mapaTipos.get(m.idTipoEvento) !== "VISITA_PUBLICACION") continue;

      const carr = carroceriaPorPub.get(m.idPublicacion) ?? "Otros";
      conteo.set(carr, (conteo.get(carr) ?? 0) + 1);
      total++;
    }

    // Si aún no hay visitas, calcular proporción de unidades físicas en stock
    if (total === 0) {
      for (const pub of publicaciones) {
        const carr =
          (pub.vehiculo as any)?.tipoCarroceria?.nombreTipoCarroceria?.trim() ||
          (pub.vehiculo as any)?.tipoCarroceria?.nombreCarroceria?.trim() ||
          "Otros";
        conteo.set(carr, (conteo.get(carr) ?? 0) + 1);
        total++;
      }
    }

    const lista = Array.from(conteo.entries())
      .map(([categoria, cantidad]) => ({
        categoria,
        cantidad,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);

    if (lista.length <= 4) {
      return lista.map((item) => ({
        ...item,
        porcentaje: total > 0 ? Number(((item.cantidad / total) * 100).toFixed(1)) : 0,
      }));
    }

    const top3 = lista.slice(0, 3);
    const otrosCantidad = lista.slice(3).reduce((acc, curr) => acc + curr.cantidad, 0);

    return [
      ...top3.map((item) => ({
        ...item,
        porcentaje: total > 0 ? Number(((item.cantidad / total) * 100).toFixed(1)) : 0,
      })),
      {
        categoria: "Otros",
        cantidad: otrosCantidad,
        porcentaje: total > 0 ? Number(((otrosCantidad / total) * 100).toFixed(1)) : 0,
      },
    ];
  }
}
