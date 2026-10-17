import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller.ts";
import { AuthService } from "./auth.service.ts";
import { RepositoriesModule } from "../../repository/repositories.module.ts";

@Module({
  imports: [RepositoriesModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}