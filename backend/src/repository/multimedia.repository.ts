import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";

export type MultimediaRecord = NonNullable<Awaited<ReturnType<PrismaService["db"]["orm"]["public"]["Multimedia"]["first"]>>>;
export type MultimediaCreateInput = Parameters<PrismaService["db"]["orm"]["public"]["Multimedia"]["create"]>[0];
export type MultimediaUpdateInput = Partial<MultimediaCreateInput>;

@Injectable()
export class MultimediaRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.Multimedia;
  }

  async findAll(): Promise<MultimediaRecord[]> {
    return await this.model.all();
  }

  async findById(idArchivo: number): Promise<MultimediaRecord | null> {
    return await this.model.where({ idArchivo }).first();
  }

  async findByPublicacion(idPublicacion: number): Promise<MultimediaRecord[]> {
    return await this.model.where({ idPublicacion }).all();
  }

  async create(data: MultimediaCreateInput): Promise<MultimediaRecord> {
    return await this.model.create(data);
  }

  async update(idArchivo: number, data: MultimediaUpdateInput) {
    return await this.model.where({ idArchivo }).update(data);
  }

  async delete(idArchivo: number) {
    return await this.model.where({ idArchivo }).delete();
  }

  async deleteByPublicacion(idPublicacion: number) {
    const existentes = await this.model.where({ idPublicacion }).all();
    for (const item of existentes) {
      await this.model.where({ idArchivo: item.idArchivo }).delete();
    }
    return existentes;
  }
}
