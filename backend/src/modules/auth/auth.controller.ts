import { Controller, Get, UseGuards, Inject } from "@nestjs/common";
import { AuthService } from "./auth.service.ts";
import { AuthGuard } from "../../common/guards/auth.guard.ts";
import { CurrentUser } from "../../common/decorators/currente-user.decorator.ts";

@Controller("api/auth")
export class AuthController {
    constructor(
        @Inject(AuthService) private readonly authService: AuthService
    ) {}

    @Get("perfil")
    @UseGuards(AuthGuard)
    async perfil(@CurrentUser() user: any){
        const email = user.email ?? user[`https://${process.env.AUTH0_DOMAIN}/email`] ?? user.sub;
        return await this.authService.sincronizarUsuario(email, user.name);
    }
} 