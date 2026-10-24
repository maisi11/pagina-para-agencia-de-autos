import { Controller, Get, Post, Query, Inject } from "@nestjs/common";
import { MultimediaService } from "./multimedia.service.ts";

@Controller("api/multimedia")
export class MultimediaController {
  constructor(
    @Inject(MultimediaService) private readonly multimediaService: MultimediaService
  ) {}

  @Get("signature")
  obtenerFirmaGet(@Query("folder") folder?: string) {
    return this.multimediaService.generarFirmaSubida(folder);
  }

  @Post("signature")
  obtenerFirmaPost(@Query("folder") folder?: string) {
    return this.multimediaService.generarFirmaSubida(folder);
  }
}
