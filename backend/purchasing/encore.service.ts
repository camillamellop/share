import { Service } from "encore.dev/service";
import { SQLDatabase } from "encore.dev/storage/sqldb";

export default new Service("purchasing");

// Define the database
export const db = new SQLDatabase("purchasing", {
  migrations: "./migrations",
});
