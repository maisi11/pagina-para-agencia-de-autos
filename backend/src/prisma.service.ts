import { Injectable, type OnModuleInit } from "@nestjs/common";
import { db, connectDatabase } from "./prisma/db";
import { listUsers, type StarterUser } from "./prisma/users";

@Injectable()
export class PrismaService implements OnModuleInit {
  readonly db = db;

  async onModuleInit() {
    await connectDatabase();
    console.log("Database connected successfully to PostgreSQL");
  }

  listUsers(limit = 10): Promise<StarterUser[]> {
    return listUsers(limit);
  }
}
