import {
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { createRemoteJWKSet, jwtVerify } from "jose";

@Injectable()
export class AuthGuard implements CanActivate {
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

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Se requiere un token de autenticación para acceder a este recurso."
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedException("Token de autenticación no proporcionado.");
    }

    // 1. Verificar firma y expiración del JWT firmado localmente (1 hora de vigencia)
    try {
      const { payload } = await jwtVerify(token, this.secretKey);
      request.user = payload;
      request.esVendedor = true;
      return true;
    } catch (err: any) {
      // Manejo estricto de expiración de sesión (1 hora)
      if (err?.code === "ERR_JWT_EXPIRED" || err?.message?.toLowerCase().includes("expired")) {
        throw new UnauthorizedException(
          "La sesión ha expirado por límite de tiempo (1 hora). Por favor, inicie sesión nuevamente."
        );
      }

      // 2. Fallback opcional a Auth0 si está configurado en el entorno
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
          // Ambos esquemas fallaron
        }
      }

      throw new UnauthorizedException(
        "Token de autenticación inválido o expirado. Por favor, inicie sesión nuevamente."
      );
    }
  }
}
