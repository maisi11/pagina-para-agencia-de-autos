import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";

export type TipoMotorRecord = NonNullable<Awaited<ReturnType<PrismaService["db"]["orm"]["public"]["TipoMotor"]["first"]>>>;
export type TipoMotorCreateInput = Parameters<PrismaService["db"]["orm"]["public"]["TipoMotor"]["create"]>[0];
export type TipoMotorUpdateInput = Partial<TipoMotorCreateInput>;

@Injectable()
export class TipoMotorRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.TipoMotor;
  }

  async findAll(): Promise<TipoMotorRecord[]> {
    return await this.model.all();
  }

  async findById(idTipoMotor: number): Promise<TipoMotorRecord | null> {
    return await this.model.where({ idTipoMotor }).first();
  }

  async findByNombre(nombreTipo: string): Promise<TipoMotorRecord | null> {
    return await this.model.where({ nombreTipo }).first();
  }

  async findWithMotores(idTipoMotor: number) {
    return await this.model
      .where({ idTipoMotor })
      .include("motores")
      .first();
  }

  async create(data: TipoMotorCreateInput): Promise<TipoMotorRecord> {
    return await this.model.create(data);
  }

  async update(idTipoMotor: number, data: TipoMotorUpdateInput) {
    return await this.model.where({ idTipoMotor }).update(data);
  }

  async delete(idTipoMotor: number) {
    return await this.model.where({ idTipoMotor }).delete();
  }
}
