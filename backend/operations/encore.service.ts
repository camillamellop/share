import { Service } from "encore.dev/service";
import { SQLDatabase } from "encore.dev/storage/sqldb";

export default new Service("operations");

export const db = new SQLDatabase("operations", {
  migrations: "./migrations",
});
