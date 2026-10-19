
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  UsePipes,
  HttpCode,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import { MetricasService } from "./metricas.service.ts";
import {
  RegistrarEventoSchema,
  FiltroFechasMetricasSchema,
  TopVehiculosQuerySchema,
  type RegistrarEventoDto,
  type FiltroFechasMetricasDto,
  type TopVehiculosQueryDto,
} from "./dto/metricas.dto.ts";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.ts";
import { AuthGuard } from "../../common/guards/auth.guard.ts";

@Controller("api")
export class MetricasController {
  constructor(
    @Inject(MetricasService) private readonly metricasService: MetricasService,
  ) {}

 
  // POST /api/metricas/evento (Para Maps, WhatsApp general, Redes, etc.)
  @Post("metricas/evento")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(RegistrarEventoSchema))
  async registrarEvento(@Body() dto: RegistrarEventoDto) {
    return await this.metricasService.registrarEvento(dto);
  }

  // POST /api/publicaciones/:id/visitas (Atajo cuando abren la ficha del auto)
  @Post("publicaciones/:id/visitas")
  @HttpCode(HttpStatus.OK)
  async registrarVisitaAuto(@Param("id", ParseIntPipe) id: number) {
    return await this.metricasService.registrarEvento({
      tipoEvento: "VISITA_PUBLICACION",
      idPublicacion: id,
    });
  }

  // POST /api/publicaciones/:id/consultas (Atajo cuando tocan WhatsApp en el auto)
  @Post("publicaciones/:id/consultas")
  @HttpCode(HttpStatus.OK)
  async registrarConsultaAuto(@Param("id", ParseIntPipe) id: number) {
    return await this.metricasService.registrarEvento({
      tipoEvento: "WHATSAPP_PUBLICACION",
      idPublicacion: id,
    });
  }


  // GET /api/metricas/kpis?desde=2026-10-01&hasta=2026-10-31
  @Get("metricas/kpis")
  @UseGuards(AuthGuard)
  async obtenerKpis(
    @Query(new ZodValidationPipe(FiltroFechasMetricasSchema))
    filtros: FiltroFechasMetricasDto,
  ) {
    return await this.metricasService.obtenerKpis(filtros);
  }

  // GET /api/metricas/top-vehiculos?limite=5
  @Get("metricas/top-vehiculos")
  @UseGuards(AuthGuard)
  async obtenerTopVehiculos(
    @Query(new ZodValidationPipe(TopVehiculosQuerySchema))
    query: TopVehiculosQueryDto,
  ) {
    return await this.metricasService.obtenerTopVehiculos(query.limite);
  }

  // GET /api/metricas/segmentos
  @Get("metricas/segmentos")
  @UseGuards(AuthGuard)
  async obtenerDistribucionSegmentos() {
    return await this.metricasService.obtenerDistribucionSegmentos();
  }
}