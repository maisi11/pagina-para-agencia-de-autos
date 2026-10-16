import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";

import {
  PublicacionRepository,
  VehiculoRepository,
  DimensionesRepository,
  EstadoRepository,
  HistorialPublicacionRepository,
} from "../../repository";
import type {CreatePublicacionDto,FilterPublicacionesDto,  CambiarEstadoDto} from "./dto/publicaciones.dto.ts"
import { th } from "zod/v4/locales";
import { number, string } from "zod";


@Injectable()
export class PublicacionesService{
    constructor(
    @Inject(PublicacionRepository) private readonly publicacionRepo: PublicacionRepository,
    @Inject(VehiculoRepository) private readonly vehiculoRepo: VehiculoRepository,
    @Inject(DimensionesRepository) private readonly dimensionesRepo: DimensionesRepository,
    @Inject(EstadoRepository) private readonly estadoRepo: EstadoRepository,
    @Inject(HistorialPublicacionRepository) private readonly historialRepo: HistorialPublicacionRepository,
) {}
  
async crearPublicacion(dto: CreatePublicacionDto){
    const { vehiculo: datosVehiculo, ...datosPublicion} = dto

    const vehiculo = await this.vehiculoRepo.findByPatente(datosVehiculo.patente)
    if (vehiculo){
      throw new ConflictException(
        `Error ya existe un vehiculo registrado con la patente "${datosVehiculo.patente}"`
      )
    }

    const dimensiones = await this.dimensionesRepo.create({
      alto: datosVehiculo.dimensiones.alto,
      ancho: datosVehiculo.dimensiones.ancho,
      largo: datosVehiculo.dimensiones.largo
    })

    const publicacion = await this.publicacionRepo.create({
      descripcion: datosPublicion.descripcion,
      idUsuario: datosPublicion.idUsuario,
      precio: datosPublicion.precio,
      titulo: datosPublicion.titulo
    
    })

    const {dimensiones: _, ...vehiculoAguardar } = datosVehiculo

    await this.vehiculoRepo.create({
      ...vehiculoAguardar,
      idPublicacion: publicacion.idPublicacion,
      idDimensiones: dimensiones.idDimensiones
    })

    let estadoDisponible = await this.estadoRepo.findByNombre("disponible")

    if (!estadoDisponible){
      await this.estadoRepo.create({nombre: "disponible"})
    }

    await this.historialRepo.create({
      idEstado: estadoDisponible?.idEstado,
      idPublicacion: publicacion.idPublicacion,
      fechaHoraInicio: new Date().toISOString()
    })

    return await this.publicacionRepo.findComplete(publicacion.idPublicacion)
}

async cambiarEstado(idPublicacion: number, nuevoEstado: string){
  const publicacion = await this.publicacionRepo.findById(idPublicacion)

  if (!publicacion){
    throw new NotFoundException(`Error no esixte la publicacion con el id: "${idPublicacion}" `)
  }

  const historial = await this.historialRepo.findByPublicacion(idPublicacion)

  const estadoActual = historial.find((h)=> !h.fechaHoraFinalizacion)


  if (estadoActual && estadoActual.estado.nombre == nuevoEstado){
    throw new BadRequestException(`Error la publicacion ya se encunetra en el estado: "${nuevoEstado}"`)
  }
  if (estadoActual && estadoActual.estado.nombre == 'finalizada'){
    throw new BadRequestException(`Error la publicacion ya se encunetra finalizada y no se puede volverse a activar`)
  }

  const fechaHoraActual = new Date().toISOString()
  if (estadoActual){
    await this.historialRepo.cerrarEstado(
      idPublicacion,
      estadoActual.fechaHoraInicio, 
      fechaHoraActual
    )
  }

  let nuevoEstadoPublicacion = await this.estadoRepo.findByNombre(nuevoEstado)

  if (!nuevoEstadoPublicacion){
    nuevoEstadoPublicacion = await this.estadoRepo.create({nombre: nuevoEstado})
  }

  await  this.historialRepo.create({
    idPublicacion,
    idEstado: nuevoEstadoPublicacion?.idEstado,
    fechaHoraInicio: fechaHoraActual
  })

  return{
    mensaje: `Publicacion actualizada al estado "${nuevoEstadoPublicacion}"`, estadoActual: nuevoEstadoPublicacion
  }

}

async buscarPorId(idPublicacion: number){
  const publicacion = await this.publicacionRepo.findComplete(idPublicacion)

  if (!publicacion){
    throw new NotFoundException (
      `No estiste la publicacion con el id "${idPublicacion}"`
    )
  }
  return publicacion
}

async listar(filtros: FilterPublicacionesDto, esVendedor: boolean = false) {
   
    const publicaciones = await this.publicacionRepo.findAllComplete();


    return publicaciones.filter((pub) => {
    
      const estadoActual = pub.historial?.find((h) => !h.fechaHoraFinalizacion)?.estado.nombre;

      // vista para los clientes. solo ven las disponibles y pausadas
      if (!esVendedor) {
  
        if (estadoActual !== "disponible" && estadoActual !== "pausada") {
          return false;
        }
      }

      // Filtros de precio
      if (filtros.precioMin && pub.precio < filtros.precioMin) return false;
      if (filtros.precioMax && pub.precio > filtros.precioMax) return false;

      // Filtros de vehículo (marca, modelo, etc.)
      if (filtros.modeloId && pub.vehiculo?.idModelo !== filtros.modeloId) return false;

      return true;
    });
}

async eleminar(idPublicacion: number){
  const publicacion = await this.publicacionRepo.findById(idPublicacion)
  if (!publicacion){
    throw new NotFoundException (
      `No estsite la publicacion con el id "${idPublicacion}"`
    )
  }
  return await this.publicacionRepo.delete(idPublicacion)

}

};

