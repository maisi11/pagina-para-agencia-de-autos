import { Module } from "@nestjs/common";
import { PublicacionesController } from "./publicaciones.controller.ts";
import { PublicacionesService } from "./publicaciones.service.ts";
import { RepositoriesModule } from "../../repository/repositories.module.ts";

@Module({
  imports: [RepositoriesModule],
  controllers: [PublicacionesController],
  providers: [PublicacionesService],
  exports: [PublicacionesService],
})
export class PublicacionesModule {}