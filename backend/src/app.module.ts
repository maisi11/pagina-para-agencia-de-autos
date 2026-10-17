import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service.ts";
import { RepositoriesModule } from "./repository/repositories.module.ts";
import { ParametricosModule } from "./modules/parametricos/parametricos.module.ts";
import { PublicacionesModule } from "./modules/publicaciones/publicaciones.module.ts";
import { AuthModule } from "./modules/auth/auth.module.ts";

@Module({
  imports: [
    RepositoriesModule,
    ParametricosModule,
    PublicacionesModule,
    AuthModule
  ],
  controllers: [],
  providers: [
    PrismaService,
  ],
})
export class AppModule {}
