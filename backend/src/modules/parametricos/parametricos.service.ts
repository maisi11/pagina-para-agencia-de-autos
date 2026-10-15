import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { MarcaRepository } from "../../repository/marca.repository.ts";
import { ModeloRepository } from "../../repository/modelo.repository.ts";
import { VersionRepository } from "../../repository/version.repository.ts";
import { SegmentoRepository } from "../../repository/segmento.repository.ts";
import { TipoCarroceriaRepository } from "../../repository/tipo-carroceria.repository.ts";
import { CombustibleRepository } from "../../repository/combustible.repository.ts";
import { CajaRepository } from "../../repository/caja.repository.ts";
import { TraccionRepository } from "../../repository/traccion.repository.ts";
import { CondicionRepository } from "../../repository/condicion.repository.ts";
import { TipoTapizadoRepository } from "../../repository/tipo-tapizado.repository.ts";
import { TipoDireccionRepository } from "../../repository/tipo-direccion.repository.ts";
import { TipoMotorRepository } from "../../repository/tipo-motor.repository.ts";
import { MotorRepository } from "../../repository/motor.repository.ts";
import { DimensionesRepository } from "../../repository/dimensiones.repository.ts";

import type {
  CreateParametricoSimpleDto,
  CreateParametricoConDescripcionDto,
  CreateMarcaDto,
  CreateModeloDto,
  CreateVersionDto,
  CreateTipoMotorDto,
  CreateMotorDto,
  CreateDimensionesDto,
} from "./dto/parametricos.dto.ts";

@Injectable()
export class ParametricosService {
  constructor(
    @Inject(MarcaRepository) private readonly marcaRepo: MarcaRepository,
    @Inject(ModeloRepository) private readonly modeloRepo: ModeloRepository,
    @Inject(VersionRepository) private readonly versionRepo: VersionRepository,
    @Inject(SegmentoRepository) private readonly segmentoRepo: SegmentoRepository,
    @Inject(TipoCarroceriaRepository) private readonly carroceriaRepo: TipoCarroceriaRepository,
    @Inject(CombustibleRepository) private readonly combustibleRepo: CombustibleRepository,
    @Inject(CajaRepository) private readonly cajaRepo: CajaRepository,
    @Inject(TraccionRepository) private readonly traccionRepo: TraccionRepository,
    @Inject(CondicionRepository) private readonly condicionRepo: CondicionRepository,
    @Inject(TipoTapizadoRepository) private readonly tapizadoRepo: TipoTapizadoRepository,
    @Inject(TipoDireccionRepository) private readonly direccionRepo: TipoDireccionRepository,
    @Inject(TipoMotorRepository) private readonly tipoMotorRepo: TipoMotorRepository,
    @Inject(MotorRepository) private readonly motorRepo: MotorRepository,
    @Inject(DimensionesRepository) private readonly dimensionesRepo: DimensionesRepository,
  ) {}

  // ==========================================
  // ENDPOINT MAESTRO: TODOS LOS CATÁLOGOS
  // ==========================================
  async obtenerTodosLosCatalogos() {
    const [
      marcas,
      modelos,
      segmentos,
      carrocerias,
      combustibles,
      cajas,
      tracciones,
      condiciones,
      tapizados,
      direcciones,
      tiposMotor,
    ] = await Promise.all([
      this.marcaRepo.findAll(),
      this.modeloRepo.findAll(),
      this.segmentoRepo.findAll(),
      this.carroceriaRepo.findAll(),
      this.combustibleRepo.findAll(),
      this.cajaRepo.findAll(),
      this.traccionRepo.findAll(),
      this.condicionRepo.findAll(),
      this.tapizadoRepo.findAll(),
      this.direccionRepo.findAll(),
      this.tipoMotorRepo.findAll(),
    ]);

    return {
      marcas,
      modelos,
      segmentos,
      carrocerias,
      combustibles,
      cajas,
      tracciones,
      condiciones,
      tapizados,
      direcciones,
      tiposMotor,
    };
  }

  // ==========================================
  // MARCAS
  // ==========================================
  async listarMarcas() {
    return await this.marcaRepo.findAll();
  }

  async buscarMarcaPorId(id: number) {
    const marca = await this.marcaRepo.findById(id);
    if (!marca) throw new NotFoundException(`Marca con ID ${id} no encontrada`);
    return marca;
  }

  async buscarMarcaConModelos(id: number) {
    const marca = await this.marcaRepo.findWithModelos(id);
    if (!marca) throw new NotFoundException(`Marca con ID ${id} no encontrada`);
    return marca;
  }

  async crearMarca(dto: CreateMarcaDto) {
    const existe = await this.marcaRepo.findByNombre(dto.nombreMarca);
    if (existe) throw new ConflictException(`La marca "${dto.nombreMarca}" ya existe`);
    return await this.marcaRepo.create({ nombreMarca: dto.nombreMarca });
  }

  async eliminarMarca(id: number) {
    await this.buscarMarcaPorId(id);
    return await this.marcaRepo.delete(id);
  }

  // ==========================================
  // MODELOS
  // ==========================================
  async listarModelos(idMarca?: number) {
    if (idMarca !== undefined) {
      await this.buscarMarcaPorId(idMarca);
      return await this.modeloRepo.findByMarca(idMarca);
    }
    return await this.modeloRepo.findAll();
  }

  async buscarModeloPorId(id: number) {
    const modelo = await this.modeloRepo.findComplete(id);
    if (!modelo) throw new NotFoundException(`Modelo con ID ${id} no encontrado`);
    return modelo;
  }

  async crearModelo(dto: CreateModeloDto) {
    await this.buscarMarcaPorId(dto.idMarca);
    return await this.modeloRepo.create({
      nombreModelo: dto.nombreModelo,
      idMarca: dto.idMarca,
    });
  }

  async eliminarModelo(id: number) {
    const existe = await this.modeloRepo.findById(id);
    if (!existe) throw new NotFoundException(`Modelo con ID ${id} no encontrado`);
    return await this.modeloRepo.delete(id);
  }

  // ==========================================
  // SEGMENTOS
  // ==========================================
  async listarSegmentos() {
    return await this.segmentoRepo.findAll();
  }

  async buscarSegmentoPorId(id: number) {
    const segmento = await this.segmentoRepo.findById(id);
    if (!segmento) throw new NotFoundException(`Segmento con ID ${id} no encontrado`);
    return segmento;
  }

  async crearSegmento(dto: CreateParametricoSimpleDto) {
    const existe = await this.segmentoRepo.findByNombre(dto.nombre);
    if (existe) throw new ConflictException(`El segmento "${dto.nombre}" ya existe`);
    return await this.segmentoRepo.create({ nombreSegmento: dto.nombre });
  }

  async eliminarSegmento(id: number) {
    await this.buscarSegmentoPorId(id);
    return await this.segmentoRepo.delete(id);
  }

  // ==========================================
  // CARROCERÍAS
  // ==========================================
  async listarCarrocerias() {
    return await this.carroceriaRepo.findAll();
  }

  async buscarCarroceriaPorId(id: number) {
    const carroceria = await this.carroceriaRepo.findById(id);
    if (!carroceria) throw new NotFoundException(`Carrocería con ID ${id} no encontrada`);
    return carroceria;
  }

  async crearCarroceria(dto: CreateParametricoSimpleDto) {
    const existe = await this.carroceriaRepo.findByNombre(dto.nombre);
    if (existe) throw new ConflictException(`La carrocería "${dto.nombre}" ya existe`);
    return await this.carroceriaRepo.create({ nombreTipoCarroceria: dto.nombre });
  }

  async eliminarCarroceria(id: number) {
    await this.buscarCarroceriaPorId(id);
    return await this.carroceriaRepo.delete(id);
  }

  // ==========================================
  // COMBUSTIBLES
  // ==========================================
  async listarCombustibles() {
    return await this.combustibleRepo.findAll();
  }

  async buscarCombustiblePorId(id: number) {
    const combustible = await this.combustibleRepo.findById(id);
    if (!combustible) throw new NotFoundException(`Combustible con ID ${id} no encontrado`);
    return combustible;
  }

  async crearCombustible(dto: CreateParametricoSimpleDto) {
    const existe = await this.combustibleRepo.findByNombre(dto.nombre);
    if (existe) throw new ConflictException(`El combustible "${dto.nombre}" ya existe`);
    return await this.combustibleRepo.create({ nombreCombustible: dto.nombre });
  }

  async eliminarCombustible(id: number) {
    await this.buscarCombustiblePorId(id);
    return await this.combustibleRepo.delete(id);
  }

  // ==========================================
  // CAJAS (TRANSMISIÓN)
  // ==========================================
  async listarCajas() {
    return await this.cajaRepo.findAll();
  }

  async buscarCajaPorId(id: number) {
    const caja = await this.cajaRepo.findById(id);
    if (!caja) throw new NotFoundException(`Caja con ID ${id} no encontrada`);
    return caja;
  }

  async crearCaja(dto: CreateParametricoConDescripcionDto) {
    const existe = await this.cajaRepo.findByNombre(dto.nombre);
    if (existe) throw new ConflictException(`La caja "${dto.nombre}" ya existe`);
    return await this.cajaRepo.create({
      nombreCaja: dto.nombre,
      descripcion: dto.descripcion,
    });
  }

  async eliminarCaja(id: number) {
    await this.buscarCajaPorId(id);
    return await this.cajaRepo.delete(id);
  }

  // ==========================================
  // TRACCIONES
  // ==========================================
  async listarTracciones() {
    return await this.traccionRepo.findAll();
  }

  async buscarTraccionPorId(id: number) {
    const traccion = await this.traccionRepo.findById(id);
    if (!traccion) throw new NotFoundException(`Tracción con ID ${id} no encontrada`);
    return traccion;
  }

  async crearTraccion(dto: CreateParametricoSimpleDto) {
    const existe = await this.traccionRepo.findByNombre(dto.nombre);
    if (existe) throw new ConflictException(`La tracción "${dto.nombre}" ya existe`);
    return await this.traccionRepo.create({ nombreTraccion: dto.nombre });
  }

  async eliminarTraccion(id: number) {
    await this.buscarTraccionPorId(id);
    return await this.traccionRepo.delete(id);
  }

  // ==========================================
  // CONDICIONES (0Km, Usado)
  // ==========================================
  async listarCondiciones() {
    return await this.condicionRepo.findAll();
  }

  async buscarCondicionPorId(id: number) {
    const condicion = await this.condicionRepo.findById(id);
    if (!condicion) throw new NotFoundException(`Condición con ID ${id} no encontrada`);
    return condicion;
  }

  async crearCondicion(dto: CreateParametricoSimpleDto) {
    const existe = await this.condicionRepo.findByNombre(dto.nombre);
    if (existe) throw new ConflictException(`La condición "${dto.nombre}" ya existe`);
    return await this.condicionRepo.create({ nombreCondicion: dto.nombre });
  }

  async eliminarCondicion(id: number) {
    await this.buscarCondicionPorId(id);
    return await this.condicionRepo.delete(id);
  }

  // ==========================================
  // TAPIZADOS
  // ==========================================
  async listarTapizados() {
    return await this.tapizadoRepo.findAll();
  }

  async buscarTapizadoPorId(id: number) {
    const tapizado = await this.tapizadoRepo.findById(id);
    if (!tapizado) throw new NotFoundException(`Tipo de tapizado con ID ${id} no encontrado`);
    return tapizado;
  }

  async crearTapizado(dto: CreateParametricoConDescripcionDto) {
    const existe = await this.tapizadoRepo.findByNombre(dto.nombre);
    if (existe) throw new ConflictException(`El tapizado "${dto.nombre}" ya existe`);
    return await this.tapizadoRepo.create({
      nombreTipoTapizado: dto.nombre,
      descripcion: dto.descripcion,
    });
  }

  async eliminarTapizado(id: number) {
    await this.buscarTapizadoPorId(id);
    return await this.tapizadoRepo.delete(id);
  }

  // ==========================================
  // DIRECCIONES
  // ==========================================
  async listarDirecciones() {
    return await this.direccionRepo.findAll();
  }

  async buscarDireccionPorId(id: number) {
    const direccion = await this.direccionRepo.findById(id);
    if (!direccion) throw new NotFoundException(`Tipo de dirección con ID ${id} no encontrado`);
    return direccion;
  }

  async crearDireccion(dto: CreateParametricoConDescripcionDto) {
    const existe = await this.direccionRepo.findByNombre(dto.nombre);
    if (existe) throw new ConflictException(`La dirección "${dto.nombre}" ya existe`);
    return await this.direccionRepo.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
    });
  }

  async eliminarDireccion(id: number) {
    await this.buscarDireccionPorId(id);
    return await this.direccionRepo.delete(id);
  }

  // ==========================================
  // VERSIONES (Por Modelo)
  // ==========================================
  async listarVersiones(idModelo?: number) {
    if (idModelo !== undefined) {
      const modelo = await this.modeloRepo.findById(idModelo);
      if (!modelo) throw new NotFoundException(`El modelo con ID ${idModelo} no existe`);
      return await this.versionRepo.findByModelo(idModelo);
    }
    return await this.versionRepo.findAll();
  }

  async buscarVersionPorId(id: number) {
    const version = await this.versionRepo.findWithModelo(id);
    if (!version) throw new NotFoundException(`Versión con ID ${id} no encontrada`);
    return version;
  }

  async crearVersion(dto: CreateVersionDto) {
    const modelo = await this.modeloRepo.findById(dto.idModelo);
    if (!modelo) throw new NotFoundException(`El modelo con ID ${dto.idModelo} no existe`);
    return await this.versionRepo.create({
      nombreVersion: dto.nombreVersion,
      idModelo: dto.idModelo,
      descripcion: dto.descripcion,
    });
  }

  async eliminarVersion(id: number) {
    const existe = await this.versionRepo.findById(id);
    if (!existe) throw new NotFoundException(`Versión con ID ${id} no encontrada`);
    return await this.versionRepo.delete(id);
  }

  // ==========================================
  // TIPOS DE MOTOR
  // ==========================================
  async listarTiposMotor() {
    return await this.tipoMotorRepo.findAll();
  }

  async buscarTipoMotorPorId(id: number) {
    const tipo = await this.tipoMotorRepo.findById(id);
    if (!tipo) throw new NotFoundException(`Tipo de motor con ID ${id} no encontrado`);
    return tipo;
  }

  async crearTipoMotor(dto: CreateTipoMotorDto) {
    const existe = await this.tipoMotorRepo.findByNombre(dto.nombreTipo);
    if (existe) throw new ConflictException(`El tipo de motor "${dto.nombreTipo}" ya existe`);
    return await this.tipoMotorRepo.create({ nombreTipo: dto.nombreTipo });
  }

  async eliminarTipoMotor(id: number) {
    await this.buscarTipoMotorPorId(id);
    return await this.tipoMotorRepo.delete(id);
  }

  // ==========================================
  // MOTORES
  // ==========================================
  async listarMotores() {
    return await this.motorRepo.findAll();
  }

  async buscarMotorPorId(id: number) {
    const motor = await this.motorRepo.findById(id);
    if (!motor) throw new NotFoundException(`Motor con ID ${id} no encontrado`);
    return motor;
  }

  async crearMotor(dto: CreateMotorDto) {
    const tipo = await this.tipoMotorRepo.findById(dto.idTipoMotor);
    if (!tipo) throw new NotFoundException(`El tipo de motor con ID ${dto.idTipoMotor} no existe`);
    return await this.motorRepo.create({
      idTipoMotor: dto.idTipoMotor,
      descripcion: dto.descripcion,
      potencia: dto.potencia,
      torque: dto.torque,
    });
  }

  async eliminarMotor(id: number) {
    await this.buscarMotorPorId(id);
    return await this.motorRepo.delete(id);
  }

  // ==========================================
  // DIMENSIONES
  // ==========================================
  async crearDimensiones(dto: CreateDimensionesDto) {
    return await this.dimensionesRepo.create({
      largo: dto.largo,
      alto: dto.alto,
      ancho: dto.ancho,
    });
  }
}