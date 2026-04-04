import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres({
  host: process.env.POSTGRES_HOST || "localhost",
  port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 5432,
  database: process.env.POSTGRES_DB || "hostmybash",
  username: process.env.POSTGRES_USER || "user",
  password: process.env.POSTGRES_PASSWORD || "password",
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
export type Database = typeof db;
