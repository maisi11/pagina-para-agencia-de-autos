import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.ts";

export type UsuarioRecord = NonNullable<Awaited<ReturnType<PrismaService["db"]["orm"]["public"]["Usuario"]["first"]>>>;
export type UsuarioCreateInput = Parameters<PrismaService["db"]["orm"]["public"]["Usuario"]["create"]>[0];
export type UsuarioUpdateInput = Partial<UsuarioCreateInput>;

@Injectable()
export class UsuarioRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get model() {
    return this.prisma.db.orm.public.Usuario;
  }

  async findAll(): Promise<UsuarioRecord[]> {
    return await this.model.all();
  }

  async findById(idUsuario: number): Promise<UsuarioRecord | null> {
    return await this.model.where({ idUsuario }).first();
  }

  async findByEmail(email: string): Promise<UsuarioRecord | null> {
    return await this.model.where({ email }).first();
  }

  async findWithPublicaciones(idUsuario: number) {
    return await this.model
      .where({ idUsuario })
      .include("publicaciones")
      .first();
  }

  async create(data: UsuarioCreateInput): Promise<UsuarioRecord> {
    return await this.model.create(data);
  }

  async update(idUsuario: number, data: UsuarioUpdateInput) {
    return await this.model.where({ idUsuario }).update(data);
  }

  async delete(idUsuario: number) {
    return await this.model.where({ idUsuario }).delete();
  }
}
