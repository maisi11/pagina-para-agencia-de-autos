import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";

export type MotorRecord = NonNullable<Awaited<ReturnType<PrismaService["db"]["orm"]["public"]["Motor"]["first"]>>>;
export type MotorCreateInput = Parameters<PrismaService["db"]["orm"]["public"]["Motor"]["create"]>[0];
export type MotorUpdateInput = Partial<MotorCreateInput>;

@Injectable()
export class MotorRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.Motor;
  }

  async findAll(options?: { idTipoMotor?: number }): Promise<MotorRecord[]> {
    let query = this.model;
    if (options?.idTipoMotor !== undefined) {
      query = query.where({ idTipoMotor: options.idTipoMotor });
    }
    return await query.all();
  }

  async findById(idMotor: number): Promise<MotorRecord | null> {
    return await this.model.where({ idMotor }).first();
  }

  async findWithTipoMotor(idMotor: number) {
    return await this.model
      .where({ idMotor })
      .include("tipoMotor")
      .first();
  }

  async create(data: MotorCreateInput): Promise<MotorRecord> {
    return await this.model.create(data);
  }

  async update(idMotor: number, data: MotorUpdateInput) {
    return await this.model.where({ idMotor }).update(data);
  }

  async delete(idMotor: number) {
    return await this.model.where({ idMotor }).delete();
  }
}
