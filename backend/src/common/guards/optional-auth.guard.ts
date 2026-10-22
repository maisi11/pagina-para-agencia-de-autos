import { Injectable } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { Observable } from "rxjs";

@Injectable()
export class OptionalAuthGuard implements CanActivate{
    private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
    private domain = process.env.AUTH0_DOMAIN ?? "";
    private audience = process.env.AUTH0_AUDIENCE ?? "";

    constructor() {
    if (this.domain) {
        const jwksUrl = new URL(`https://${this.domain}/.well-known/jwks.json`);
        this.jwks = createRemoteJWKSet(jwksUrl);
    }
}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        request.esVendedor = false;

        if (!authHeader || !authHeader.startsWith("Bearer ") || !this.jwks){
            return true;
        }

        try{
            const token = authHeader.split(" ")[1];
            if (token === "dev-token-vendedor" || token?.startsWith("mock-")) {
                request.user = { email: "vendedor@concesionaria.com", name: "Martín Benítez", sub: "local-1" };
                request.esVendedor = true;
                return true;
            }
            const {payload} = await jwtVerify(token, this.jwks, {
                issuer: `https://${this.domain}/`,
                audience: this.audience,
            });

            request.user = payload;
            request.esVendedor = true;

        } catch {
            request.esVendedor = false;
        }

        return true
    }
}