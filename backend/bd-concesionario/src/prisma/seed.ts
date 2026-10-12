import { connectDatabase, db } from "./db.ts";

const users = [
  { email: "alice@concesionaria.com", nombre: "Alice", contrasena: "123456" },
  { email: "bob@concesionaria.com", nombre: "Bob", contrasena: "123456" },
  { email: "carol@concesionaria.com", nombre: "Carol", contrasena: "123456" },
];

let pendingSeed: Promise<void> | undefined;

async function runSeed(): Promise<void> {
  await connectDatabase();

  for (const user of users) {
    await db.orm.public.Usuario.upsert({
      create: user,
      update: {},
      conflictOn: { email: user.email },
    });
  }
}

export function seed(): Promise<void> {
  pendingSeed ??= runSeed().catch((error: unknown) => {
    pendingSeed = undefined;
    throw error;
  });
  return pendingSeed;
}
