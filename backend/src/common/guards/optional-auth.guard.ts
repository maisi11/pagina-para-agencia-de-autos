import { Injectable } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { createRemoteJWKSet, jwtVerify } from "jose";

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
  private domain = process.env.AUTH0_DOMAIN ?? "";
  private audience = process.env.AUTH0_AUDIENCE ?? "";
  private readonly secretKey = new TextEncoder().encode(
    process.env.JWT_SECRET || "apex_motors_super_secret_jwt_key_2026_concesionaria"
  );

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

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return true;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return true;
    }

    // 1. Verificar JWT firmado localmente
    try {
      const { payload } = await jwtVerify(token, this.secretKey);
      request.user = payload;
      request.esVendedor = true;
      return true;
    } catch {
      // 2. Fallback a Auth0 si aplica
      if (this.jwks) {
        try {
          const { payload } = await jwtVerify(token, this.jwks, {
            issuer: `https://${this.domain}/`,
            audience: this.audience,
          });
          request.user = payload;
          request.esVendedor = true;
          return true;
        } catch {
          request.esVendedor = false;
        }
      }
    }

    return true;
  }
}
