import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";

export type VehiculoRecord = NonNullable<Awaited<ReturnType<PrismaService["db"]["orm"]["public"]["Vehiculo"]["first"]>>>;
export type VehiculoCreateInput = Parameters<PrismaService["db"]["orm"]["public"]["Vehiculo"]["create"]>[0];
export type VehiculoUpdateInput = Partial<VehiculoCreateInput>;

@Injectable()
export class VehiculoRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.Vehiculo;
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<VehiculoRecord[]> {
    let query = this.model;
    if (options?.offset !== undefined) {
      query = query.offset(options.offset);
    }
    if (options?.limit !== undefined) {
      query = query.limit(options.limit);
    }
    return await query.all();
  }

  async findByPatente(patente: string): Promise<VehiculoRecord | null> {
    return await this.model.where({ patente }).first();
  }

  async findByCodigo(codigoVehiculo: string): Promise<VehiculoRecord | null> {
    return await this.model.where({ codigoVehiculo }).first();
  }

  async findByPublicacionId(idPublicacion: number): Promise<VehiculoRecord | null> {
    return await this.model.where({ idPublicacion }).first();
  }

  async findWithAllDetails(patente: string) {
    return await this.model
      .where({ patente })
      .include("publicacion")
      .include("traccion")
      .include("segmento")
      .include("modelo", (m) => m.include("marca"))
      .include("tipoCarroceria")
      .include("condicion")
      .include("tipoTapizado")
      .include("dimensiones")
      .include("caja")
      .include("motor", (mo) => mo.include("tipoMotor"))
      .include("combustible")
      .include("tipoDireccion")
      .first();
  }

  async create(data: VehiculoCreateInput): Promise<VehiculoRecord> {
    return await this.model.create(data);
  }

  async update(patente: string, data: VehiculoUpdateInput) {
    return await this.model.where({ patente }).update(data);
  }

  async delete(patente: string) {
    return await this.model.where({ patente }).delete();
  }
}
