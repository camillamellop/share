import { api } from "encore.dev/api";
import { db } from "./encore.service";

export interface FlightSchedule {
  id: string;
  aeronave: string;
  data: Date;
  horario: string;
  nome_cliente: string;
  destino: string;
  origem: string;
  passageiros: number;
  tripulacao: string;
  observacoes: string;
  status: "pendente" | "confirmado" | "realizado" | "cancelado";
  tipo_voo: "executivo" | "treinamento" | "manutencao";
  duracao_estimada: string;
  contato_cliente: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateFlightScheduleRequest {
  aeronave: string;
  data: Date;
  horario: string;
  nome_cliente: string;
  destino: string;
  origem: string;
  passageiros: number;
  tripulacao: string;
  observacoes?: string;
  status?: "pendente" | "confirmado" | "realizado" | "cancelado";
  tipo_voo: "executivo" | "treinamento" | "manutencao";
  duracao_estimada: string;
  contato_cliente: string;
}

export interface UpdateFlightScheduleRequest {
  id: string;
  aeronave?: string;
  data?: Date;
  horario?: string;
  nome_cliente?: string;
  destino?: string;
  origem?: string;
  passageiros?: number;
  tripulacao?: string;
  observacoes?: string;
  status?: "pendente" | "confirmado" | "realizado" | "cancelado";
  tipo_voo?: "executivo" | "treinamento" | "manutencao";
  duracao_estimada?: string;
  contato_cliente?: string;
}

export interface FlightSchedulesResponse {
  schedules: FlightSchedule[];
}

export interface FlightScheduleStatsResponse {
  total: number;
  pendente: number;
  confirmado: number;
  realizado: number;
  cancelado: number;
  por_aeronave: { [key: string]: number };
  por_tipo: { [key: string]: number };
}

// Creates a new flight schedule.
export const createFlightSchedule = api<CreateFlightScheduleRequest, FlightSchedule>(
  { expose: true, method: "POST", path: "/flight-schedules" },
  async (req) => {
    const id = `schedule_${Date.now()}`;
    const now = new Date();

    const schedule = await db.queryRow<FlightSchedule>`
      INSERT INTO flight_schedules (
        id, aeronave, data, horario, nome_cliente, destino, origem, 
        passageiros, tripulacao, observacoes, status, tipo_voo, 
        duracao_estimada, contato_cliente, created_at, updated_at
      )
      VALUES (
        ${id}, ${req.aeronave}, ${req.data}, ${req.horario}, ${req.nome_cliente}, 
        ${req.destino}, ${req.origem}, ${req.passageiros}, ${req.tripulacao}, 
        ${req.observacoes || ''}, ${req.status || 'pendente'}, ${req.tipo_voo}, 
        ${req.duracao_estimada}, ${req.contato_cliente}, ${now}, ${now}
      )
      RETURNING *
    `;

    return schedule!;
  }
);

// Updates an existing flight schedule.
export const updateFlightSchedule = api<UpdateFlightScheduleRequest, FlightSchedule>(
  { expose: true, method: "PUT", path: "/flight-schedules/:id" },
  async (req) => {
    const now = new Date();

    const schedule = await db.queryRow<FlightSchedule>`
      UPDATE flight_schedules 
      SET aeronave = COALESCE(${req.aeronave}, aeronave),
          data = COALESCE(${req.data}, data),
          horario = COALESCE(${req.horario}, horario),
          nome_cliente = COALESCE(${req.nome_cliente}, nome_cliente),
          destino = COALESCE(${req.destino}, destino),
          origem = COALESCE(${req.origem}, origem),
          passageiros = COALESCE(${req.passageiros}, passageiros),
          tripulacao = COALESCE(${req.tripulacao}, tripulacao),
          observacoes = COALESCE(${req.observacoes}, observacoes),
          status = COALESCE(${req.status}, status),
          tipo_voo = COALESCE(${req.tipo_voo}, tipo_voo),
          duracao_estimada = COALESCE(${req.duracao_estimada}, duracao_estimada),
          contato_cliente = COALESCE(${req.contato_cliente}, contato_cliente),
          updated_at = ${now}
      WHERE id = ${req.id}
      RETURNING *
    `;

    if (!schedule) {
      throw new Error("Flight schedule not found");
    }

    return schedule;
  }
);

// Retrieves all flight schedules.
export const getFlightSchedules = api<void, FlightSchedulesResponse>(
  { expose: true, method: "GET", path: "/flight-schedules" },
  async () => {
    const schedules = await db.queryAll<FlightSchedule>`
      SELECT * FROM flight_schedules ORDER BY data DESC, horario ASC
    `;
    return { schedules };
  }
);

// Retrieves flight schedules by date range.
export const getFlightSchedulesByDateRange = api<{ start_date: Date; end_date: Date }, FlightSchedulesResponse>(
  { expose: true, method: "GET", path: "/flight-schedules/date-range" },
  async (req) => {
    const schedules = await db.queryAll<FlightSchedule>`
      SELECT * FROM flight_schedules 
      WHERE data >= ${req.start_date} AND data <= ${req.end_date}
      ORDER BY data ASC, horario ASC
    `;
    return { schedules };
  }
);

// Retrieves flight schedules by aircraft.
export const getFlightSchedulesByAircraft = api<{ aeronave: string }, FlightSchedulesResponse>(
  { expose: true, method: "GET", path: "/flight-schedules/aircraft/:aeronave" },
  async (req) => {
    const schedules = await db.queryAll<FlightSchedule>`
      SELECT * FROM flight_schedules 
      WHERE aeronave = ${req.aeronave}
      ORDER BY data DESC, horario ASC
    `;
    return { schedules };
  }
);

// Retrieves flight schedule statistics.
export const getFlightScheduleStats = api<{ month?: number; year?: number }, FlightScheduleStatsResponse>(
  { expose: true, method: "GET", path: "/flight-schedules/stats" },
  async (req) => {
    let whereClause = "";
    if (req.month && req.year) {
      whereClause = `WHERE EXTRACT(MONTH FROM data) = ${req.month} AND EXTRACT(YEAR FROM data) = ${req.year}`;
    } else if (req.year) {
      whereClause = `WHERE EXTRACT(YEAR FROM data) = ${req.year}`;
    }

    const totalResult = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM flight_schedules ${whereClause}
    `;

    const statusStats = await db.queryAll<{ status: string; count: number }>`
      SELECT status, COUNT(*) as count 
      FROM flight_schedules ${whereClause}
      GROUP BY status
    `;

    const aircraftStats = await db.queryAll<{ aeronave: string; count: number }>`
      SELECT aeronave, COUNT(*) as count 
      FROM flight_schedules ${whereClause}
      GROUP BY aeronave
    `;

    const typeStats = await db.queryAll<{ tipo_voo: string; count: number }>`
      SELECT tipo_voo, COUNT(*) as count 
      FROM flight_schedules ${whereClause}
      GROUP BY tipo_voo
    `;

    const stats: FlightScheduleStatsResponse = {
      total: totalResult?.count || 0,
      pendente: 0,
      confirmado: 0,
      realizado: 0,
      cancelado: 0,
      por_aeronave: {},
      por_tipo: {}
    };

    statusStats.forEach(stat => {
      stats[stat.status as keyof typeof stats] = stat.count;
    });

    aircraftStats.forEach(stat => {
      stats.por_aeronave[stat.aeronave] = stat.count;
    });

    typeStats.forEach(stat => {
      stats.por_tipo[stat.tipo_voo] = stat.count;
    });

    return stats;
  }
);

// Deletes a flight schedule.
export const deleteFlightSchedule = api<{ id: string }, void>(
  { expose: true, method: "DELETE", path: "/flight-schedules/:id" },
  async (req) => {
    await db.exec`DELETE FROM flight_schedules WHERE id = ${req.id}`;
  }
);
