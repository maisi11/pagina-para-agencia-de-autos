import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";

export type MarcaRecord = NonNullable<Awaited<ReturnType<PrismaService["db"]["orm"]["public"]["Marca"]["first"]>>>;
export type MarcaCreateInput = Parameters<PrismaService["db"]["orm"]["public"]["Marca"]["create"]>[0];
export type MarcaUpdateInput = Partial<MarcaCreateInput>;

@Injectable()
export class MarcaRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.Marca;
  }

  async findAll(): Promise<MarcaRecord[]> {
    return await this.model.all();
  }

  async findById(idMarca: number): Promise<MarcaRecord | null> {
    return await this.model.where({ idMarca }).first();
  }

  async findByNombre(nombreMarca: string): Promise<MarcaRecord | null> {
    return await this.model.where({ nombreMarca }).first();
  }

  async findWithModelos(idMarca: number) {
    return await this.model
      .where({ idMarca })
      .include("modelos")
      .first();
  }

  async create(data: MarcaCreateInput): Promise<MarcaRecord> {
    return await this.model.create(data);
  }

  async update(idMarca: number, data: MarcaUpdateInput) {
    return await this.model.where({ idMarca }).update(data);
  }

  async delete(idMarca: number) {
    return await this.model.where({ idMarca }).delete();
  }
}
