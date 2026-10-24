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
  UseGuards,
  Req,
} from "@nestjs/common";
import { PublicacionesService } from "./publicaciones.service.ts";
import {
  CreatePublicacionSchema,
  UpdatePublicacionSchema,
  FilterPublicacionesSchema,
  CambiarEstadoSchema,
  type CreatePublicacionDto,
  type UpdatePublicacionDto,
  type FilterPublicacionesDto,
  type CambiarEstadoDto,
} from "./dto/publicaciones.dto.ts";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.ts";
import { OptionalAuthGuard } from "../../common/guards/optional-auth.guard.ts";
import { AuthGuard } from "../../common/guards/auth.guard.ts";

@Controller("api/publicaciones")
export class PublicacionesController {
  constructor(
    @Inject(PublicacionesService) private readonly publicacionesService: PublicacionesService,
  ) {}

  // listado de publicaciones con filtros
  @Get()
  @UseGuards(OptionalAuthGuard)
  async listar(
    @Query(new ZodValidationPipe(FilterPublicacionesSchema)) filtros: FilterPublicacionesDto,
    @Req() req: any,
  ) {
    const esVendedor = Boolean(req.esVendedor);
    return await this.publicacionesService.listar(filtros, esVendedor);
  }

  // consulta de una publicacion especifica
  @Get(":id")
  @UseGuards(OptionalAuthGuard)
  async buscarPorId(@Param("id", ParseIntPipe) id: number) {
    return await this.publicacionesService.buscarPorId(id);
  }

  // crear una publicacion
  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreatePublicacionSchema))
  async crear(@Body() dto: CreatePublicacionDto) {
    return await this.publicacionesService.crearPublicacion(dto);
  }

  // modificar/actualizar una publicacion
  @Patch(":id")
  @UseGuards(AuthGuard)
  async actualizar(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdatePublicacionSchema)) dto: UpdatePublicacionDto,
  ) {
    return await this.publicacionesService.actualizarPublicacion(id, dto);
  }

  // Cambiar estado
  @Patch(":id/estado")
  @UseGuards(AuthGuard)
  async cambiarEstado(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(CambiarEstadoSchema)) dto: CambiarEstadoDto,
  ) {
    return await this.publicacionesService.cambiarEstado(id, dto.nuevoEstado);
  }

  // eliminar
  @Delete(":id")
  @UseGuards(AuthGuard)
  async eleminar(@Param("id", ParseIntPipe) id: number) {
    return await this.publicacionesService.eleminar(id);
  }
}
