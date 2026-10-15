import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";

import {
  PublicacionRepository,
  VehiculoRepository,
  DimensionesRepository,
  EstadoRepository,
  HistorialPublicacionRepository,
} from "../../repository";
import type {CreatePublicacionDto,FilterPublicacionesDto,  CambiarEstadoDto} from "./dto/publicaciones.dto.ts"

@Injectable()
export class PublicacionesService{
    constructor(
    @Inject(PublicacionRepository) private readonly publicacionRepo: PublicacionRepository,
    @Inject(VehiculoRepository) private readonly vehiculoRepo: VehiculoRepository,
    @Inject(DimensionesRepository) private readonly dimensionesRepo: DimensionesRepository,
    @Inject(EstadoRepository) private readonly estadoRepo: EstadoRepository,
    @Inject(HistorialPublicacionRepository) private readonly historialRepo: HistorialPublicacionRepository,
) {}
}