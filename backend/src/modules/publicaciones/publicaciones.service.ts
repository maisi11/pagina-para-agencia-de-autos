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
  MultimediaRepository,
  MotorRepository,
  VersionRepository,
} from "../../repository";
import type {
  CreatePublicacionDto,
  UpdatePublicacionDto,
  FilterPublicacionesDto,
  CambiarEstadoDto,
} from "./dto/publicaciones.dto.ts";
import { th } from "zod/v4/locales";
import { number, string } from "zod";

function isYouTubeUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  return /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(url.trim());
}

function resolverVersion(pub: any) {
  if (!pub?.vehiculo) return null;
  const veh = pub.vehiculo;
  if (veh.version?.nombreVersion) return veh.version;

  const versiones = (veh.modelo as any)?.versiones || [];
  const titulo = (pub.titulo || '').toLowerCase();

  if (versiones.length > 0) {
    // Buscar coincidencia en el título
    const match = versiones.find((v: any) => {
      const vNom = (v.nombreVersion || '').toLowerCase();
      if (!vNom) return false;
      if (titulo.includes(vNom)) return true;
      const tokens = vNom.split(/\s+/).filter((t: string) => t.length > 2);
      return tokens.some((token: string) => titulo.includes(token));
    });

    if (match) {
      return { idVersion: match.idVersion, nombreVersion: match.nombreVersion };
    }

    if (versiones.length === 1) {
      return { idVersion: versiones[0].idVersion, nombreVersion: versiones[0].nombreVersion };
    }

    return {
      idVersion: versiones[versiones.length - 1].idVersion,
      nombreVersion: versiones[versiones.length - 1].nombreVersion,
    };
  }

  // Extraer del título de la publicación
  const marcaNom = (veh.modelo?.marca?.nombreMarca || '').toLowerCase();
  const modeloNom = (veh.modelo?.nombreModelo || '').toLowerCase();
  const anio = veh.anio ? String(veh.anio) : '';

  let versionExtraida = pub.titulo || '';
  if (marcaNom) versionExtraida = versionExtraida.replace(new RegExp(`\\b${marcaNom}\\b`, 'gi'), '');
  if (modeloNom) versionExtraida = versionExtraida.replace(new RegExp(`\\b${modeloNom}\\b`, 'gi'), '');
  if (anio) versionExtraida = versionExtraida.replace(new RegExp(`\\b${anio}\\b`, 'gi'), '');
  versionExtraida = versionExtraida.trim().replace(/^[-–—:]+/, '').trim();

  if (versionExtraida) {
    return { idVersion: 0, nombreVersion: versionExtraida };
  }

  return null;
}

@Injectable()
export class PublicacionesService {
  constructor(
    @Inject(PublicacionRepository) private readonly publicacionRepo: PublicacionRepository,
    @Inject(VehiculoRepository) private readonly vehiculoRepo: VehiculoRepository,
    @Inject(DimensionesRepository) private readonly dimensionesRepo: DimensionesRepository,
    @Inject(EstadoRepository) private readonly estadoRepo: EstadoRepository,
    @Inject(HistorialPublicacionRepository) private readonly historialRepo: HistorialPublicacionRepository,
    @Inject(MultimediaRepository) private readonly multimediaRepo: MultimediaRepository,
    @Inject(MotorRepository) private readonly motorRepo: MotorRepository,
    @Inject(VersionRepository) private readonly versionRepo: VersionRepository,
  ) {}
  
  async crearPublicacion(dto: CreatePublicacionDto) {
    const { vehiculo: datosVehiculo, ...datosPublicion } = dto;

    const vehiculo = await this.vehiculoRepo.findByPatente(datosVehiculo.patente);
    if (vehiculo) {
      throw new ConflictException(
        `Error ya existe un vehiculo registrado con la patente "${datosVehiculo.patente}"`
      );
    }

    const dimensiones = await this.dimensionesRepo.create({
      alto: datosVehiculo.dimensiones.alto,
      ancho: datosVehiculo.dimensiones.ancho,
      largo: datosVehiculo.dimensiones.largo,
    });

    let idMotor = datosVehiculo.idMotor;
    if (datosVehiculo.motor) {
      const nuevoMotor = await this.motorRepo.create({
        idTipoMotor: datosVehiculo.motor.idTipoMotor,
        descripcion: datosVehiculo.motor.descripcion,
        potencia: datosVehiculo.motor.potencia,
        torque: datosVehiculo.motor.torque,
      });
      idMotor = nuevoMotor.idMotor;
    } else if (!idMotor) {
      const motores = await this.motorRepo.findAll();
      idMotor = motores[0]?.idMotor ?? 1;
    }

    const publicacion = await this.publicacionRepo.create({
      descripcion: datosPublicion.descripcion,
      idUsuario: datosPublicion.idUsuario,
      precio: datosPublicion.precio,
      titulo: datosPublicion.titulo,
    });

    // Guardar fotos de galería en Multimedia
    if (Array.isArray(datosPublicion.multimedia) && datosPublicion.multimedia.length > 0) {
      for (const imgUrl of datosPublicion.multimedia) {
        if (imgUrl && typeof imgUrl === "string" && imgUrl.trim().length > 0) {
          await this.multimediaRepo.create({
            idPublicacion: publicacion.idPublicacion,
            urlArchMultimedia: imgUrl.trim(),
          });
        }
      }
    }

    // Guardar link de video walk-around de YouTube en Multimedia
    if (datosPublicion.videoUrl && typeof datosPublicion.videoUrl === "string" && datosPublicion.videoUrl.trim().length > 0) {
      await this.multimediaRepo.create({
        idPublicacion: publicacion.idPublicacion,
        urlArchMultimedia: datosPublicion.videoUrl.trim(),
      });
    }

    // Guardar versión en la tabla Version si fue indicada
    if (datosVehiculo.version && datosVehiculo.version.trim()) {
      const versionStr = datosVehiculo.version.trim();
      const versionesExistentes = await this.versionRepo.findByModelo(datosVehiculo.idModelo);
      const existe = versionesExistentes.some(
        (v) => v.nombreVersion.toLowerCase() === versionStr.toLowerCase()
      );
      if (!existe) {
        await this.versionRepo.create({
          idModelo: datosVehiculo.idModelo,
          nombreVersion: versionStr,
        });
      }
    }

    const { dimensiones: _, idMarca: __, motor: ___, version: ____, ...vehiculoAguardar } = datosVehiculo;

    await this.vehiculoRepo.create({
      ...vehiculoAguardar,
      idMotor: idMotor!,
      idPublicacion: publicacion.idPublicacion,
      idDimensiones: dimensiones.idDimensiones,
    });

    let estadoDisponible = await this.estadoRepo.findByNombre("disponible")

    if (!estadoDisponible){
      await this.estadoRepo.create({nombre: "disponible"})
    }

    await this.historialRepo.create({
      idEstado: estadoDisponible?.idEstado,
      idPublicacion: publicacion.idPublicacion,
      fechaHoraInicio: new Date().toISOString()
    })

    const completa = await this.publicacionRepo.findComplete(publicacion.idPublicacion);
    const videoMedia = completa?.multimedia?.find((m) => isYouTubeUrl(m.urlArchMultimedia));
    const estadoActual = completa?.historial?.find((h) => !h.fechaHoraFinalizacion)?.estado?.nombre || 'disponible';
    return {
      ...completa,
      estadoActual,
      estado: estadoActual,
      videoUrl: videoMedia ? videoMedia.urlArchMultimedia : null,
    };
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

  return {
    mensaje: `Publicación actualizada al estado "${nuevoEstadoPublicacion?.nombre || nuevoEstado}"`,
    estadoActual: nuevoEstadoPublicacion?.nombre || nuevoEstado,
    estado: nuevoEstadoPublicacion?.nombre || nuevoEstado,
  }

}

async buscarPorId(idPublicacion: number){
  const publicacion = await this.publicacionRepo.findComplete(idPublicacion)

  if (!publicacion){
    throw new NotFoundException (
      `No estiste la publicacion con el id "${idPublicacion}"`
    )
  }
  const videoMedia = publicacion.multimedia?.find((m) => isYouTubeUrl(m.urlArchMultimedia));
  const estadoActual = publicacion.historial?.find((h) => !h.fechaHoraFinalizacion)?.estado?.nombre || 'disponible';
  const versionResuelta = resolverVersion(publicacion);
  const vehiculo = publicacion.vehiculo
    ? { ...publicacion.vehiculo, version: (publicacion.vehiculo as any).version || versionResuelta }
    : null;

  return {
    ...publicacion,
    vehiculo,
    estadoActual,
    estado: estadoActual,
    videoUrl: videoMedia ? videoMedia.urlArchMultimedia : null,
  };
}

async listar(filtros: FilterPublicacionesDto, esVendedor: boolean = false) {
   
    const publicaciones = await this.publicacionRepo.findAllComplete();


    const filtradas = publicaciones.filter((pub) => {
    
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

    return filtradas.map((pub) => {
      const videoMedia = pub.multimedia?.find((m) => isYouTubeUrl(m.urlArchMultimedia));
      const estadoActual = pub.historial?.find((h) => !h.fechaHoraFinalizacion)?.estado?.nombre || 'disponible';
      const versionResuelta = resolverVersion(pub);
      const vehiculo = pub.vehiculo
        ? { ...pub.vehiculo, version: (pub.vehiculo as any).version || versionResuelta }
        : null;

      return {
        ...pub,
        vehiculo,
        estadoActual,
        estado: estadoActual,
        videoUrl: videoMedia ? videoMedia.urlArchMultimedia : null,
      };
    });
}

async actualizarPublicacion(idPublicacion: number, dto: UpdatePublicacionDto) {
  const publicacionExistente = await this.publicacionRepo.findWithVehiculo(idPublicacion);
  if (!publicacionExistente) {
    throw new NotFoundException(`No existe la publicación con el id "${idPublicacion}"`);
  }

  const { vehiculo: datosVehiculo, multimedia, videoUrl, estado, ...datosPublicacion } = dto;

  // 1. Actualizar Publicación (título, descripción, precio, etc.)
  if (Object.keys(datosPublicacion).length > 0) {
    await this.publicacionRepo.update(idPublicacion, datosPublicacion);
  }

  // 2. Actualizar Vehículo y sus relaciones (Dimensiones, Motor)
  if (datosVehiculo) {
    const vehiculoExistente = publicacionExistente.vehiculo 
      || await this.vehiculoRepo.findByPublicacionId(idPublicacion);

    if (vehiculoExistente) {
      // Actualizar Dimensiones si se enviaron
      if (datosVehiculo.dimensiones && vehiculoExistente.idDimensiones) {
        await this.dimensionesRepo.update(vehiculoExistente.idDimensiones, {
          ...(datosVehiculo.dimensiones.alto !== undefined ? { alto: datosVehiculo.dimensiones.alto } : {}),
          ...(datosVehiculo.dimensiones.ancho !== undefined ? { ancho: datosVehiculo.dimensiones.ancho } : {}),
          ...(datosVehiculo.dimensiones.largo !== undefined ? { largo: datosVehiculo.dimensiones.largo } : {}),
        });
      }

      // Actualizar o crear Motor
      let idMotor = datosVehiculo.idMotor;
      if (datosVehiculo.motor) {
        if (vehiculoExistente.idMotor) {
          await this.motorRepo.update(vehiculoExistente.idMotor, {
            ...(datosVehiculo.motor.idTipoMotor !== undefined ? { idTipoMotor: datosVehiculo.motor.idTipoMotor } : {}),
            ...(datosVehiculo.motor.descripcion !== undefined ? { descripcion: datosVehiculo.motor.descripcion } : {}),
            ...(datosVehiculo.motor.potencia !== undefined ? { potencia: datosVehiculo.motor.potencia } : {}),
            ...(datosVehiculo.motor.torque !== undefined ? { torque: datosVehiculo.motor.torque } : {}),
          });
        } else if (datosVehiculo.motor.idTipoMotor) {
          const nuevoMotor = await this.motorRepo.create({
            idTipoMotor: datosVehiculo.motor.idTipoMotor,
            descripcion: datosVehiculo.motor.descripcion,
            potencia: datosVehiculo.motor.potencia,
            torque: datosVehiculo.motor.torque,
          });
          idMotor = nuevoMotor.idMotor;
        }
      }

      // Actualizar datos del Vehículo
      // Guardar versión en la tabla Version si fue indicada
      if (datosVehiculo.version && datosVehiculo.version.trim()) {
        const versionStr = datosVehiculo.version.trim();
        const idModelo = datosVehiculo.idModelo || vehiculoExistente.idModelo;
        const versionesExistentes = await this.versionRepo.findByModelo(idModelo);
        const existe = versionesExistentes.some(
          (v) => v.nombreVersion.toLowerCase() === versionStr.toLowerCase()
        );
        if (!existe) {
          await this.versionRepo.create({
            idModelo,
            nombreVersion: versionStr,
          });
        }
      }

    const { dimensiones: _, idMarca: __, motor: ___, version: ____, ...vehiculoAguardar } = datosVehiculo;
      const datosVehiculoUpdate: any = { ...vehiculoAguardar };
      if (idMotor !== undefined) {
        datosVehiculoUpdate.idMotor = idMotor;
      }

      if (Object.keys(datosVehiculoUpdate).length > 0) {
        await this.vehiculoRepo.update(vehiculoExistente.patente, datosVehiculoUpdate);
      }
    }
  }

  // 3. Actualizar Multimedia si fue provista (Deduplicando y limpiando correctamente)
  if (multimedia !== undefined || videoUrl !== undefined) {
    await this.multimediaRepo.deleteByPublicacion(idPublicacion);

    if (Array.isArray(multimedia) && multimedia.length > 0) {
      const urlsUnicas = [...new Set(multimedia.map((u) => (typeof u === 'string' ? u.trim() : '')).filter(Boolean))];
      for (const imgUrl of urlsUnicas) {
        if (!isYouTubeUrl(imgUrl)) {
          await this.multimediaRepo.create({
            idPublicacion,
            urlArchMultimedia: imgUrl,
          });
        }
      }
    }

    const finalVideoUrl = videoUrl?.trim();
    if (finalVideoUrl && finalVideoUrl.length > 0) {
      await this.multimediaRepo.create({
        idPublicacion,
        urlArchMultimedia: finalVideoUrl,
      });
    }
  }

  // 4. Actualizar Estado si fue provisto
  if (estado) {
    try {
      await this.cambiarEstado(idPublicacion, estado);
    } catch {
      // Ignorar si ya se encuentra en ese estado
    }
  }

  return await this.buscarPorId(idPublicacion);
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

