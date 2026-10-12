import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";

export type VersionRecord = NonNullable<Awaited<ReturnType<PrismaService["db"]["orm"]["public"]["Version"]["first"]>>>;
export type VersionCreateInput = Parameters<PrismaService["db"]["orm"]["public"]["Version"]["create"]>[0];
export type VersionUpdateInput = Partial<VersionCreateInput>;

@Injectable()
export class VersionRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.Version;
  }

  async findAll(options?: { idModelo?: number }): Promise<VersionRecord[]> {
    let query = this.model;
    if (options?.idModelo !== undefined) {
      query = query.where({ idModelo: options.idModelo });
    }
    return await query.all();
  }

  async findById(idVersion: number): Promise<VersionRecord | null> {
    return await this.model.where({ idVersion }).first();
  }

  async findByModelo(idModelo: number): Promise<VersionRecord[]> {
    return await this.model.where({ idModelo }).all();
  }

  async findWithModelo(idVersion: number) {
    return await this.model
      .where({ idVersion })
      .include("modelo", (m) => m.include("marca"))
      .first();
  }

  async create(data: VersionCreateInput): Promise<VersionRecord> {
    return await this.model.create(data);
  }

  async update(idVersion: number, data: VersionUpdateInput) {
    return await this.model.where({ idVersion }).update(data);
  }

  async delete(idVersion: number) {
    return await this.model.where({ idVersion }).delete();
  }
}
