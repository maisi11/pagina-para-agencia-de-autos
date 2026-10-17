import {
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { Observable } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate{
    private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
    private domain = process.env.AUTH0_DOMAIN ?? "";
    private audience = process.env.AUTH0_AUDIENCE ?? "";

    constructor(){
        if (this.domain){
            const jwksUrl = new URL(`https://${this.domain}/.well-known/jwks.json`);
            this.jwks = createRemoteJWKSet(jwksUrl);
        }
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer"))
            throw new UnauthorizedException("Error se requiere un token de autenticacion")

        const token = authHeader.split(" ")[1]

        if (!this.jwks){
            throw new UnauthorizedException("Error, no esta configurado el servicio de autenticacion")
        }

        try {
            const {payload} = await jwtVerify(token, this.jwks, {
                issuer: `https://${this.domain}/`,
                audience: this.audience
            })
            request.user = payload
            return true
            
        } catch (error) {
            throw new UnauthorizedException("Error, token invalido o expirado")
        }
        
    }

}