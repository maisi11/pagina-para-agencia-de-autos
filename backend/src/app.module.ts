import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service.ts";
import { RepositoriesModule } from "./repository/repositories.module.ts";
import { ParametricosModule } from "./modules/parametricos/parametricos.module.ts";

@Module({
  imports: [
    RepositoriesModule,
    ParametricosModule,
  ],
  controllers: [],
  providers: [
    PrismaService,
  ],
})
export class AppModule {}
