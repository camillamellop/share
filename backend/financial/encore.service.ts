import { Service } from "encore.dev/service";
import { SQLDatabase } from "encore.dev/storage/sqldb";

export default new Service("financial");

export const db = new SQLDatabase("financial", {
  migrations: "./migrations",
});
