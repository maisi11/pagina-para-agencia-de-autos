import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";

export type CajaRecord = NonNullable<Awaited<ReturnType<PrismaService["db"]["orm"]["public"]["Caja"]["first"]>>>;
export type CajaCreateInput = Parameters<PrismaService["db"]["orm"]["public"]["Caja"]["create"]>[0];
export type CajaUpdateInput = Partial<CajaCreateInput>;

@Injectable()
export class CajaRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.Caja;
  }

  async findAll(): Promise<CajaRecord[]> {
    return await this.model.all();
  }

  async findById(idCaja: number): Promise<CajaRecord | null> {
    return await this.model.where({ idCaja }).first();
  }

  async findByNombre(nombreCaja: string): Promise<CajaRecord | null> {
    return await this.model.where({ nombreCaja }).first();
  }

  async create(data: CajaCreateInput): Promise<CajaRecord> {
    return await this.model.create(data);
  }

  async update(idCaja: number, data: CajaUpdateInput) {
    return await this.model.where({ idCaja }).update(data);
  }

  async delete(idCaja: number) {
    return await this.model.where({ idCaja }).delete();
  }
}
