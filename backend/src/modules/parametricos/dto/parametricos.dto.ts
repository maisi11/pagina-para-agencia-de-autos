import { z } from "zod";

// 1. Para catálogos simples (solo nombre)
// Aplica a: Segmento, Combustible, Carrocería, Tracción, Condición
export const CreateParametricoSimpleSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre debe tener un largo máximo de 80 caracteres"),
});
export type CreateParametricoSimpleDto = z.infer<typeof CreateParametricoSimpleSchema>;

// 2. Para catálogos con descripción opcional
// Aplica a: Caja, TipoTapizado, TipoDirección
export const CreateParametricoConDescripcionSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre debe tener un largo máximo de 80 caracteres"),
  descripcion: z
    .string()
    .trim()
    .max(255, "La descripción debe tener un largo máximo de 255 caracteres")
    .optional(),
});
export type CreateParametricoConDescripcionDto = z.infer<typeof CreateParametricoConDescripcionSchema>;

// 2b. Para Marcas
export const CreateMarcaSchema = z.object({
  nombreMarca: z
    .string()
    .trim()
    .min(2, "El nombre de la marca debe tener al menos 2 caracteres")
    .max(80, "El nombre de la marca no puede superar los 80 caracteres"),
});
export type CreateMarcaDto = z.infer<typeof CreateMarcaSchema>;

// 2c. Para Modelos (asociados a una Marca)
export const CreateModeloSchema = z.object({
  nombreModelo: z
    .string()
    .trim()
    .min(1, "El nombre del modelo es obligatorio")
    .max(80, "El nombre no puede superar los 80 caracteres"),
  idMarca: z
    .number()
    .int("El idMarca debe ser un número entero")
    .positive("Debe indicar una marca válida"),
});
export type CreateModeloDto = z.infer<typeof CreateModeloSchema>;

// 3. Para Tipo de Motor
export const CreateTipoMotorSchema = z.object({
  nombreTipo: z
    .string()
    .trim()
    .min(2, "El nombre del tipo de motor debe tener al menos 2 caracteres")
    .max(80, "El nombre debe tener un largo máximo de 80 caracteres"),
});
export type CreateTipoMotorDto = z.infer<typeof CreateTipoMotorSchema>;

// 4. Para Dimensiones
export const CreateDimensionesSchema = z.object({
  largo: z.number().positive("El largo debe ser mayor que 0"),
  alto: z.number().positive("El alto debe ser mayor que 0"),
  ancho: z.number().positive("El ancho debe ser mayor que 0"),
});
export type CreateDimensionesDto = z.infer<typeof CreateDimensionesSchema>;

// 5. Para Versión (asociada a un Modelo)
export const CreateVersionSchema = z.object({
  nombreVersion: z
    .string()
    .trim()
    .min(1, "El nombre de la versión es obligatorio")
    .max(80, "El nombre no puede superar los 80 caracteres"),
  idModelo: z
    .number()
    .int("El idModelo debe ser un número entero")
    .positive("Debe indicar un modelo válido"),
  descripcion: z
    .string()
    .trim()
    .max(255, "La descripción debe tener un largo máximo de 255 caracteres")
    .optional(),
});
export type CreateVersionDto = z.infer<typeof CreateVersionSchema>;

// 6. Para Motor
export const CreateMotorSchema = z.object({
  idTipoMotor: z
    .number()
    .int("El idTipoMotor debe ser un entero")
    .positive("Debe indicar un tipo de motor válido"),
  descripcion: z
    .string()
    .trim()
    .max(255, "La descripción no puede superar los 255 caracteres")
    .optional(),
  potencia: z.number().positive("La potencia debe ser mayor a 0").optional(),
  torque: z.number().positive("El torque debe ser mayor a 0").optional(),
});
export type CreateMotorDto = z.infer<typeof CreateMotorSchema>;
