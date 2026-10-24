import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Inject,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthService } from "./auth.service.ts";
import { LoginSchema, type LoginDto } from "./dto/auth.dto.ts";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.ts";
import { AuthGuard } from "../../common/guards/auth.guard.ts";
import { CurrentUser } from "../../common/decorators/currente-user.decorator.ts";

@Controller("api/auth")
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Get("perfil")
  @UseGuards(AuthGuard)
  async perfil(@CurrentUser() user: any) {
    const email = user.email ?? user[`https://${process.env.AUTH0_DOMAIN}/email`] ?? user.sub;
    return await this.authService.obtenerPerfil(email);
  }
}
