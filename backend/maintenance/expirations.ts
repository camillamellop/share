import { api, APIError } from "encore.dev/api";
import { db } from "./encore.service";

// ====================
// Interfaces
// ====================

export type CrewExpirationType = 'CHT' | 'IFR' | 'MLTE' | 'MNTE' | 'CMA';

export interface CrewExpiration {
  id: string;
  crew_member_id: string;
  crew_member_name: string;
  item_type: CrewExpirationType;
  expiration_date: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AircraftInspection {
  id: string;
  aircraft_id: string;
  aircraft_registration: string;
  inspection_type: string;
  last_inspection_date?: Date;
  last_inspection_hours?: number;
  next_due_date?: Date;
  next_due_hours?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCrewExpirationRequest {
  crew_member_id: string;
  crew_member_name: string;
  item_type: CrewExpirationType;
  expiration_date: Date;
  notes?: string;
}

export interface UpdateCrewExpirationRequest extends Partial<CreateCrewExpirationRequest> {
  id: string;
}

export interface CreateAircraftInspectionRequest {
  aircraft_id: string;
  aircraft_registration: string;
  inspection_type: string;
  last_inspection_date?: Date;
  last_inspection_hours?: number;
  next_due_date?: Date;
  next_due_hours?: number;
  notes?: string;
}

export interface UpdateAircraftInspectionRequest extends Partial<CreateAircraftInspectionRequest> {
  id: string;
}

export interface AllExpirationsResponse {
  crew_expirations: CrewExpiration[];
  aircraft_inspections: AircraftInspection[];
}

export interface DashboardAlert {
  id: string;
  type: 'crew' | 'aircraft';
  name: string;
  item_type: string;
  due_date: Date;
  days_remaining: number;
}

export interface DashboardAlertsResponse {
  alerts: DashboardAlert[];
  count: number;
}

// ====================
// Crew Expirations API
// ====================

export const createCrewExpiration = api<CreateCrewExpirationRequest, CrewExpiration>(
  { expose: true, method: "POST", path: "/maintenance/crew-expirations" },
  async (req) => {
    const id = `crew_exp_${Date.now()}`;
    const now = new Date();
    const expiration = await db.queryRow<CrewExpiration>`
      INSERT INTO crew_expirations (id, crew_member_id, crew_member_name, item_type, expiration_date, notes, created_at, updated_at)
      VALUES (${id}, ${req.crew_member_id}, ${req.crew_member_name}, ${req.item_type}, ${req.expiration_date}, ${req.notes}, ${now}, ${now})
      RETURNING *
    `;
    return expiration!;
  }
);

export const updateCrewExpiration = api<UpdateCrewExpirationRequest, CrewExpiration>(
  { expose: true, method: "PUT", path: "/maintenance/crew-expirations/:id" },
  async (req) => {
    const now = new Date();
    const expiration = await db.queryRow<CrewExpiration>`
      UPDATE crew_expirations
      SET crew_member_id = COALESCE(${req.crew_member_id}, crew_member_id),
          crew_member_name = COALESCE(${req.crew_member_name}, crew_member_name),
          item_type = COALESCE(${req.item_type}, item_type),
          expiration_date = COALESCE(${req.expiration_date}, expiration_date),
          notes = COALESCE(${req.notes}, notes),
          updated_at = ${now}
      WHERE id = ${req.id}
      RETURNING *
    `;
    if (!expiration) throw APIError.notFound("Crew expiration not found");
    return expiration;
  }
);

export const deleteCrewExpiration = api<{ id: string }, void>(
  { expose: true, method: "DELETE", path: "/maintenance/crew-expirations/:id" },
  async ({ id }) => {
    await db.exec`DELETE FROM crew_expirations WHERE id = ${id}`;
  }
);

// ========================
// Aircraft Inspections API
// ========================

export const createAircraftInspection = api<CreateAircraftInspectionRequest, AircraftInspection>(
  { expose: true, method: "POST", path: "/maintenance/aircraft-inspections" },
  async (req) => {
    const id = `ac_insp_${Date.now()}`;
    const now = new Date();
    const inspection = await db.queryRow<AircraftInspection>`
      INSERT INTO aircraft_inspections (
        id, aircraft_id, aircraft_registration, inspection_type, last_inspection_date, 
        last_inspection_hours, next_due_date, next_due_hours, notes, created_at, updated_at
      )
      VALUES (
        ${id}, ${req.aircraft_id}, ${req.aircraft_registration}, ${req.inspection_type}, 
        ${req.last_inspection_date}, ${req.last_inspection_hours}, ${req.next_due_date}, 
        ${req.next_due_hours}, ${req.notes}, ${now}, ${now}
      )
      RETURNING *
    `;
    return inspection!;
  }
);

export const updateAircraftInspection = api<UpdateAircraftInspectionRequest, AircraftInspection>(
  { expose: true, method: "PUT", path: "/maintenance/aircraft-inspections/:id" },
  async (req) => {
    const now = new Date();
    const inspection = await db.queryRow<AircraftInspection>`
      UPDATE aircraft_inspections
      SET aircraft_id = COALESCE(${req.aircraft_id}, aircraft_id),
          aircraft_registration = COALESCE(${req.aircraft_registration}, aircraft_registration),
          inspection_type = COALESCE(${req.inspection_type}, inspection_type),
          last_inspection_date = COALESCE(${req.last_inspection_date}, last_inspection_date),
          last_inspection_hours = COALESCE(${req.last_inspection_hours}, last_inspection_hours),
          next_due_date = COALESCE(${req.next_due_date}, next_due_date),
          next_due_hours = COALESCE(${req.next_due_hours}, next_due_hours),
          notes = COALESCE(${req.notes}, notes),
          updated_at = ${now}
      WHERE id = ${req.id}
      RETURNING *
    `;
    if (!inspection) throw APIError.notFound("Aircraft inspection not found");
    return inspection;
  }
);

export const deleteAircraftInspection = api<{ id: string }, void>(
  { expose: true, method: "DELETE", path: "/maintenance/aircraft-inspections/:id" },
  async ({ id }) => {
    await db.exec`DELETE FROM aircraft_inspections WHERE id = ${id}`;
  }
);

// ====================
// Combined APIs
// ====================

export const listAllExpirations = api<void, AllExpirationsResponse>(
  { expose: true, method: "GET", path: "/maintenance/expirations" },
  async () => {
    const crew_expirations = await db.queryAll<CrewExpiration>`
      SELECT * FROM crew_expirations ORDER BY expiration_date ASC
    `;
    const aircraft_inspections = await db.queryAll<AircraftInspection>`
      SELECT * FROM aircraft_inspections ORDER BY next_due_date ASC, next_due_hours ASC
    `;
    return { crew_expirations, aircraft_inspections };
  }
);

export const getDashboardAlerts = api<{ days?: number }, DashboardAlertsResponse>(
  { expose: true, method: "GET", path: "/maintenance/dashboard-alerts" },
  async ({ days = 30 }) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const crewExpirations = await db.queryAll<CrewExpiration>`
      SELECT * FROM crew_expirations
      WHERE expiration_date >= ${today} AND expiration_date <= ${futureDate}
    `;

    const aircraftInspections = await db.queryAll<AircraftInspection>`
      SELECT * FROM aircraft_inspections
      WHERE next_due_date >= ${today} AND next_due_date <= ${futureDate}
    `;

    const alerts: DashboardAlert[] = [];
    const oneDay = 24 * 60 * 60 * 1000;

    crewExpirations.forEach(exp => {
      alerts.push({
        id: exp.id,
        type: 'crew',
        name: exp.crew_member_name,
        item_type: exp.item_type,
        due_date: exp.expiration_date,
        days_remaining: Math.round((new Date(exp.expiration_date).getTime() - today.getTime()) / oneDay),
      });
    });

    aircraftInspections.forEach(insp => {
      if (insp.next_due_date) {
        alerts.push({
          id: insp.id,
          type: 'aircraft',
          name: insp.aircraft_registration,
          item_type: insp.inspection_type,
          due_date: insp.next_due_date,
          days_remaining: Math.round((new Date(insp.next_due_date).getTime() - today.getTime()) / oneDay),
        });
      }
    });

    alerts.sort((a, b) => a.days_remaining - b.days_remaining);

    return {
      alerts,
      count: alerts.length,
    };
  }
);
