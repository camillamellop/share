import { api } from "encore.dev/api";
import { db } from "./encore.service";
import { getAuthData } from "~encore/auth";

export interface BillingDocument {
  id: string;
  numero_cobranca: string;
  devedor: string;
  referencia: string;
  valor: number;
  vencimento: Date;
  status: "pending" | "paid" | "overdue";
  created_at: Date;
  created_by_id: string;
  created_by_name: string;
  updated_at?: Date;
}

export interface CreateBillingRequest {
  devedor: string;
  referencia: string;
  valor: number;
  vencimento: Date;
}

export interface BillingResponse {
  documents: BillingDocument[];
}

// Creates a new billing document.
export const createBilling = api<CreateBillingRequest, BillingDocument>(
  { auth: true, expose: true, method: "POST", path: "/billing" },
  async (req) => {
    const auth = getAuthData()!;
    const id = `billing_${Date.now()}`;
    const numero_cobranca = `COB-${Date.now()}`;
    const now = new Date();

    const billing = await db.queryRow<BillingDocument>`
      INSERT INTO billing_documents (
        id, numero_cobranca, devedor, referencia, valor, vencimento, status, 
        created_at, created_by_id, created_by_name, updated_at
      )
      VALUES (
        ${id}, ${numero_cobranca}, ${req.devedor}, ${req.referencia}, 
        ${req.valor}, ${req.vencimento}, 'pending', ${now},
        ${auth.userID}, ${auth.name}, ${now}
      )
      RETURNING *
    `;

    // Add financial transaction entry
    const transactionId = `ft_${billing!.id}`;
    const transactionDescription = `Cobrança - ${req.referencia}`;
    await db.exec`
      INSERT INTO financial_transactions (
        id, source_id, source_type, description, type, status, party_name, amount, transaction_date, due_date, created_at, updated_at
      )
      VALUES (
        ${transactionId}, ${billing!.id}, 'billing', ${transactionDescription},
        'reimbursement', 'billed', ${req.devedor}, ${req.valor}, ${now}, ${req.vencimento}, ${now}, ${now}
      )
    `;

    return billing!;
  }
);

// Retrieves all billing documents.
export const getBillingDocuments = api<void, BillingResponse>(
  { auth: true, expose: true, method: "GET", path: "/billing" },
  async () => {
    const documents = await db.queryAll<BillingDocument>`
      SELECT * FROM billing_documents ORDER BY created_at DESC
    `;
    return { documents };
  }
);
