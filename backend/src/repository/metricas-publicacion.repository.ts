import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";

export type MetricasPublicacionRecord = NonNullable<Awaited<ReturnType<PrismaService["db"]["orm"]["public"]["MetricasPublicacion"]["first"]>>>;
export type MetricasPublicacionCreateInput = Parameters<PrismaService["db"]["orm"]["public"]["MetricasPublicacion"]["create"]>[0];
export type MetricasPublicacionUpdateInput = Partial<MetricasPublicacionCreateInput>;

@Injectable()
export class MetricasPublicacionRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.MetricasPublicacion;
  }

  async findAll(options?: { idPublicacion?: number; idTipoEvento?: number; limit?: number; offset?: number }): Promise<MetricasPublicacionRecord[]> {
    let query = this.model;
    if (options?.idPublicacion !== undefined) {
      query = query.where({ idPublicacion: options.idPublicacion });
    }
    if (options?.idTipoEvento !== undefined) {
      query = query.where({ idTipoEvento: options.idTipoEvento });
    }
    if (options?.offset !== undefined) {
      query = query.offset(options.offset);
    }
    if (options?.limit !== undefined) {
      query = query.limit(options.limit);
    }
    return await query.all();
  }

  async findById(idMetrica: number): Promise<MetricasPublicacionRecord | null> {
    return await this.model.where({ idMetrica }).first();
  }

  async findByPublicacion(idPublicacion: number): Promise<MetricasPublicacionRecord[]> {
    return await this.model.where({ idPublicacion }).all();
  }

  async findByTipoEvento(idTipoEvento: number): Promise<MetricasPublicacionRecord[]> {
    return await this.model.where({ idTipoEvento }).all();
  }

  async findWithDetails(idMetrica: number) {
    return await this.model
      .where({ idMetrica })
      .include("tipoEvento")
      .include("publicacion")
      .first();
  }

  async create(data: MetricasPublicacionCreateInput): Promise<MetricasPublicacionRecord> {
    return await this.model.create(data);
  }

  async delete(idMetrica: number) {
    return await this.model.where({ idMetrica }).delete();
  }
}
