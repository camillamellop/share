import { api, APIError } from "encore.dev/api";
import { db } from "./encore.service";
import { getAuthData } from "~encore/auth";

export type TransactionType = 'expense' | 'reimbursement';
export type TransactionStatus = 'pending_payment' | 'paid' | 'awaiting_billing' | 'billed' | 'received';

export interface FinancialTransaction {
  id: string;
  description: string;
  type: TransactionType;
  category?: string;
  amount: number;
  party_name: string;
  aircraft?: string;
  transaction_date: Date;
  due_date?: Date;
  payment_method?: string;
  status: TransactionStatus;
  notes?: string;
  attachment_url?: string;
  source_id?: string;
  source_type?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTransactionRequest {
  description: string;
  type: TransactionType;
  category?: string;
  amount: number;
  party_name: string;
  aircraft?: string;
  transaction_date: Date;
  due_date?: Date;
  payment_method?: string;
  status: TransactionStatus;
  notes?: string;
}

export interface UpdateTransactionStatusRequest {
  id: string;
  status: TransactionStatus;
}

export interface TransactionsResponse {
  transactions: FinancialTransaction[];
}

// Creates a new manual financial transaction.
export const createTransaction = api<CreateTransactionRequest, FinancialTransaction>(
  { auth: true, expose: true, method: "POST", path: "/financial/transactions" },
  async (req) => {
    const id = `ft_${Date.now()}`;
    const now = new Date();
    const transaction = await db.queryRow<FinancialTransaction>`
      INSERT INTO financial_transactions (
        id, description, type, category, amount, party_name, aircraft, 
        transaction_date, due_date, payment_method, status, notes, created_at, updated_at
      )
      VALUES (
        ${id}, ${req.description}, ${req.type}, ${req.category}, ${req.amount}, ${req.party_name},
        ${req.aircraft}, ${req.transaction_date}, ${req.due_date}, ${req.payment_method},
        ${req.status}, ${req.notes}, ${now}, ${now}
      )
      RETURNING *
    `;
    return transaction!;
  }
);

// Lists financial transactions with optional filters.
export const listTransactions = api<{ type?: TransactionType; status?: string }, TransactionsResponse>(
  { auth: true, expose: true, method: "GET", path: "/financial/transactions" },
  async ({ type, status }) => {
    const auth = getAuthData()!;
    if (auth.role !== 'admin') {
      throw APIError.permissionDenied("you are not authorized to view all financial transactions");
    }

    let query = "SELECT * FROM financial_transactions";
    const conditions = [];
    if (type) {
      conditions.push(`type = '${type}'`);
    }
    if (status) {
      // status can be a comma-separated list
      const statuses = status.split(',').map(s => `'${s}'`).join(',');
      conditions.push(`status IN (${statuses})`);
    }
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    query += " ORDER BY transaction_date DESC";
    
    const transactions = await db.queryAll<FinancialTransaction>(query as any);
    return { transactions };
  }
);

// Updates the status of a financial transaction.
export const updateTransactionStatus = api<UpdateTransactionStatusRequest, FinancialTransaction>(
  { auth: true, expose: true, method: "PATCH", path: "/financial/transactions/:id/status" },
  async (req) => {
    const now = new Date();
    const transaction = await db.queryRow<FinancialTransaction>`
      UPDATE financial_transactions
      SET status = ${req.status}, updated_at = ${now}
      WHERE id = ${req.id}
      RETURNING *
    `;
    if (!transaction) {
      throw APIError.notFound("Transaction not found");
    }
    return transaction;
  }
);

// Deletes a financial transaction.
export const deleteTransaction = api<{ id: string }, void>(
  { auth: true, expose: true, method: "DELETE", path: "/financial/transactions/:id" },
  async ({ id }) => {
    await db.exec`DELETE FROM financial_transactions WHERE id = ${id}`;
  }
);
