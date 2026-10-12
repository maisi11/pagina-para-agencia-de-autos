import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";

export type TipoEventoRecord = NonNullable<Awaited<ReturnType<PrismaService["db"]["orm"]["public"]["TipoEvento"]["first"]>>>;
export type TipoEventoCreateInput = Parameters<PrismaService["db"]["orm"]["public"]["TipoEvento"]["create"]>[0];
export type TipoEventoUpdateInput = Partial<TipoEventoCreateInput>;

@Injectable()
export class TipoEventoRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.TipoEvento;
  }

  async findAll(): Promise<TipoEventoRecord[]> {
    return await this.model.all();
  }

  async findById(idTipoEvento: number): Promise<TipoEventoRecord | null> {
    return await this.model.where({ idTipoEvento }).first();
  }

  async findByNombre(nombre: string): Promise<TipoEventoRecord | null> {
    return await this.model.where({ nombre }).first();
  }

  async findWithMetricas(idTipoEvento: number) {
    return await this.model
      .where({ idTipoEvento })
      .include("metricas")
      .first();
  }

  async create(data: TipoEventoCreateInput): Promise<TipoEventoRecord> {
    return await this.model.create(data);
  }

  async update(idTipoEvento: number, data: TipoEventoUpdateInput) {
    return await this.model.where({ idTipoEvento }).update(data);
  }

  async delete(idTipoEvento: number) {
    return await this.model.where({ idTipoEvento }).delete();
  }
}
