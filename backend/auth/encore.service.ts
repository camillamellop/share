import { Service } from "encore.dev/service";
import { SQLDatabase } from "encore.dev/storage/sqldb";

export default new Service("auth");

export const db = new SQLDatabase("auth", {
  migrations: "./migrations",
});
