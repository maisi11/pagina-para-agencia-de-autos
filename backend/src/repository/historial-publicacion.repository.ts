import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";

export type HistorialPublicacionRecord = NonNullable<Awaited<ReturnType<PrismaService["db"]["orm"]["public"]["HistorialPublicacion"]["first"]>>>;
export type HistorialPublicacionCreateInput = Parameters<PrismaService["db"]["orm"]["public"]["HistorialPublicacion"]["create"]>[0];
export type HistorialPublicacionUpdateInput = Partial<HistorialPublicacionCreateInput>;

@Injectable()
export class HistorialPublicacionRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.HistorialPublicacion;
  }

  async findAll(options?: { idPublicacion?: number; idEstado?: number }): Promise<HistorialPublicacionRecord[]> {
    let query = this.model;
    if (options?.idPublicacion !== undefined) {
      query = query.where({ idPublicacion: options.idPublicacion });
    }
    if (options?.idEstado !== undefined) {
      query = query.where({ idEstado: options.idEstado });
    }
    return await query.all();
  }

  async findByCompositeKey(idPublicacion: number, fechaHoraInicio: string): Promise<HistorialPublicacionRecord | null> {
    return await this.model
      .where({ idPublicacion, fechaHoraInicio })
      .first();
  }

  async findByPublicacion(idPublicacion: number) {
    return await this.model
      .where({ idPublicacion })
      .include("estado")
      .all();
  }

  async create(data: HistorialPublicacionCreateInput): Promise<HistorialPublicacionRecord> {
    return await this.model.create(data);
  }

  async update(idPublicacion: number, fechaHoraInicio: string, data: HistorialPublicacionUpdateInput) {
    return await this.model
      .where({ idPublicacion, fechaHoraInicio })
      .update(data);
  }

  async cerrarEstado(idPublicacion: number, fechaHoraInicio: string, fechaHoraFinalizacion: string) {
    return await this.model
      .where({ idPublicacion, fechaHoraInicio })
      .update({ fechaHoraFinalizacion });
  }

  async delete(idPublicacion: number, fechaHoraInicio: string) {
    return await this.model
      .where({ idPublicacion, fechaHoraInicio })
      .delete();
  }
}
