import { api } from "encore.dev/api";
import { db } from "./encore.service";

export interface CrewReportEntry {
  crew_name: string;
  aircraft_hours: { [aircraft_id: string]: number };
  total_hours: number;
}

export interface CrewMonthlyReportResponse {
  report: CrewReportEntry[];
}

// Retrieves a monthly report of hours flown by each crew member across all aircraft.
export const getCrewMonthlyReport = api<{ month: number; year: number }, CrewMonthlyReportResponse>(
  { expose: true, method: "GET", path: "/reports/crew-monthly" },
  async (req) => {
    const entries = await db.queryAll<any>`
      SELECT le.pic_name, le.sic_name, le.pic_hours, le.sic_hours, l.aircraft_id
      FROM logbook_entries le
      JOIN logbooks l ON le.logbook_id = l.id
      WHERE l.month = ${req.month} AND l.year = ${req.year}
    `;

    const crewData: { [crew_name: string]: { aircraft_hours: { [aircraft_id: string]: number }, total_hours: number } } = {};

    for (const entry of entries) {
      if (entry.pic_name && entry.pic_hours > 0) {
        if (!crewData[entry.pic_name]) {
          crewData[entry.pic_name] = { aircraft_hours: {}, total_hours: 0 };
        }
        crewData[entry.pic_name].aircraft_hours[entry.aircraft_id] = (crewData[entry.pic_name].aircraft_hours[entry.aircraft_id] || 0) + entry.pic_hours;
        crewData[entry.pic_name].total_hours += entry.pic_hours;
      }

      if (entry.sic_name && entry.sic_hours > 0) {
        if (!crewData[entry.sic_name]) {
          crewData[entry.sic_name] = { aircraft_hours: {}, total_hours: 0 };
        }
        crewData[entry.sic_name].aircraft_hours[entry.aircraft_id] = (crewData[entry.sic_name].aircraft_hours[entry.aircraft_id] || 0) + entry.sic_hours;
        crewData[entry.sic_name].total_hours += entry.sic_hours;
      }
    }

    const report: CrewReportEntry[] = Object.entries(crewData).map(([name, data]) => ({
      crew_name: name,
      aircraft_hours: data.aircraft_hours,
      total_hours: data.total_hours,
    })).sort((a, b) => b.total_hours - a.total_hours);

    return { report };
  }
);
