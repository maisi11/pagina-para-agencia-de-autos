import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";

export type TipoDireccionRecord = NonNullable<Awaited<ReturnType<PrismaService["db"]["orm"]["public"]["TipoDireccion"]["first"]>>>;
export type TipoDireccionCreateInput = Parameters<PrismaService["db"]["orm"]["public"]["TipoDireccion"]["create"]>[0];
export type TipoDireccionUpdateInput = Partial<TipoDireccionCreateInput>;

@Injectable()
export class TipoDireccionRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.TipoDireccion;
  }

  async findAll(): Promise<TipoDireccionRecord[]> {
    return await this.model.all();
  }

  async findById(idTipoDireccion: number): Promise<TipoDireccionRecord | null> {
    return await this.model.where({ idTipoDireccion }).first();
  }

  async findByNombre(nombre: string): Promise<TipoDireccionRecord | null> {
    return await this.model.where({ nombre }).first();
  }

  async create(data: TipoDireccionCreateInput): Promise<TipoDireccionRecord> {
    return await this.model.create(data);
  }

  async update(idTipoDireccion: number, data: TipoDireccionUpdateInput) {
    return await this.model.where({ idTipoDireccion }).update(data);
  }

  async delete(idTipoDireccion: number) {
    return await this.model.where({ idTipoDireccion }).delete();
  }
}
