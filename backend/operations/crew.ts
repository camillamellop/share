import { api } from "encore.dev/api";
import { db } from "./encore.service";

export interface CrewMember {
  id: string;
  user_id: string;
  name: string;
  cpf: string;
  department: string;
  position: string;
  anac_license?: string;
  is_pilot: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCrewMemberRequest {
  name: string;
  cpf: string;
  department: string;
  position: string;
  anac_license?: string;
  is_pilot?: boolean;
  is_active?: boolean;
}

export interface UpdateCrewMemberRequest {
  id: string;
  name?: string;
  cpf?: string;
  department?: string;
  position?: string;
  anac_license?: string;
  is_pilot?: boolean;
  is_active?: boolean;
}

export interface CrewMembersResponse {
  crew_members: CrewMember[];
}

export interface PilotsResponse {
  pilots: CrewMember[];
}

export interface InternalCreateCrewMemberRequest {
  user_id: string;
  name: string;
  cpf: string;
  department: string;
  position: string;
  anac_license?: string;
}

// internalCreateCrewMember creates a crew member record from another service.
export const internalCreateCrewMember = api<InternalCreateCrewMemberRequest, CrewMember>(
  { expose: false, method: "POST", path: "/internal/crew" },
  async (req) => {
    const id = `crew_${req.user_id}`;
    const now = new Date();
    const crew_member = await db.queryRow<CrewMember>`
      INSERT INTO crew_members (id, user_id, name, cpf, department, position, anac_license, is_pilot, is_active, created_at, updated_at)
      VALUES (${id}, ${req.user_id}, ${req.name}, ${req.cpf}, ${req.department}, ${req.position}, ${req.anac_license || null}, true, true, ${now}, ${now})
      ON CONFLICT (user_id) DO NOTHING
      RETURNING *
    `;
    return crew_member!;
  }
);

// Retrieves all crew members.
export const getCrewMembers = api<void, CrewMembersResponse>(
  { auth: true, expose: true, method: "GET", path: "/crew" },
  async () => {
    const crew_members = await db.queryAll<CrewMember>`
      SELECT * FROM crew_members ORDER BY name ASC
    `;
    return { crew_members };
  }
);

// Retrieves only pilots.
export const getPilots = api<void, PilotsResponse>(
  { auth: true, expose: true, method: "GET", path: "/crew/pilots" },
  async () => {
    const pilots = await db.queryAll<CrewMember>`
      SELECT * FROM crew_members WHERE is_pilot = true AND is_active = true ORDER BY name ASC
    `;
    return { pilots };
  }
);

// Creates a new crew member.
export const createCrewMember = api<CreateCrewMemberRequest, CrewMember>(
  { auth: true, expose: true, method: "POST", path: "/crew" },
  async (req) => {
    const id = `crew_${Date.now()}`;
    const now = new Date();

    const crew_member = await db.queryRow<CrewMember>`
      INSERT INTO crew_members (id, name, cpf, department, position, anac_license, is_pilot, is_active, created_at, updated_at)
      VALUES (${id}, ${req.name}, ${req.cpf}, ${req.department}, ${req.position}, ${req.anac_license || null}, ${req.is_pilot || false}, ${req.is_active !== false}, ${now}, ${now})
      RETURNING *
    `;
    return crew_member!;
  }
);

// Updates an existing crew member.
export const updateCrewMember = api<UpdateCrewMemberRequest, CrewMember>(
  { auth: true, expose: true, method: "PUT", path: "/crew/:id" },
  async (req) => {
    const now = new Date();
    const crew_member = await db.queryRow<CrewMember>`
      UPDATE crew_members
      SET name = COALESCE(${req.name}, name),
          cpf = COALESCE(${req.cpf}, cpf),
          department = COALESCE(${req.department}, department),
          position = COALESCE(${req.position}, position),
          anac_license = COALESCE(${req.anac_license}, anac_license),
          is_pilot = COALESCE(${req.is_pilot}, is_pilot),
          is_active = COALESCE(${req.is_active}, is_active),
          updated_at = ${now}
      WHERE id = ${req.id}
      RETURNING *
    `;
    if (!crew_member) throw new Error("Crew member not found");
    return crew_member;
  }
);

// Deletes a crew member.
export const deleteCrewMember = api<{ id: string }, void>(
  { auth: true, expose: true, method: "DELETE", path: "/crew/:id" },
  async (req) => {
    await db.exec`DELETE FROM crew_members WHERE id = ${req.id}`;
  }
);
