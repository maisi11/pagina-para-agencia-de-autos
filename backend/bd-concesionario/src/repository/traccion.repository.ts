import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";

export type TraccionRecord = NonNullable<Awaited<ReturnType<PrismaService["db"]["orm"]["public"]["Traccion"]["first"]>>>;
export type TraccionCreateInput = Parameters<PrismaService["db"]["orm"]["public"]["Traccion"]["create"]>[0];
export type TraccionUpdateInput = Partial<TraccionCreateInput>;

@Injectable()
export class TraccionRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.Traccion;
  }

  async findAll(): Promise<TraccionRecord[]> {
    return await this.model.all();
  }

  async findById(idTraccion: number): Promise<TraccionRecord | null> {
    return await this.model.where({ idTraccion }).first();
  }

  async findByNombre(nombreTraccion: string): Promise<TraccionRecord | null> {
    return await this.model.where({ nombreTraccion }).first();
  }

  async create(data: TraccionCreateInput): Promise<TraccionRecord> {
    return await this.model.create(data);
  }

  async update(idTraccion: number, data: TraccionUpdateInput) {
    return await this.model.where({ idTraccion }).update(data);
  }

  async delete(idTraccion: number) {
    return await this.model.where({ idTraccion }).delete();
  }
}
