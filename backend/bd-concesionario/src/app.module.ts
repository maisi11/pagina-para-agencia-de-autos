import { Module } from "@nestjs/common";
import { AppController } from "./controller/app.controller.ts";
import { PrismaService } from "./prisma.service.ts";
import { UsersController } from "./controller/users.controller.ts";
import { UsersService } from "./users.service.ts";
import { RepositoriesModule } from "./repository/repositories.module.ts";

@Module({
  imports: [RepositoriesModule],
  controllers: [
    AppController,
    UsersController,
  ],
  providers: [
    PrismaService,
    UsersService,
  ],
})
export class AppModule {}
