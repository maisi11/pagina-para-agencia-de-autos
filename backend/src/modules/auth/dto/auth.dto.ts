import { z } from "zod";

export const LoginSchema = z.preprocess(
  (val: any) => {
    if (val && typeof val === "object") {
      return {
        ...val,
        contrasena: val.contrasena ?? val.password,
      };
    }
    return val;
  },
  z.object({
    email: z
      .string()
      .trim()
      .email("Debe ingresar un correo electrónico válido"),
    contrasena: z
      .string()
      .min(1, "La contraseña es obligatoria"),
  })
);

export type LoginDto = z.infer<typeof LoginSchema>;
