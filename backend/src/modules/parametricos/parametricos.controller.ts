import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UsePipes,
  HttpCode,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import { ParametricosService } from "./parametricos.service.ts";
import {
  CreateParametricoSimpleSchema,
  CreateParametricoConDescripcionSchema,
  CreateMarcaSchema,
  CreateModeloSchema,
  CreateVersionSchema,
  CreateTipoMotorSchema,
  CreateMotorSchema,
  type CreateParametricoSimpleDto,
  type CreateParametricoConDescripcionDto,
  type CreateMarcaDto,
  type CreateModeloDto,
  type CreateVersionDto,
  type CreateTipoMotorDto,
  type CreateMotorDto,
} from "./dto/parametricos.dto.ts";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.ts";

@Controller("api")
export class ParametricosController {
  constructor(
    @Inject(ParametricosService) private readonly parametricosService: ParametricosService,
  ) {}

  // ==========================================
  // CATÁLOGOS COMPLETOS (Para React)
  // ==========================================
  @Get("catalogos")
  async obtenerCatalogos() {
    return await this.parametricosService.obtenerTodosLosCatalogos();
  }

  // ==========================================
  // MARCAS
  // ==========================================
  @Get("marcas")
  async listarMarcas() {
    return await this.parametricosService.listarMarcas();
  }

  @Get("marcas/:id")
  async detalleMarca(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.buscarMarcaPorId(id);
  }

  @Get("marcas/:id/modelos")
  async modelosPorMarca(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.buscarMarcaConModelos(id);
  }

  @Post("marcas")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateMarcaSchema))
  async crearMarca(@Body() dto: CreateMarcaDto) {
    return await this.parametricosService.crearMarca(dto);
  }

  @Delete("marcas/:id")
  async eliminarMarca(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.eliminarMarca(id);
  }

  // ==========================================
  // MODELOS
  // ==========================================
  @Get("modelos")
  async listarModelos(@Query("marcaId") marcaIdRaw?: string) {
    const marcaId = marcaIdRaw ? Number(marcaIdRaw) : undefined;
    return await this.parametricosService.listarModelos(marcaId);
  }

  @Get("modelos/:id")
  async detalleModelo(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.buscarModeloPorId(id);
  }

  @Post("modelos")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateModeloSchema))
  async crearModelo(@Body() dto: CreateModeloDto) {
    return await this.parametricosService.crearModelo(dto);
  }

  @Delete("modelos/:id")
  async eliminarModelo(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.eliminarModelo(id);
  }

  // ==========================================
  // SEGMENTOS
  // ==========================================
  @Get("segmentos")
  async listarSegmentos() {
    return await this.parametricosService.listarSegmentos();
  }

  @Get("segmentos/:id")
  async detalleSegmento(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.buscarSegmentoPorId(id);
  }

  @Post("segmentos")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateParametricoSimpleSchema))
  async crearSegmento(@Body() dto: CreateParametricoSimpleDto) {
    return await this.parametricosService.crearSegmento(dto);
  }

  @Delete("segmentos/:id")
  async eliminarSegmento(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.eliminarSegmento(id);
  }

  // ==========================================
  // CARROCERÍAS
  // ==========================================
  @Get("carrocerias")
  async listarCarrocerias() {
    return await this.parametricosService.listarCarrocerias();
  }

  @Get("carrocerias/:id")
  async detalleCarroceria(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.buscarCarroceriaPorId(id);
  }

  @Post("carrocerias")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateParametricoSimpleSchema))
  async crearCarroceria(@Body() dto: CreateParametricoSimpleDto) {
    return await this.parametricosService.crearCarroceria(dto);
  }

  @Delete("carrocerias/:id")
  async eliminarCarroceria(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.eliminarCarroceria(id);
  }

  // ==========================================
  // COMBUSTIBLES
  // ==========================================
  @Get("combustibles")
  async listarCombustibles() {
    return await this.parametricosService.listarCombustibles();
  }

  @Get("combustibles/:id")
  async detalleCombustible(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.buscarCombustiblePorId(id);
  }

  @Post("combustibles")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateParametricoSimpleSchema))
  async crearCombustible(@Body() dto: CreateParametricoSimpleDto) {
    return await this.parametricosService.crearCombustible(dto);
  }

  @Delete("combustibles/:id")
  async eliminarCombustible(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.eliminarCombustible(id);
  }

  // ==========================================
  // CAJAS (TRANSMISIÓN)
  // ==========================================
  @Get("cajas")
  async listarCajas() {
    return await this.parametricosService.listarCajas();
  }

  @Get("cajas/:id")
  async detalleCaja(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.buscarCajaPorId(id);
  }

  @Post("cajas")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateParametricoConDescripcionSchema))
  async crearCaja(@Body() dto: CreateParametricoConDescripcionDto) {
    return await this.parametricosService.crearCaja(dto);
  }

  @Delete("cajas/:id")
  async eliminarCaja(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.eliminarCaja(id);
  }

  // ==========================================
  // TRACCIONES
  // ==========================================
  @Get("tracciones")
  async listarTracciones() {
    return await this.parametricosService.listarTracciones();
  }

  @Get("tracciones/:id")
  async detalleTraccion(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.buscarTraccionPorId(id);
  }

  @Post("tracciones")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateParametricoSimpleSchema))
  async crearTraccion(@Body() dto: CreateParametricoSimpleDto) {
    return await this.parametricosService.crearTraccion(dto);
  }

  @Delete("tracciones/:id")
  async eliminarTraccion(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.eliminarTraccion(id);
  }

  // ==========================================
  // CONDICIONES (0Km, Usado)
  // ==========================================
  @Get("condiciones")
  async listarCondiciones() {
    return await this.parametricosService.listarCondiciones();
  }

  @Get("condiciones/:id")
  async detalleCondicion(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.buscarCondicionPorId(id);
  }

  @Post("condiciones")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateParametricoSimpleSchema))
  async crearCondicion(@Body() dto: CreateParametricoSimpleDto) {
    return await this.parametricosService.crearCondicion(dto);
  }

  @Delete("condiciones/:id")
  async eliminarCondicion(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.eliminarCondicion(id);
  }

  // ==========================================
  // TAPIZADOS
  // ==========================================
  @Get("tapizados")
  async listarTapizados() {
    return await this.parametricosService.listarTapizados();
  }

  @Get("tapizados/:id")
  async detalleTapizado(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.buscarTapizadoPorId(id);
  }

  @Post("tapizados")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateParametricoConDescripcionSchema))
  async crearTapizado(@Body() dto: CreateParametricoConDescripcionDto) {
    return await this.parametricosService.crearTapizado(dto);
  }

  @Delete("tapizados/:id")
  async eliminarTapizado(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.eliminarTapizado(id);
  }

  // ==========================================
  // DIRECCIONES
  // ==========================================
  @Get("direcciones")
  async listarDirecciones() {
    return await this.parametricosService.listarDirecciones();
  }

  @Get("direcciones/:id")
  async detalleDireccion(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.buscarDireccionPorId(id);
  }

  @Post("direcciones")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateParametricoConDescripcionSchema))
  async crearDireccion(@Body() dto: CreateParametricoConDescripcionDto) {
    return await this.parametricosService.crearDireccion(dto);
  }

  @Delete("direcciones/:id")
  async eliminarDireccion(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.eliminarDireccion(id);
  }

  // ==========================================
  // VERSIONES (Por Modelo)
  // ==========================================
  @Get("versiones")
  async listarVersiones(@Query("modeloId") modeloIdRaw?: string) {
    const modeloId = modeloIdRaw ? Number(modeloIdRaw) : undefined;
    return await this.parametricosService.listarVersiones(modeloId);
  }

  @Get("versiones/:id")
  async detalleVersion(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.buscarVersionPorId(id);
  }

  @Post("versiones")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateVersionSchema))
  async crearVersion(@Body() dto: CreateVersionDto) {
    return await this.parametricosService.crearVersion(dto);
  }

  @Delete("versiones/:id")
  async eliminarVersion(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.eliminarVersion(id);
  }

  // ==========================================
  // TIPOS DE MOTOR
  // ==========================================
  @Get("tipos-motor")
  async listarTiposMotor() {
    return await this.parametricosService.listarTiposMotor();
  }

  @Get("tipos-motor/:id")
  async detalleTipoMotor(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.buscarTipoMotorPorId(id);
  }

  @Post("tipos-motor")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateTipoMotorSchema))
  async crearTipoMotor(@Body() dto: CreateTipoMotorDto) {
    return await this.parametricosService.crearTipoMotor(dto);
  }

  @Delete("tipos-motor/:id")
  async eliminarTipoMotor(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.eliminarTipoMotor(id);
  }

  // ==========================================
  // MOTORES
  // ==========================================
  @Get("motores")
  async listarMotores() {
    return await this.parametricosService.listarMotores();
  }

  @Get("motores/:id")
  async detalleMotor(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.buscarMotorPorId(id);
  }

  @Post("motores")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateMotorSchema))
  async crearMotor(@Body() dto: CreateMotorDto) {
    return await this.parametricosService.crearMotor(dto);
  }

  @Delete("motores/:id")
  async eliminarMotor(@Param("id", ParseIntPipe) id: number) {
    return await this.parametricosService.eliminarMotor(id);
  }
}