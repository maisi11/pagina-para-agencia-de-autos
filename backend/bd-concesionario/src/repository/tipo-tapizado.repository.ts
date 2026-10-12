import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";

export type TipoTapizadoRecord = NonNullable<Awaited<ReturnType<PrismaService["db"]["orm"]["public"]["TipoTapizado"]["first"]>>>;
export type TipoTapizadoCreateInput = Parameters<PrismaService["db"]["orm"]["public"]["TipoTapizado"]["create"]>[0];
export type TipoTapizadoUpdateInput = Partial<TipoTapizadoCreateInput>;

@Injectable()
export class TipoTapizadoRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.TipoTapizado;
  }

  async findAll(): Promise<TipoTapizadoRecord[]> {
    return await this.model.all();
  }

  async findById(idTipoTapizado: number): Promise<TipoTapizadoRecord | null> {
    return await this.model.where({ idTipoTapizado }).first();
  }

  async findByNombre(nombreTipoTapizado: string): Promise<TipoTapizadoRecord | null> {
    return await this.model.where({ nombreTipoTapizado }).first();
  }

  async create(data: TipoTapizadoCreateInput): Promise<TipoTapizadoRecord> {
    return await this.model.create(data);
  }

  async update(idTipoTapizado: number, data: TipoTapizadoUpdateInput) {
    return await this.model.where({ idTipoTapizado }).update(data);
  }

  async delete(idTipoTapizado: number) {
    return await this.model.where({ idTipoTapizado }).delete();
  }
}
