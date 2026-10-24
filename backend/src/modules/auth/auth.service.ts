import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { SignJWT } from "jose";
import { UsuarioRepository } from "../../repository/usuario.repository.ts";
import type { LoginDto } from "./dto/auth.dto.ts";

@Injectable()
export class AuthService {
  private readonly secretKey = new TextEncoder().encode(
    process.env.JWT_SECRET || "apex_motors_super_secret_jwt_key_2026_concesionaria"
  );

  constructor(
    @Inject(UsuarioRepository) private readonly usuarioRepo: UsuarioRepository,
  ) {}

  async login(dto: LoginDto) {
    const emailNormalizado = dto.email.toLowerCase().trim();
    const usuario = await this.usuarioRepo.findByEmail(emailNormalizado);

    if (!usuario) {
      throw new UnauthorizedException(
        "Credenciales inválidas. Correo electrónico o contraseña incorrectos."
      );
    }

    const contrasenaValida = this.verificarContrasena(dto.contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      throw new UnauthorizedException(
        "Credenciales inválidas. Correo electrónico o contraseña incorrectos."
      );
    }

    // Generar JWT con duración de 1 hora (1h)
    const token = await new SignJWT({
      sub: String(usuario.idUsuario),
      idUsuario: usuario.idUsuario,
      email: usuario.email,
      nombre: usuario.nombre,
      esVendedor: true,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(this.secretKey);

    return {
      token,
      expiresIn: 3600, // 3600 segundos = 1 hora
      usuario: {
        idUsuario: usuario.idUsuario,
        nombre: usuario.nombre,
        email: usuario.email,
      },
    };
  }

  private verificarContrasena(ingresada: string, almacenada: string): boolean {
    if (!ingresada || !almacenada) return false;
    return ingresada === almacenada;
  }

  async sincronizarUsuario(email: string, nombre: string = "Vendedor") {
    let usuario = await this.usuarioRepo.findByEmail(email.toLowerCase().trim());

    if (!usuario) {
      usuario = await this.usuarioRepo.create({
        email: email.toLowerCase().trim(),
        nombre,
        contrasena: "AUTH_MANAGED",
      });
    }
    const { contrasena: _, ...resto } = usuario;
    return resto;
  }

  async obtenerPerfil(email: string) {
    const usuario = await this.usuarioRepo.findByEmail(email.toLowerCase().trim());

    if (!usuario) {
      throw new NotFoundException(`Error, no se encontró al usuario con el email: ${email}`);
    }

    const { contrasena: _, ...resto } = usuario;
    return resto;
  }
}
