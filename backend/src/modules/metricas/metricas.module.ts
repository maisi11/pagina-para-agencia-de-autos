import { Module } from "@nestjs/common";
import { MetricasController } from "./metricas.controller.ts";
import { MetricasService } from "./metricas.service.ts";
import { RepositoriesModule } from "../../repository/repositories.module.ts";

@Module({
  imports: [RepositoriesModule],
  controllers: [MetricasController],
  providers: [MetricasService],
  exports: [MetricasService],
})
export class MetricasModule {}