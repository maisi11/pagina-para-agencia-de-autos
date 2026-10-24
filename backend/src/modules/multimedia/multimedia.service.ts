import { Injectable } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";

@Injectable()
export class MultimediaService {
  private cloudName = process.env.CLOUDINARY_CLOUD_NAME || "ixuaavzy";
  private apiKey = process.env.CLOUDINARY_API_KEY || "558889764918348";
  private apiSecret = process.env.CLOUDINARY_API_SECRET || "CmV68jMHb_ZNa3AJZ43wr-z7t7U";
  private defaultFolder = "concesionaria/vehiculos";

  constructor() {
    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
      secure: true,
    });
  }

  /**
   * Genera una firma criptográfica para subida directa desde el navegador (Direct Signed Upload).
   * Evita transferir megabytes pesados al servidor y garantiza que el API Secret nunca se exponga al cliente.
   */
  generarFirmaSubida(folder: string = this.defaultFolder) {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const paramsToSign = {
      folder,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      this.apiSecret
    );

    return {
      timestamp,
      signature,
      apiKey: this.apiKey,
      cloudName: this.cloudName,
      folder,
    };
  }
}
