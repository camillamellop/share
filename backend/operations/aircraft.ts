import { api } from "encore.dev/api";
import { db } from "./encore.service";

export interface Aircraft {
  id: string;
  registration: string;
  model: string;
  total_hours: number;
  consumption_per_hour?: number;
  status: "active" | "inactive" | "maintenance";
  created_at: Date;
  updated_at: Date;
}

export interface CreateAircraftRequest {
  registration: string;
  model: string;
  total_hours?: number;
  consumption_per_hour?: number;
  status?: "active" | "inactive" | "maintenance";
}

export interface UpdateAircraftRequest {
  id: string;
  registration?: string;
  model?: string;
  total_hours?: number;
  consumption_per_hour?: number;
  status?: "active" | "inactive" | "maintenance";
}

export interface AircraftResponse {
  aircraft: Aircraft[];
}

// Seed initial aircraft data
const initialAircraft = [
  { registration: "PR-MDL", model: "PA34220T", total_hours: 3299.7, status: "active", consumption_per_hour: 109.4 },
  { registration: "PS-AVE", model: "182T", total_hours: 408.5, status: "active", consumption_per_hour: 44.65 },
  { registration: "PT-OPC", model: "PAY2", total_hours: 7086.1, status: "active", consumption_per_hour: 258.8 },
  { registration: "PT-WSR", model: "PA34220T", total_hours: 4565.5, status: "active", consumption_per_hour: 107.6 },
  { registration: "PT-TOR", model: "PA-46R-350T", total_hours: 2721.9, status: "active", consumption_per_hour: 150 },
  { registration: "PT-OJG", model: "PA-34-220T", total_hours: 64.8, status: "active", consumption_per_hour: 109.4 },
  { registration: "PT-RVJ", model: "EMB-810D", total_hours: 7775.8, status: "active", consumption_per_hour: 107.3 },
  { registration: "PP-JCP", model: "MU-300", total_hours: 4490.7, status: "active", consumption_per_hour: 705 },
  { registration: "PT-JPK", model: "PA-28", total_hours: 1559.3, status: "active", consumption_per_hour: 37.99 },
];

async function seedAircraft() {
  for (const ac of initialAircraft) {
    const id = `aircraft_${ac.registration}`;
    const now = new Date();
    await db.exec`
      INSERT INTO aircrafts (id, registration, model, total_hours, status, consumption_per_hour, created_at, updated_at)
      VALUES (${id}, ${ac.registration}, ${ac.model}, ${ac.total_hours}, ${ac.status}, ${ac.consumption_per_hour}, ${now}, ${now})
      ON CONFLICT (registration) DO NOTHING
    `;
  }
}

// Retrieves all aircraft.
export const getAircrafts = api<void, AircraftResponse>(
  { expose: true, method: "GET", path: "/aircrafts" },
  async () => {
    const countResult = await db.queryRow<{ count: string }>`SELECT COUNT(*) as count FROM aircrafts`;
    if (countResult && parseInt(countResult.count) === 0) {
      await seedAircraft();
    }
    
    const aircraft = await db.queryAll<Aircraft>`
      SELECT * FROM aircrafts ORDER BY registration ASC
    `;
    return { aircraft };
  }
);

// Creates a new aircraft.
export const createAircraft = api<CreateAircraftRequest, Aircraft>(
  { expose: true, method: "POST", path: "/aircrafts" },
  async (req) => {
    const id = `aircraft_${req.registration}`;
    const now = new Date();

    const aircraft = await db.queryRow<Aircraft>`
      INSERT INTO aircrafts (id, registration, model, total_hours, consumption_per_hour, status, created_at, updated_at)
      VALUES (${id}, ${req.registration}, ${req.model}, ${req.total_hours || 0}, ${req.consumption_per_hour}, ${req.status || 'active'}, ${now}, ${now})
      RETURNING *
    `;
    return aircraft!;
  }
);

// Updates an existing aircraft.
export const updateAircraft = api<UpdateAircraftRequest, Aircraft>(
  { expose: true, method: "PUT", path: "/aircrafts/:id" },
  async (req) => {
    const now = new Date();
    const aircraft = await db.queryRow<Aircraft>`
      UPDATE aircrafts
      SET registration = COALESCE(${req.registration}, registration),
          model = COALESCE(${req.model}, model),
          total_hours = COALESCE(${req.total_hours}, total_hours),
          consumption_per_hour = COALESCE(${req.consumption_per_hour}, consumption_per_hour),
          status = COALESCE(${req.status}, status),
          updated_at = ${now}
      WHERE id = ${req.id}
      RETURNING *
    `;
    if (!aircraft) throw new Error("Aircraft not found");
    return aircraft;
  }
);

// Deletes an aircraft.
export const deleteAircraft = api<{ id: string }, void>(
  { expose: true, method: "DELETE", path: "/aircrafts/:id" },
  async (req) => {
    await db.exec`DELETE FROM aircrafts WHERE id = ${req.id}`;
  }
);
