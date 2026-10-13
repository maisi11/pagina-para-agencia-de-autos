import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";

export type ModeloRecord = NonNullable<Awaited<ReturnType<PrismaService["db"]["orm"]["public"]["Modelo"]["first"]>>>;
export type ModeloCreateInput = Parameters<PrismaService["db"]["orm"]["public"]["Modelo"]["create"]>[0];
export type ModeloUpdateInput = Partial<ModeloCreateInput>;

@Injectable()
export class ModeloRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.Modelo;
  }

  async findAll(options?: { idMarca?: number }): Promise<ModeloRecord[]> {
    let query = this.model;
    if (options?.idMarca !== undefined) {
      query = query.where({ idMarca: options.idMarca });
    }
    return await query.all();
  }

  async findById(idModelo: number): Promise<ModeloRecord | null> {
    return await this.model.where({ idModelo }).first();
  }

  async findByMarca(idMarca: number): Promise<ModeloRecord[]> {
    return await this.model.where({ idMarca }).all();
  }

  async findWithMarca(idModelo: number) {
    return await this.model
      .where({ idModelo })
      .include("marca")
      .first();
  }

  async findWithVersiones(idModelo: number) {
    return await this.model
      .where({ idModelo })
      .include("versiones")
      .first();
  }

  async findComplete(idModelo: number) {
    return await this.model
      .where({ idModelo })
      .include("marca")
      .include("versiones")
      .first();
  }

  async create(data: ModeloCreateInput): Promise<ModeloRecord> {
    return await this.model.create(data);
  }

  async update(idModelo: number, data: ModeloUpdateInput) {
    return await this.model.where({ idModelo }).update(data);
  }

  async delete(idModelo: number) {
    return await this.model.where({ idModelo }).delete();
  }
}
