import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";
import { UsuarioRepository } from "./usuario.repository.ts";
import { PublicacionRepository } from "./publicacion.repository.ts";
import { VehiculoRepository } from "./vehiculo.repository.ts";
import { MultimediaRepository } from "./multimedia.repository.ts";
import { MetricasPublicacionRepository } from "./metricas-publicacion.repository.ts";
import { TipoEventoRepository } from "./tipo-evento.repository.ts";
import { HistorialPublicacionRepository } from "./historial-publicacion.repository.ts";
import { EstadoRepository } from "./estado.repository.ts";
import { MarcaRepository } from "./marca.repository.ts";
import { ModeloRepository } from "./modelo.repository.ts";
import { VersionRepository } from "./version.repository.ts";
import { MotorRepository } from "./motor.repository.ts";
import { TipoMotorRepository } from "./tipo-motor.repository.ts";
import { DimensionesRepository } from "./dimensiones.repository.ts";
import { CondicionRepository } from "./condicion.repository.ts";
import { CajaRepository } from "./caja.repository.ts";
import { TraccionRepository } from "./traccion.repository.ts";
import { SegmentoRepository } from "./segmento.repository.ts";
import { TipoCarroceriaRepository } from "./tipo-carroceria.repository.ts";
import { TipoTapizadoRepository } from "./tipo-tapizado.repository.ts";
import { TipoDireccionRepository } from "./tipo-direccion.repository.ts";
import { CombustibleRepository } from "./combustible.repository.ts";

const repositories = [
  UsuarioRepository,
  PublicacionRepository,
  VehiculoRepository,
  MultimediaRepository,
  MetricasPublicacionRepository,
  TipoEventoRepository,
  HistorialPublicacionRepository,
  EstadoRepository,
  MarcaRepository,
  ModeloRepository,
  VersionRepository,
  MotorRepository,
  TipoMotorRepository,
  DimensionesRepository,
  CondicionRepository,
  CajaRepository,
  TraccionRepository,
  SegmentoRepository,
  TipoCarroceriaRepository,
  TipoTapizadoRepository,
  TipoDireccionRepository,
  CombustibleRepository,
];

@Module({
  providers: [PrismaService, ...repositories],
  exports: [...repositories],
})
export class RepositoriesModule {}
