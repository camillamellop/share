import { Service } from "encore.dev/service";
import { SQLDatabase } from "encore.dev/storage/sqldb";

export default new Service("communications");

export const db = new SQLDatabase("communications", {
  migrations: "./migrations",
});
