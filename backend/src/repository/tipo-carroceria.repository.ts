import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";

export type TipoCarroceriaRecord = NonNullable<Awaited<ReturnType<PrismaService["db"]["orm"]["public"]["TipoCarroceria"]["first"]>>>;
export type TipoCarroceriaCreateInput = Parameters<PrismaService["db"]["orm"]["public"]["TipoCarroceria"]["create"]>[0];
export type TipoCarroceriaUpdateInput = Partial<TipoCarroceriaCreateInput>;

@Injectable()
export class TipoCarroceriaRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.TipoCarroceria;
  }

  async findAll(): Promise<TipoCarroceriaRecord[]> {
    return await this.model.all();
  }

  async findById(idTipoCarroceria: number): Promise<TipoCarroceriaRecord | null> {
    return await this.model.where({ idTipoCarroceria }).first();
  }

  async findByNombre(nombreTipoCarroceria: string): Promise<TipoCarroceriaRecord | null> {
    return await this.model.where({ nombreTipoCarroceria }).first();
  }

  async create(data: TipoCarroceriaCreateInput): Promise<TipoCarroceriaRecord> {
    return await this.model.create(data);
  }

  async update(idTipoCarroceria: number, data: TipoCarroceriaUpdateInput) {
    return await this.model.where({ idTipoCarroceria }).update(data);
  }

  async delete(idTipoCarroceria: number) {
    return await this.model.where({ idTipoCarroceria }).delete();
  }
}
