import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";

export type DimensionesRecord = NonNullable<Awaited<ReturnType<PrismaService["db"]["orm"]["public"]["Dimensiones"]["first"]>>>;
export type DimensionesCreateInput = Parameters<PrismaService["db"]["orm"]["public"]["Dimensiones"]["create"]>[0];
export type DimensionesUpdateInput = Partial<DimensionesCreateInput>;

@Injectable()
export class DimensionesRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.Dimensiones;
  }

  async findAll(): Promise<DimensionesRecord[]> {
    return await this.model.all();
  }

  async findById(idDimensiones: number): Promise<DimensionesRecord | null> {
    return await this.model.where({ idDimensiones }).first();
  }

  async create(data: DimensionesCreateInput): Promise<DimensionesRecord> {
    return await this.model.create(data);
  }

  async update(idDimensiones: number, data: DimensionesUpdateInput) {
    return await this.model.where({ idDimensiones }).update(data);
  }

  async delete(idDimensiones: number) {
    return await this.model.where({ idDimensiones }).delete();
  }
}
