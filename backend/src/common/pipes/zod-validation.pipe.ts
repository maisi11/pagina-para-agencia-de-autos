import { BadRequestException } from "@nestjs/common";
import type { PipeTransform, ArgumentMetadata } from "@nestjs/common";
import type { ZodSchema } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const formattedErrors = result.error.flatten().fieldErrors;
      throw new BadRequestException({
        statusCode: 400,
        message: "Error de validación de datos",
        errors: formattedErrors,
      });
    }

    return result.data;
  }
}
