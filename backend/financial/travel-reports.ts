import { api } from "encore.dev/api";
import { db } from "./encore.service";
import { getAuthData } from "~encore/auth";

export interface TravelExpense {
  categoria: string;
  descricao: string;
  valor: number;
  pago_por: string;
}

export interface TravelReport {
  id: string;
  numero_relatorio: string;
  cotista: string;
  aeronave: string;
  tripulante: string;
  destino: string;
  data_inicio: Date;
  data_fim: Date;
  despesas: TravelExpense[];
  valor_total: number;
  observacoes: string;
  created_at: Date;
  created_by_id: string;
  created_by_name: string;
  updated_at?: Date;
}

export interface CreateTravelReportRequest {
  cotista: string;
  aeronave: string;
  tripulante: string;
  destino: string;
  data_inicio: Date;
  data_fim: Date;
  despesas: TravelExpense[];
  observacoes?: string;
}

export interface TravelReportsResponse {
  reports: TravelReport[];
}

// Creates a new travel report.
export const createTravelReport = api<CreateTravelReportRequest, TravelReport>(
  { auth: true, expose: true, method: "POST", path: "/travel-reports" },
  async (req) => {
    const auth = getAuthData()!;
    const id = `report_${Date.now()}`;
    const numero_relatorio = `REL-${Date.now()}`;
    const now = new Date();
    const valor_total = req.despesas.reduce((sum, d) => sum + d.valor, 0);

    const report = await db.queryRow<TravelReport>`
      INSERT INTO travel_reports (
        id, numero_relatorio, cotista, aeronave, tripulante, destino,
        data_inicio, data_fim, despesas, valor_total, observacoes, created_at,
        created_by_id, created_by_name, updated_at
      )
      VALUES (
        ${id}, ${numero_relatorio}, ${req.cotista}, ${req.aeronave}, 
        ${req.tripulante}, ${req.destino}, ${req.data_inicio}, ${req.data_fim},
        ${JSON.stringify(req.despesas)}, ${valor_total}, ${req.observacoes || ''}, ${now},
        ${auth.userID}, ${auth.name}, ${now}
      )
      RETURNING *
    `;

    // Add financial transaction entry
    const transactionId = `ft_${report!.id}`;
    const transactionDescription = `Reembolso Viagem - ${req.tripulante} - ${req.destino}`;
    await db.exec`
      INSERT INTO financial_transactions (
        id, source_id, source_type, description, type, status, party_name, amount, transaction_date, created_at, updated_at
      )
      VALUES (
        ${transactionId}, ${report!.id}, 'travel_report', ${transactionDescription},
        'reimbursement', 'awaiting_billing', ${req.cotista}, ${valor_total}, ${req.data_fim}, ${now}, ${now}
      )
    `;

    // Parse the JSON back to object for response
    const result = { ...report!, despesas: JSON.parse(report!.despesas as any) };
    return result;
  }
);

// Retrieves all travel reports.
export const getTravelReports = api<void, TravelReportsResponse>(
  { auth: true, expose: true, method: "GET", path: "/travel-reports" },
  async () => {
    const reports = await db.queryAll<any>`
      SELECT * FROM travel_reports ORDER BY created_at DESC
    `;
    
    // Parse JSON despesas for each report
    const parsedReports = reports.map(report => ({
      ...report,
      despesas: JSON.parse(report.despesas)
    }));

    return { reports: parsedReports };
  }
);
