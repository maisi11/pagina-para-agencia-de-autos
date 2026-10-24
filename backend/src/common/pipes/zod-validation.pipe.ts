import { BadRequestException } from "@nestjs/common";
import type { PipeTransform, ArgumentMetadata } from "@nestjs/common";
import type { ZodSchema } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type === "param" || metadata.type === "custom") {
      return value;
    }

    const result = this.schema.safeParse(value);

    if (!result.success) {
      const formattedErrors = result.error.flatten();
      throw new BadRequestException({
        statusCode: 400,
        message: "Error de validación de datos",
        errors: formattedErrors.fieldErrors,
        formErrors: formattedErrors.formErrors,
      });
    }

    return result.data;
  }
}
