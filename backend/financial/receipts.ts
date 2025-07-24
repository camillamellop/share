import { api } from "encore.dev/api";
import { db } from "./encore.service";
import { getAuthData } from "~encore/auth";

export interface Receipt {
  id: string;
  numero: string;
  cliente_nome: string;
  cliente_cpf_cnpj: string;
  cliente_endereco: string;
  descricao: string;
  valor: number;
  data_emissao: Date;
  observacoes: string;
  created_at: Date;
  created_by_id: string;
  created_by_name: string;
  updated_at?: Date;
}

export interface CreateReceiptRequest {
  cliente_nome: string;
  cliente_cpf_cnpj?: string;
  cliente_endereco?: string;
  descricao: string;
  valor: number;
  data_emissao: Date;
  observacoes?: string;
}

export interface ReceiptsResponse {
  receipts: Receipt[];
}

// Creates a new receipt.
export const createReceipt = api<CreateReceiptRequest, Receipt>(
  { auth: true, expose: true, method: "POST", path: "/receipts" },
  async (req) => {
    const validatedReq = req;
    const auth = getAuthData()!;
    const id = `receipt_${Date.now()}`;
    const numero = `REC${new Date().getFullYear()}${String(Date.now()).slice(-4)}`;
    const now = new Date();

    await using tx = await db.begin();

    const receipt = await tx.queryRow<Receipt>`
      INSERT INTO receipts (
        id, numero, cliente_nome, cliente_cpf_cnpj, cliente_endereco, 
        descricao, valor, data_emissao, observacoes, created_at,
        created_by_id, created_by_name, updated_at
      )
      VALUES (
        ${id}, ${numero}, ${validatedReq.cliente_nome}, ${validatedReq.cliente_cpf_cnpj || ''}, 
        ${validatedReq.cliente_endereco || ''}, ${validatedReq.descricao}, ${validatedReq.valor}, 
        ${validatedReq.data_emissao}, ${validatedReq.observacoes || ''}, ${now},
        ${auth.userID}, ${auth.name}, ${now}
      )
      RETURNING *
    `;

    // Add financial transaction entry for a received payment
    const transactionId = `ft_${receipt!.id}`;
    const transactionDescription = `Recebimento - ${validatedReq.descricao}`;
    await tx.exec`
      INSERT INTO financial_transactions (
        id, source_id, source_type, description, type, status, party_name, amount, transaction_date, created_at, updated_at
      )
      VALUES (
        ${transactionId}, ${receipt!.id}, 'receipt', ${transactionDescription},
        'reimbursement', 'received', ${validatedReq.cliente_nome}, ${validatedReq.valor}, ${validatedReq.data_emissao}, ${now}, ${now}
      )
    `;

    return receipt!;
  }
);

// Retrieves all receipts.
export const getReceipts = api<void, ReceiptsResponse>(
  { auth: true, expose: true, method: "GET", path: "/receipts" },
  async () => {
    const receipts = await db.queryAll<Receipt>`
      SELECT * FROM receipts ORDER BY created_at DESC
    `;
    return { receipts };
  }
);
