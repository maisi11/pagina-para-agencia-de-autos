import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { UsuarioRepository } from "../../repository/usuario.repository.ts";

@Injectable()
export class AuthService{
    constructor(
        @Inject(UsuarioRepository) private readonly usuarioRepo: UsuarioRepository, ) {}
    
    async sincronizarUsuario(email: string, nombre: string = "Vendedor"){
        let usuario = await this.usuarioRepo.findByEmail(email)

        if (!usuario){
            usuario = await this.usuarioRepo.create({
                email,
                nombre,
                contrasena: "AUTH_MANAGED"
            });
        }
        return usuario;
    }

    async obtenerPerfil(email: string){
        const usuario = await this.usuarioRepo.findByEmail(email);

        if (!usuario){
            throw new NotFoundException (`Error, no se encontro al usuiario con el mail: ${email} `)
        };
        return usuario;
    }

}