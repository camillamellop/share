import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const operationsDB = SQLDatabase.named("operations");
const agendaDB = SQLDatabase.named("agenda");
const financialDB = SQLDatabase.named("financial");

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'Agendamento' | 'Plano de Voo' | 'Tripulante' | 'Contato' | 'Cliente' | 'Recibo' | 'Relatório' | 'Cobrança' | 'Documento';
  path: string;
}

export interface GlobalSearchResponse {
  results: SearchResult[];
}

export const globalSearch = api<{ query: string }, GlobalSearchResponse>(
  { expose: true, method: "GET", path: "/search" },
  async ({ query }) => {
    const results: SearchResult[] = [];
    const searchQuery = `%${query}%`;

    // Search Flight Schedules
    const schedules = await operationsDB.queryAll<{ id: string; nome_cliente: string; aeronave: string; destino: string; }>`
      SELECT id, nome_cliente, aeronave, destino FROM flight_schedules
      WHERE nome_cliente ILIKE ${searchQuery} OR aeronave ILIKE ${searchQuery} OR destino ILIKE ${searchQuery}
      LIMIT 5
    `;
    schedules.forEach(s => results.push({
      id: `schedule_${s.id}`,
      title: `Agendamento: ${s.nome_cliente} - ${s.aeronave}`,
      description: `Voo para ${s.destino}`,
      type: 'Agendamento',
      path: '/operations/scheduling'
    }));

    // Search Contacts
    const contacts = await agendaDB.queryAll<{ id: string; nome: string; empresa: string; }>`
      SELECT id, nome, empresa FROM contacts
      WHERE nome ILIKE ${searchQuery} OR empresa ILIKE ${searchQuery}
      LIMIT 5
    `;
    contacts.forEach(c => results.push({
      id: `contact_${c.id}`,
      title: `Contato: ${c.nome}`,
      description: c.empresa || 'Contato pessoal',
      type: 'Contato',
      path: '/agenda/contacts'
    }));

    // Search Clients
    const clients = await agendaDB.queryAll<{ id: string; name: string; company: string; }>`
      SELECT id, name, company FROM clients
      WHERE name ILIKE ${searchQuery} OR company ILIKE ${searchQuery}
      LIMIT 5
    `;
    clients.forEach(c => results.push({
      id: `client_${c.id}`,
      title: `Cliente: ${c.name}`,
      description: c.company || 'Cliente individual',
      type: 'Cliente',
      path: '/agenda/clients'
    }));
    
    // Search Receipts
    const receipts = await financialDB.queryAll<{ id: string; numero: string; cliente_nome: string; }>`
      SELECT id, numero, cliente_nome FROM receipts
      WHERE numero ILIKE ${searchQuery} OR cliente_nome ILIKE ${searchQuery}
      LIMIT 5
    `;
    receipts.forEach(r => results.push({
      id: `receipt_${r.id}`,
      title: `Recibo: ${r.numero}`,
      description: `Para ${r.cliente_nome}`,
      type: 'Recibo',
      path: '/reports'
    }));

    // Search Travel Reports
    const travelReports = await financialDB.queryAll<{ id: string; numero_relatorio: string; cotista: string; }>`
      SELECT id, numero_relatorio, cotista FROM travel_reports
      WHERE numero_relatorio ILIKE ${searchQuery} OR cotista ILIKE ${searchQuery}
      LIMIT 5
    `;
    travelReports.forEach(r => results.push({
      id: `travel_report_${r.id}`,
      title: `Relatório de Viagem: ${r.numero_relatorio}`,
      description: `Cotista: ${r.cotista}`,
      type: 'Relatório',
      path: '/reports'
    }));

    // Search Billing Documents
    const billingDocs = await financialDB.queryAll<{ id: string; numero_cobranca: string; devedor: string; }>`
      SELECT id, numero_cobranca, devedor FROM billing_documents
      WHERE numero_cobranca ILIKE ${searchQuery} OR devedor ILIKE ${searchQuery}
      LIMIT 5
    `;
    billingDocs.forEach(b => results.push({
      id: `billing_${b.id}`,
      title: `Cobrança: ${b.numero_cobranca}`,
      description: `Devedor: ${b.devedor}`,
      type: 'Cobrança',
      path: '/reports'
    }));

    return { results };
  }
);
