import { api, APIError } from "encore.dev/api";
import { db } from "./encore.service";
import { getAuthData } from "~encore/auth";

export type RequisitionStatus = "pendente" | "em_analise" | "aprovada" | "rejeitada" | "concluida";
export type RequisitionPriority = "baixa" | "media" | "alta";
export type RequisitionType = "Compra" | "Serviço";

export interface PurchaseRequisition {
  id: string;
  title: string;
  description: string;
  type: RequisitionType;
  status: RequisitionStatus;
  priority: RequisitionPriority;
  value: number;
  created_by: string;
  created_by_name: string;
  updated_by_id?: string;
  updated_by_name?: string;
  needed_by?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRequisitionRequest {
  title: string;
  description: string;
  type: RequisitionType;
  priority: RequisitionPriority;
  value: number;
  needed_by?: Date;
}

export interface UpdateRequisitionRequest {
  id: string;
  title?: string;
  description?: string;
  type?: RequisitionType;
  status?: RequisitionStatus;
  priority?: RequisitionPriority;
  value?: number;
  needed_by?: Date;
}

export interface RequisitionsResponse {
  requisitions: PurchaseRequisition[];
}

export interface RequisitionStatsResponse {
  total: number;
  pending: number;
  approved: number;
  total_value: number;
}

// Creates a new purchase requisition.
export const create = api<CreateRequisitionRequest, PurchaseRequisition>(
  { auth: true, expose: true, method: "POST", path: "/purchasing/requisitions" },
  async (req) => {
    const auth = getAuthData()!;
    const id = `req_${Date.now()}`;
    const now = new Date();
    const created_by = auth.userID;
    const created_by_name = auth.name;

    const requisition = await db.queryRow<PurchaseRequisition>`
      INSERT INTO purchase_requisitions (
        id, title, description, type, status, priority, value, created_by, created_by_name, needed_by, created_at, updated_at
      )
      VALUES (
        ${id}, ${req.title}, ${req.description}, ${req.type}, 'pendente', 
        ${req.priority}, ${req.value}, ${created_by}, ${created_by_name}, ${req.needed_by}, ${now}, ${now}
      )
      RETURNING *
    `;
    return requisition!;
  }
);

// Lists purchase requisitions. Admins see all, others see their own.
export const list = api<void, RequisitionsResponse>(
  { auth: true, expose: true, method: "GET", path: "/purchasing/requisitions" },
  async () => {
    const auth = getAuthData()!;
    let query = "SELECT * FROM purchase_requisitions";
    if (auth.role !== 'admin') {
      query += ` WHERE created_by = '${auth.userID}'`;
    }
    query += " ORDER BY created_at DESC";
    
    const requisitions = await db.queryAll<PurchaseRequisition>(query as any);
    return { requisitions };
  }
);

// Updates a purchase requisition. Only admin can update any, others only their own.
export const update = api<UpdateRequisitionRequest, PurchaseRequisition>(
  { auth: true, expose: true, method: "PUT", path: "/purchasing/requisitions/:id" },
  async (req) => {
    const auth = getAuthData()!;
    const requisition = await db.queryRow<PurchaseRequisition>`SELECT * FROM purchase_requisitions WHERE id = ${req.id}`;
    if (!requisition) {
      throw APIError.notFound("requisition not found");
    }
    if (auth.role !== 'admin' && requisition.created_by !== auth.userID) {
      throw APIError.permissionDenied("you are not authorized to update this requisition");
    }

    const now = new Date();
    const updatedRequisition = await db.queryRow<PurchaseRequisition>`
      UPDATE purchase_requisitions
      SET title = COALESCE(${req.title}, title),
          description = COALESCE(${req.description}, description),
          type = COALESCE(${req.type}, type),
          status = COALESCE(${req.status}, status),
          priority = COALESCE(${req.priority}, priority),
          value = COALESCE(${req.value}, value),
          needed_by = COALESCE(${req.needed_by}, needed_by),
          updated_by_id = ${auth.userID},
          updated_by_name = ${auth.name},
          updated_at = ${now}
      WHERE id = ${req.id}
      RETURNING *
    `;
    return updatedRequisition!;
  }
);

// Retrieves purchase requisition statistics.
export const getStats = api<void, RequisitionStatsResponse>(
  { auth: true, expose: true, method: "GET", path: "/purchasing/requisitions/stats" },
  async () => {
    const totalResult = await db.queryRow<{ count: string }>`
      SELECT COUNT(*) as count FROM purchase_requisitions
    `;
    const pendingResult = await db.queryRow<{ count: string }>`
      SELECT COUNT(*) as count FROM purchase_requisitions WHERE status = 'pendente' OR status = 'em_analise'
    `;
    const approvedResult = await db.queryRow<{ count: string }>`
      SELECT COUNT(*) as count FROM purchase_requisitions WHERE status = 'aprovada'
    `;
    const totalValueResult = await db.queryRow<{ sum: number }>`
      SELECT SUM(value) as sum FROM purchase_requisitions
    `;

    return {
      total: parseInt(totalResult?.count?.toString() || '0'),
      pending: parseInt(pendingResult?.count?.toString() || '0'),
      approved: parseInt(approvedResult?.count?.toString() || '0'),
      total_value: totalValueResult?.sum || 0,
    };
  }
);
