import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";

export type PublicacionRecord = NonNullable<Awaited<ReturnType<PrismaService["db"]["orm"]["public"]["Publicacion"]["first"]>>>;
export type PublicacionCreateInput = Parameters<PrismaService["db"]["orm"]["public"]["Publicacion"]["create"]>[0];
export type PublicacionUpdateInput = Partial<PublicacionCreateInput>;

@Injectable()
export class PublicacionRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.Publicacion;
  }

  async findAll(options?: { idUsuario?: number; limit?: number; offset?: number }): Promise<PublicacionRecord[]> {
    let query = this.model;
    if (options?.idUsuario !== undefined) {
      query = query.where({ idUsuario: options.idUsuario });
    }
    if (options?.offset !== undefined) {
      query = query.offset(options.offset);
    }
    if (options?.limit !== undefined) {
      query = query.limit(options.limit);
    }
    return await query.all();
  }

  async findById(idPublicacion: number): Promise<PublicacionRecord | null> {
    return await this.model.where({ idPublicacion }).first();
  }

  async findByUsuario(idUsuario: number): Promise<PublicacionRecord[]> {
    return await this.model.where({ idUsuario }).all();
  }

  async findWithVehiculo(idPublicacion: number) {
    return await this.model
      .where({ idPublicacion })
      .include("vehiculo")
      .first();
  }

  async findWithMultimedia(idPublicacion: number) {
    return await this.model
      .where({ idPublicacion })
      .include("multimedia")
      .first();
  }

  async findWithHistorial(idPublicacion: number) {
    return await this.model
      .where({ idPublicacion })
      .include("historial", (h) => h.include("estado"))
      .first();
  }

  async findComplete(idPublicacion: number) {
    return await this.model
      .where({ idPublicacion })
      .include("usuario")
      .include("vehiculo", (v) =>
        v
          .include("modelo", (m) => m.include("marca"))
          .include("condicion")
          .include("caja")
          .include("combustible")
          .include("traccion")
      )
      .include("multimedia")
      .include("historial", (h) => h.include("estado"))
      .first();
  }

  async create(data: PublicacionCreateInput): Promise<PublicacionRecord> {
    return await this.model.create(data);
  }

  async update(idPublicacion: number, data: PublicacionUpdateInput) {
    return await this.model.where({ idPublicacion }).update(data);
  }

  async delete(idPublicacion: number) {
    return await this.model.where({ idPublicacion }).delete();
  }

   async findAllComplete(options?: { idUsuario?: number; limit?: number; offset?: number }) {
    let query = this.model
      .include("usuario")
      .include("vehiculo", (v) =>
        v
          .include("modelo", (m) => m.include("marca"))
          .include("condicion")
          .include("caja")
          .include("combustible")
          .include("traccion")
          .include("segmento")
      )
      .include("multimedia")
      .include("historial", (h) => h.include("estado"));
    if (options?.idUsuario !== undefined) {
      query = query.where({ idUsuario: options.idUsuario });
    }
    if (options?.offset !== undefined) {
      query = query.offset(options.offset);
    }
    if (options?.limit !== undefined) {
      query = query.limit(options.limit);
    }
    return await query.all();
  }
}
