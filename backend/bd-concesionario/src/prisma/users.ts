import { db } from "./db.ts";
import { seed } from "./seed.ts";

export { db };

export async function listUsers(limit = 10) {
  await seed();
  const users = await db.orm.public.Usuario.select("idUsuario", "email", "nombre").limit(limit).all();

  return users.map((user) => ({
    id: String(user.idUsuario),
    email: user.email,
    nombre: user.nombre,
  }));
}

export type StarterUser = Awaited<ReturnType<typeof listUsers>>[number];
