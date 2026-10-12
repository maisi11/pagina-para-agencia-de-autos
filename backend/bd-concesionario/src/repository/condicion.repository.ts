import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";

export type CondicionRecord = NonNullable<Awaited<ReturnType<PrismaService["db"]["orm"]["public"]["Condicion"]["first"]>>>;
export type CondicionCreateInput = Parameters<PrismaService["db"]["orm"]["public"]["Condicion"]["create"]>[0];
export type CondicionUpdateInput = Partial<CondicionCreateInput>;

@Injectable()
export class CondicionRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.Condicion;
  }

  async findAll(): Promise<CondicionRecord[]> {
    return await this.model.all();
  }

  async findById(idCondicion: number): Promise<CondicionRecord | null> {
    return await this.model.where({ idCondicion }).first();
  }

  async findByNombre(nombreCondicion: string): Promise<CondicionRecord | null> {
    return await this.model.where({ nombreCondicion }).first();
  }

  async create(data: CondicionCreateInput): Promise<CondicionRecord> {
    return await this.model.create(data);
  }

  async update(idCondicion: number, data: CondicionUpdateInput) {
    return await this.model.where({ idCondicion }).update(data);
  }

  async delete(idCondicion: number) {
    return await this.model.where({ idCondicion }).delete();
  }
}
