import { Service } from "encore.dev/service";
import { SQLDatabase } from "encore.dev/storage/sqldb";

export default new Service("agenda");

export const db = new SQLDatabase("agenda", {
  migrations: "./migrations",
});
