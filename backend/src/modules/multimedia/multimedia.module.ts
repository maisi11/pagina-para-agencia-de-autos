import { Module } from "@nestjs/common";
import { MultimediaController } from "./multimedia.controller.ts";
import { MultimediaService } from "./multimedia.service.ts";

@Module({
  controllers: [MultimediaController],
  providers: [MultimediaService],
  exports: [MultimediaService],
})
export class MultimediaModule {}
