import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";

export type EstadoRecord = NonNullable<Awaited<ReturnType<PrismaService["db"]["orm"]["public"]["Estado"]["first"]>>>;
export type EstadoCreateInput = Parameters<PrismaService["db"]["orm"]["public"]["Estado"]["create"]>[0];
export type EstadoUpdateInput = Partial<EstadoCreateInput>;

@Injectable()
export class EstadoRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.Estado;
  }

  async findAll(): Promise<EstadoRecord[]> {
    return await this.model.all();
  }

  async findById(idEstado: number): Promise<EstadoRecord | null> {
    return await this.model.where({ idEstado }).first();
  }

  async findByNombre(nombre: string): Promise<EstadoRecord | null> {
    return await this.model.where({ nombre }).first();
  }

  async create(data: EstadoCreateInput): Promise<EstadoRecord> {
    return await this.model.create(data);
  }

  async update(idEstado: number, data: EstadoUpdateInput) {
    return await this.model.where({ idEstado }).update(data);
  }

  async delete(idEstado: number) {
    return await this.model.where({ idEstado }).delete();
  }
}
