import { z } from "zod";

export const CreatePublicacionSchema = z.object({
    titulo: z
        .string()
        .trim()
        .min(1, "El titulo de la publicacion no debe estar vacio")
        .max(120, "El titulo no debe superar los 120 carcteres"),

    descripcion: z
        .string()
        .trim()
        .min(1, "La descripcion no debe estar vacia"),

    precio: z
        .number()
        .positive("El precio debe ser mayor que 0"),
    idUsuario: z
        .number()
        .int("El id debe ser un entero")
        .positive("El id debe existir"),

    vehiculo: z.object({
        codigoVehiculo: z
            .string()
            .trim()
            .min(1,"El codigo es obligatorio"),
        patente: z
            .string()
            .trim()
            .min(1,"La panetnte es obligatoria")
            .max(8, "La cantidad de carcteres de, la patente no puede ser superior a 8"),
        anio: z
            .number()
            .int("El año debe ser un numero entero")
            .positive("El año debe ser mayor que 0"),
        kilometros: z
            .number()
            .int("La cantidad de kilometros debe ser un numero entero")
            .positive("La cantidad de kilometros debe ser mayor que 0"),
        cantidadPuertas:z
            .number()
            .int("La cantidad de puertas debe ser un numero entero")
            .positive("La cantidad de puertas debe ser mayor que 0"),
        color: z
            .string()
            .trim()
            .min(1,"El color es obligatorio"),
        cantidadAsientos: z
            .number()
            .int("La cantidad de asientos debe ser un numero entero")
            .positive("La cantidad de asientos debe ser mayor que 0"),
        capacidadRemolque: z
            .number()
            .int("La capacidad de remolque debe ser un numero entero")
            .positive("La capacidad de remolque debe ser mayor que 0")
            .optional(),
        capacidadBaul: z
            .number()
            .int("La capacidad del baul debe ser un numero entero")
            .positive("La capacidad del baul debe ser mayor que 0")
            .optional(),
        capacidadTanque: z
            .number()
            .int("La capacidad del tanque debe ser un numero entero")
            .positive("La capacidad del tanque debe ser mayor que 0")
            .optional(),
        cantidadAirbags: z
            .number()
            .int("La cantidad de airbags debe ser un numero entero")
            .positive("La cantidad de airbags debe ser mayor que 0"),

        idMarca: z.number().int().positive(),
        idModelo: z.number().int().positive(),
        idSegmento: z.number().int().positive(),
        idTipoCarroceria: z.number().int().positive(),
        idCondicion: z.number().int().positive(),
        idCaja: z.number().int().positive(),
        idTraccion: z.number().int().positive(),
        idCombustible: z.number().int().positive(),
        idTipoDireccion: z.number().int().positive(),
        idTipoTapizado: z.number().int().positive(),
        idMotor: z.number().int().positive(),

        dimensiones: z.object({
            largo: z.number().int().positive(),
            alto: z.number().int().positive(),
            ancho: z.number().int().positive()
        }), 
    }),
});

export type CreatePublicacionDto = z.infer<typeof CreatePublicacionSchema>

export const FilterPublicacionesSchema = z.object({
  marcaId: z.coerce.number().int().positive().optional(),
  modeloId: z.coerce.number().int().positive().optional(),
  segmentoId: z.coerce.number().int().positive().optional(),
  anioMin: z.coerce.number().int().optional(),
  anioMax: z.coerce.number().int().optional(),
  precioMin: z.coerce.number().positive().optional(),
  precioMax: z.coerce.number().positive().optional(),
  
  // Ordenamiento 
  orden: z.enum(["relevantes", "precio_asc", "precio_desc"]).default("relevantes"),
  
  // Para filtrar por estado (exclusivo vendedores)
  estado: z.string().optional(),
});
export type FilterPublicacionesDto = z.infer<typeof FilterPublicacionesSchema>

// maquina de estados

export const CambiarEstadoSchema = z.object({
  nuevoEstado: z
    .enum(["disponible", "pausada", "finalizada", "eliminada"])
    .refine(() => true, {
      // Nota: refine evalúa el valor, pero como z.enum ya filtra las opciones,
      // solo usamos esto para inyectar tu mensaje personalizado si falla.
      message: "Estado inválido. Opciones: disponible, pausada, finalizada, eliminada",
    }),
});

export type CambiarEstadoDto = z.infer<typeof CambiarEstadoSchema>;