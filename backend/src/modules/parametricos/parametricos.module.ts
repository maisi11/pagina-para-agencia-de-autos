import { Module } from "@nestjs/common";
import { ParametricosController } from "./parametricos.controller.ts";
import { ParametricosService } from "./parametricos.service.ts";
import { RepositoriesModule } from "../../repository/repositories.module.ts";

@Module({
  imports: [RepositoriesModule],
  controllers: [ParametricosController],
  providers: [ParametricosService],
  exports: [ParametricosService],
})
export class ParametricosModule {}
