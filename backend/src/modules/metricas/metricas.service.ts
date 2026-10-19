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

    if (dto.idPublicacion) {
      const pub = await this.publicacionRepo.findById(dto.idPublicacion);
      if (!pub) {
        throw new NotFoundException(`La publicación ${dto.idPublicacion} no existe`);
      }
    }

    let tipo = await this.tipoEventoRepo.findByNombre(dto.tipoEvento);
    if (!tipo) {
      tipo = await this.tipoEventoRepo.create({ nombre: dto.tipoEvento });
    }

    return await this.metricasRepo.create({
      idTipoEvento: tipo.idTipoEvento,
      idPublicacion: dto.idPublicacion ?? null,
      fechaHora: new Date().toISOString(),
    });
  }

  async obtenerKpis(filtros?: FiltroFechasMetricasDto) {
    const metricas = await this.metricasRepo.findAll();


    const metricasFiltradas = metricas.filter((m) => {
      const fecha = m.fechaHora.slice(0, 10);
      if (filtros?.desde && fecha < filtros.desde) return false;
      if (filtros?.hasta && fecha > filtros.hasta) return false;
      return true;
    });

    const tipos = await this.tipoEventoRepo.findAll();
    const mapaTipos = new Map(tipos.map((t) => [t.idTipoEvento, t.nombre]));

    let totalVisitasAutos = 0;
    let totalConsultasWhatsapp = 0;
    let clicsGoogleMaps = 0;
    let consultasWhatsappGenerales = 0;
    let clicsRedesSociales = 0;

    for (const m of metricasFiltradas) {
      const nombreEvento = mapaTipos.get(m.idTipoEvento);
      if (nombreEvento === "VISITA_PUBLICACION") totalVisitasAutos++;
      else if (nombreEvento === "WHATSAPP_PUBLICACION") totalConsultasWhatsapp++;
      else if (nombreEvento === "CLICK_MAPS") clicsGoogleMaps++;
      else if (nombreEvento === "WHATSAPP_GENERAL") consultasWhatsappGenerales++;
      else if (nombreEvento === "CLICK_REDES") clicsRedesSociales++;
    }

    const tasaConversionGlobal =
      totalVisitasAutos > 0
        ? Number(((totalConsultasWhatsapp / totalVisitasAutos) * 100).toFixed(2))
        : 0;

    return {
      totalVisitasAutos,
      totalConsultasWhatsapp,
      tasaConversionGlobal,
      clicsGoogleMaps,
      consultasWhatsappGenerales,
      clicsRedesSociales,
    };
  }

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
        stats.visitas > 0
          ? Number(((stats.consultas / stats.visitas) * 100).toFixed(2))
          : 0;

      return {
        idPublicacion: pub.idPublicacion,
        titulo: pub.titulo,
        precio: pub.precio,
        visitas: stats.visitas,
        consultasWhatsapp: stats.consultas,
        tasaConversion,
        fotoPortada: pub.multimedia?.[0]?.urlArchMultimedia ?? null,
      };
    });

    return ranking.sort((a, b) => b.visitas - a.visitas).slice(0, limite);
  }

 
  async obtenerDistribucionSegmentos() {
    const publicaciones = await this.publicacionRepo.findAllComplete();
    const metricas = await this.metricasRepo.findAll();
    const tipos = await this.tipoEventoRepo.findAll();
    const mapaTipos = new Map(tipos.map((t) => [t.idTipoEvento, t.nombre]));

    const segmentoPorPub = new Map<number, string>();
    for (const pub of publicaciones) {
      const segNombre = (pub.vehiculo as any)?.segmento?.nombreSegmento ?? "Sin Segmento";
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

    const resultado: Array<{ segmento: string; totalVisitas: number; porcentaje: number }> = [];
    visitasPorSegmento.forEach((visitas, segmento) => {
      resultado.push({
        segmento,
        totalVisitas: visitas,
        porcentaje: totalVisitas > 0 ? Number(((visitas / totalVisitas) * 100).toFixed(1)) : 0,
      });
    });

    return resultado.sort((a, b) => b.totalVisitas - a.totalVisitas);
  }
}