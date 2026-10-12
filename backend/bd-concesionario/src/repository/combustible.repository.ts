import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";

export type CombustibleRecord = NonNullable<Awaited<ReturnType<PrismaService["db"]["orm"]["public"]["Combustible"]["first"]>>>;
export type CombustibleCreateInput = Parameters<PrismaService["db"]["orm"]["public"]["Combustible"]["create"]>[0];
export type CombustibleUpdateInput = Partial<CombustibleCreateInput>;

@Injectable()
export class CombustibleRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.Combustible;
  }

  async findAll(): Promise<CombustibleRecord[]> {
    return await this.model.all();
  }

  async findById(idCombustible: number): Promise<CombustibleRecord | null> {
    return await this.model.where({ idCombustible }).first();
  }

  async findByNombre(nombreCombustible: string): Promise<CombustibleRecord | null> {
    return await this.model.where({ nombreCombustible }).first();
  }

  async create(data: CombustibleCreateInput): Promise<CombustibleRecord> {
    return await this.model.create(data);
  }

  async update(idCombustible: number, data: CombustibleUpdateInput) {
    return await this.model.where({ idCombustible }).update(data);
  }

  async delete(idCombustible: number) {
    return await this.model.where({ idCombustible }).delete();
  }
}
