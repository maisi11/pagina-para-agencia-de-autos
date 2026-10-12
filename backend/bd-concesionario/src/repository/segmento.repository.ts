import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";

export type SegmentoRecord = NonNullable<Awaited<ReturnType<PrismaService["db"]["orm"]["public"]["Segmento"]["first"]>>>;
export type SegmentoCreateInput = Parameters<PrismaService["db"]["orm"]["public"]["Segmento"]["create"]>[0];
export type SegmentoUpdateInput = Partial<SegmentoCreateInput>;

@Injectable()
export class SegmentoRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.Segmento;
  }

  async findAll(): Promise<SegmentoRecord[]> {
    return await this.model.all();
  }

  async findById(idSegmento: number): Promise<SegmentoRecord | null> {
    return await this.model.where({ idSegmento }).first();
  }

  async findByNombre(nombreSegmento: string): Promise<SegmentoRecord | null> {
    return await this.model.where({ nombreSegmento }).first();
  }

  async create(data: SegmentoCreateInput): Promise<SegmentoRecord> {
    return await this.model.create(data);
  }

  async update(idSegmento: number, data: SegmentoUpdateInput) {
    return await this.model.where({ idSegmento }).update(data);
  }

  async delete(idSegmento: number) {
    return await this.model.where({ idSegmento }).delete();
  }
}
