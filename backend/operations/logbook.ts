import { api, APIError } from "encore.dev/api";
import { db } from "./encore.service";

export interface MonthlySummary {
  total_allowance: number;
  crew_hours: CrewHoursSummary[];
}

export interface CrewHoursSummary {
  crew_name: string;
  pic_hours: number;
  sic_hours: number;
  total_hours: number;
}

export interface Logbook {
  id: string;
  aircraft_id: string;
  aircraft_registration: string;
  aircraft_model: string;
  aircraft_consumption: number;
  month: number;
  year: number;
  previous_hours: number;
  current_hours: number;
  revision_hours: number;
  entries: LogbookEntry[];
  monthly_summary: MonthlySummary;
}

export interface LogbookEntry {
  id: string;
  logbook_id: string;
  date: Date;
  from_airport: string;
  to_airport: string;
  time_activated: string;
  time_departure: string;
  time_arrival: string;
  time_shutdown: string;
  flight_time_total: number;
  flight_time_day: number;
  flight_time_night: number;
  ifr_hours: number;
  landings: number;
  fuel_added: number;
  fuel_on_arrival: number;
  cell_hours: number;
  pic_hours: number;
  sic_hours: number;
  pic_name: string;
  pic_anac?: string;
  sic_name: string;
  sic_anac?: string;
  daily_allowance: number;
  created_at: Date;
}

export interface CreateLogbookEntryRequest {
  logbook_id: string;
  date: Date;
  from_airport: string;
  to_airport: string;
  time_activated: string;
  time_departure: string;
  time_arrival: string;
  time_shutdown: string;
  flight_time_total: number;
  flight_time_day: number;
  flight_time_night: number;
  ifr_hours: number;
  landings: number;
  fuel_added: number;
  fuel_on_arrival: number;
  pic_hours: number;
  sic_hours: number;
  pic_name: string;
  sic_name: string;
}

export interface LogbookResponse {
  logbook: Logbook;
}

async function seedLogbookEntries(logbook_id: string) {
  const entries = [
    {
      date: new Date('2025-06-06T23:52:00Z'), from_airport: 'SBNV', to_airport: 'SBCY', time_activated: '20:52', time_departure: '21:05', time_arrival: '23:33', time_shutdown: '23:35', flight_time_total: 2.47, flight_time_day: 0.47, flight_time_night: 2.0, ifr_hours: 1, landings: 1, fuel_added: 413, fuel_on_arrival: 462, pic_hours: 2.47, sic_hours: 0, pic_name: 'ROLFFE DE LIMA ERBE', sic_name: ''
    },
    {
      date: new Date('2025-06-07T13:21:00Z'), from_airport: 'SBCY', to_airport: 'SSQM', time_activated: '10:21', time_departure: '10:30', time_arrival: '11:37', time_shutdown: '11:38', flight_time_total: 1.12, flight_time_day: 1.12, flight_time_night: 0, ifr_hours: 1, landings: 1, fuel_added: 306, fuel_on_arrival: 462, pic_hours: 1.12, sic_hours: 0, pic_name: 'RODRIGO DE MORAES TOSCANO', sic_name: ''
    }
  ];

  let current_hours = 3280.5;
  for (const entryData of entries) {
    const id = `entry_${entryData.from_airport}_${entryData.to_airport}_${entryData.date.getTime()}`;
    current_hours += entryData.flight_time_total;
    
    let daily_allowance = 0;
    if (logbook_id.includes('PR-MDL')) {
      daily_allowance = 445.00;
    } else if (logbook_id.includes('PT-TOR') && entryData.to_airport === 'SWJN') {
      daily_allowance = 445.00;
    }

    await db.exec`
      INSERT INTO logbook_entries (
        id, logbook_id, date, from_airport, to_airport, time_activated, time_departure,
        time_arrival, time_shutdown, flight_time_total, flight_time_day, flight_time_night,
        ifr_hours, landings, fuel_added, fuel_on_arrival, cell_hours, pic_hours, sic_hours,
        pic_name, sic_name, daily_allowance, created_at
      )
      VALUES (
        ${id}, ${logbook_id}, ${entryData.date}, ${entryData.from_airport}, ${entryData.to_airport},
        ${entryData.time_activated}, ${entryData.time_departure}, ${entryData.time_arrival}, ${entryData.time_shutdown},
        ${entryData.flight_time_total}, ${entryData.flight_time_day}, ${entryData.flight_time_night},
        ${entryData.ifr_hours}, ${entryData.landings}, ${entryData.fuel_added}, ${entryData.fuel_on_arrival},
        ${current_hours}, ${entryData.pic_hours}, ${entryData.sic_hours}, ${entryData.pic_name}, ${entryData.sic_name},
        ${daily_allowance}, ${new Date()}
      ) ON CONFLICT (id) DO NOTHING
    `;
  }
}

// Retrieves or creates a logbook for a specific aircraft and period.
export const getLogbook = api<{ aircraft_id: string; month: number; year: number }, LogbookResponse>(
  { expose: true, method: "GET", path: "/logbook" },
  async (req) => {
    const aircraft = await db.queryRow<{ registration: string, model: string, consumption_per_hour: number }>`
      SELECT registration, model, consumption_per_hour FROM aircrafts WHERE registration = ${req.aircraft_id}
    `;
    if (!aircraft) {
      throw APIError.notFound("Aircraft not found");
    }

    let logbook = await db.queryRow<any>`
      SELECT * FROM logbooks 
      WHERE aircraft_id = ${req.aircraft_id} AND month = ${req.month} AND year = ${req.year}
    `;

    if (!logbook) {
      const prevMonth = req.month === 1 ? 12 : req.month - 1;
      const prevYear = req.month === 1 ? req.year - 1 : req.year;
      const prevLogbook = await db.queryRow<{ current_hours: number }>`
        SELECT current_hours FROM logbooks 
        WHERE aircraft_id = ${req.aircraft_id} AND month = ${prevMonth} AND year = ${prevYear}
      `;
      
      const aircraftData = await db.queryRow<{ total_hours: number }>`
        SELECT total_hours FROM aircrafts WHERE registration = ${req.aircraft_id}
      `;
      
      const previous_hours = prevLogbook?.current_hours || aircraftData?.total_hours || 0;
      const id = `logbook_${req.aircraft_id}_${req.year}_${req.month}`;

      logbook = await db.queryRow<any>`
        INSERT INTO logbooks (id, aircraft_id, month, year, previous_hours, current_hours, revision_hours)
        VALUES (${id}, ${req.aircraft_id}, ${req.month}, ${req.year}, ${previous_hours}, ${previous_hours}, ${previous_hours + 100})
        RETURNING *
      `;

      if (req.aircraft_id === 'PR-MDL' && req.year === 2025 && req.month === 6) {
        await seedLogbookEntries(logbook!.id);
      }
    }

    const entries = await db.queryAll<any>`
      SELECT 
        le.*,
        pic.anac_license as pic_anac,
        sic.anac_license as sic_anac
      FROM logbook_entries le
      LEFT JOIN crew_members pic ON le.pic_name = pic.name
      LEFT JOIN crew_members sic ON le.sic_name = sic.name
      WHERE le.logbook_id = ${logbook!.id} 
      ORDER BY le.date ASC, le.time_departure ASC
    `;

    const totalHoursThisMonth = entries.reduce((sum, entry) => sum + entry.flight_time_total, 0);
    logbook.current_hours = logbook.previous_hours + totalHoursThisMonth;

    const crewHours: { [key: string]: { pic_hours: number, sic_hours: number } } = {};
    let totalAllowance = 0;

    for (const entry of entries) {
      totalAllowance += entry.daily_allowance;
      
      if (entry.pic_name) {
        if (!crewHours[entry.pic_name]) crewHours[entry.pic_name] = { pic_hours: 0, sic_hours: 0 };
        crewHours[entry.pic_name].pic_hours += entry.pic_hours;
      }
      
      if (entry.sic_name) {
        if (!crewHours[entry.sic_name]) crewHours[entry.sic_name] = { pic_hours: 0, sic_hours: 0 };
        crewHours[entry.sic_name].sic_hours += entry.sic_hours;
      }
    }

    const monthly_summary: MonthlySummary = {
      total_allowance: totalAllowance,
      crew_hours: Object.entries(crewHours).map(([name, hours]) => ({
        crew_name: name,
        pic_hours: hours.pic_hours,
        sic_hours: hours.sic_hours,
        total_hours: hours.pic_hours + hours.sic_hours,
      })).sort((a, b) => b.total_hours - a.total_hours),
    };

    const finalLogbook: Logbook = {
      ...logbook,
      aircraft_registration: aircraft.registration,
      aircraft_model: aircraft.model,
      aircraft_consumption: aircraft.consumption_per_hour || 0,
      entries,
      monthly_summary,
    };

    return { logbook: finalLogbook };
  }
);

// Creates a new logbook entry.
export const createLogbookEntry = api<CreateLogbookEntryRequest, LogbookEntry>(
  { expose: true, method: "POST", path: "/logbook/entries" },
  async (req) => {
    const id = `entry_${Date.now()}`;
    const now = new Date();

    const logbook = await db.queryRow<{ aircraft_id: string, current_hours: number }>`SELECT aircraft_id, current_hours FROM logbooks WHERE id = ${req.logbook_id}`;
    if (!logbook) throw APIError.notFound("Logbook not found");

    let daily_allowance = 0;
    if (logbook.aircraft_id === 'PR-MDL') {
      daily_allowance = 445.00;
    } else if (logbook.aircraft_id === 'PT-TOR' && req.to_airport === 'SWJN') {
      daily_allowance = 445.00;
    }

    const cell_hours = logbook.current_hours + req.flight_time_total;

    const entry = await db.queryRow<LogbookEntry>`
      INSERT INTO logbook_entries (
        id, logbook_id, date, from_airport, to_airport, time_activated, time_departure,
        time_arrival, time_shutdown, flight_time_total, flight_time_day, flight_time_night,
        ifr_hours, landings, fuel_added, fuel_on_arrival, cell_hours, pic_hours, sic_hours,
        pic_name, sic_name, daily_allowance, created_at
      )
      VALUES (
        ${id}, ${req.logbook_id}, ${req.date}, ${req.from_airport}, ${req.to_airport},
        ${req.time_activated}, ${req.time_departure}, ${req.time_arrival}, ${req.time_shutdown},
        ${req.flight_time_total}, ${req.flight_time_day}, ${req.flight_time_night},
        ${req.ifr_hours}, ${req.landings}, ${req.fuel_added}, ${req.fuel_on_arrival},
        ${cell_hours}, ${req.pic_hours}, ${req.sic_hours}, ${req.pic_name || ''}, ${req.sic_name || ''},
        ${daily_allowance}, ${now}
      )
      RETURNING *
    `;

    await db.exec`
      UPDATE logbooks
      SET current_hours = ${cell_hours}
      WHERE id = ${req.logbook_id}
    `;

    return entry!;
  }
);

// Deletes a logbook entry.
export const deleteLogbookEntry = api<{ id: string }, void>(
  { expose: true, method: "DELETE", path: "/logbook/entries/:id" },
  async (req) => {
    const entry = await db.queryRow<LogbookEntry>`SELECT * FROM logbook_entries WHERE id = ${req.id}`;
    if (entry) {
      await db.exec`
        UPDATE logbooks
        SET current_hours = current_hours - ${entry.flight_time_total}
        WHERE id = ${entry.logbook_id}
      `;
      await db.exec`DELETE FROM logbook_entries WHERE id = ${req.id}`;
    }
  }
);
