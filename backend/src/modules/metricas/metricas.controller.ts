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

  // POST /api/metricas/evento
  @Post("metricas/evento")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(RegistrarEventoSchema))
  async registrarEvento(@Body() dto: RegistrarEventoDto) {
    return await this.metricasService.registrarEvento(dto);
  }

  // POST /api/publicaciones/:id/visitas
  @Post("publicaciones/:id/visitas")
  @HttpCode(HttpStatus.OK)
  async registrarVisitaAuto(@Param("id", ParseIntPipe) id: number) {
    return await this.metricasService.registrarEvento({
      tipoEvento: "VISITA_PUBLICACION",
      idPublicacion: id,
    });
  }

  // POST /api/publicaciones/:id/consultas
  @Post("publicaciones/:id/consultas")
  @HttpCode(HttpStatus.OK)
  async registrarConsultaAuto(@Param("id", ParseIntPipe) id: number) {
    return await this.metricasService.registrarEvento({
      tipoEvento: "WHATSAPP_PUBLICACION",
      idPublicacion: id,
    });
  }

  // GET /api/metricas/kpis?periodo=semana
  @Get("metricas/kpis")
  @UseGuards(AuthGuard)
  async obtenerKpis(
    @Query(new ZodValidationPipe(FiltroFechasMetricasSchema))
    filtros: FiltroFechasMetricasDto,
    @Query("periodo") periodo?: string,
  ) {
    return await this.metricasService.obtenerKpis(filtros, periodo || "semana");
  }

  // GET /api/metricas/barras?periodo=semana
  @Get("metricas/barras")
  @UseGuards(AuthGuard)
  async obtenerGraficoBarras(@Query("periodo") periodo?: string) {
    return await this.metricasService.obtenerGraficoBarras(periodo || "semana");
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

  // GET /api/metricas/demanda-insatisfecha
  @Get("metricas/demanda-insatisfecha")
  @UseGuards(AuthGuard)
  async obtenerDemandaInsatisfecha() {
    return await this.metricasService.obtenerDemandaInsatisfecha();
  }

  // GET /api/metricas/carrocerias
  @Get("metricas/carrocerias")
  @UseGuards(AuthGuard)
  async obtenerDistribucionCarrocerias() {
    return await this.metricasService.obtenerDistribucionCarrocerias();
  }
}
