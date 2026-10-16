import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UsePipes,
  HttpCode,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import { PublicacionesService } from "./publicaciones.service.ts";
import {
  CreatePublicacionSchema,
  FilterPublicacionesSchema,
  CambiarEstadoSchema,
  type CreatePublicacionDto,
  type FilterPublicacionesDto,
  type CambiarEstadoDto,
} from "./dto/publicaciones.dto.ts";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.ts";

@Controller("api/publicaciones")
export class PublicacionesController{
    constructor(
        @Inject(PublicacionesService) private readonly publicacionesService: PublicacionesService,
    ){}

    // listado de publicaciones con filtros
    @Get()
    async listar(
        @Query(new ZodValidationPipe(FilterPublicacionesSchema)) filtros: FilterPublicacionesDto,
    ){
        // falta implementar la validadcion de si es vendedor o no. queda con un booolean provisorio
        const esVendedor = false
        return await this.publicacionesService.listar(filtros, esVendedor)

    }
    //consulta de una publicacion especifica
    @Get(":id")
    async buscarPorId(@Param("id", ParseIntPipe) id: number){
        return await this.publicacionesService.buscarPorId(id)
    }
    
    // crear una publicacion
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UsePipes( new ZodValidationPipe(CreatePublicacionSchema))
    async crear(@Body() dto: CreatePublicacionDto){
        return await this.publicacionesService.crearPublicacion(dto)
    }

    // Cambiar estado

    @Patch(":id/estado")
    @UsePipes(new ZodValidationPipe(CambiarEstadoSchema))
    async cambiarEstado(
        @Param("id", ParseIntPipe) id: number,
        @Body() dto: CambiarEstadoDto,
    ){
        return await this.publicacionesService.cambiarEstado(id, dto.nuevoEstado)
    }

    // eleminar
    @Delete(":id")
    async eleminar(@Param("id", ParseIntPipe)id: number){
        return await this.publicacionesService.eleminar(id)
    }

}