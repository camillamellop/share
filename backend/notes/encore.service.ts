import { Service } from "encore.dev/service";
import { SQLDatabase } from "encore.dev/storage/sqldb";

export default new Service("notes");

export const db = new SQLDatabase("notes", {
  migrations: "./migrations",
});
