import { Service } from "encore.dev/service";
import { SQLDatabase } from "encore.dev/storage/sqldb";

export default new Service("profile");

export const db = new SQLDatabase("profile", {
  migrations: "./migrations",
});
