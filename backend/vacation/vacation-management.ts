import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { profile as profileClient } from "~encore/clients";
import { db } from "./encore.service";

export interface VacationRequest {
  id: string;
  user_id: string;
  start_date: Date;
  end_date: Date;
  days: number;
  type: "regulares" | "premio" | "coletivas";
  status: "pending" | "approved" | "rejected";
  requested_at: Date;
  approved_at?: Date;
  approved_by?: string;
  notes?: string;
}

export interface VacationBalance {
  user_id: string;
  admission_date: Date;
  total_available: number;
  used_days: number;
  available_days: number;
  expiring_days: number;
  expired_days: number;
  next_expiration_date?: Date;
}

export interface CreateVacationRequestRequest {
  start_date: Date;
  end_date: Date;
  type: "regulares" | "premio" | "coletivas";
  notes?: string;
}

export interface VacationRequestsResponse {
  requests: VacationRequest[];
}

export interface VacationBalanceResponse {
  balance: VacationBalance;
}

// Creates a new vacation request for the authenticated user.
export const createVacationRequest = api<CreateVacationRequestRequest, VacationRequest>(
  { auth: true, expose: true, method: "POST", path: "/vacation/requests" },
  async (req) => {
    const auth = getAuthData()!;
    const id = `vacation_${Date.now()}`;
    const now = new Date();
    
    // Calculate days between start and end date
    const startDate = new Date(req.start_date);
    const endDate = new Date(req.end_date);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const vacationRequest = await db.queryRow<VacationRequest>`
      INSERT INTO vacation_requests (
        id, user_id, start_date, end_date, days, type, status, requested_at, notes
      )
      VALUES (
        ${id}, ${auth.userID}, ${req.start_date}, ${req.end_date}, 
        ${days}, ${req.type}, 'pending', ${now}, ${req.notes || ''}
      )
      RETURNING *
    `;

    return vacationRequest!;
  }
);

// Retrieves vacation requests for a specific user (admin only).
export const getUserVacationRequests = api<{ user_id: string }, VacationRequestsResponse>(
  { auth: true, expose: true, method: "GET", path: "/vacation/requests/user/:user_id" },
  async (req) => {
    const auth = getAuthData()!;
    if (auth.role !== 'admin') {
      throw APIError.permissionDenied("you are not authorized to view other users' vacation requests");
    }
    const requests = await db.queryAll<VacationRequest>`
      SELECT * FROM vacation_requests 
      WHERE user_id = ${req.user_id} 
      ORDER BY start_date DESC
    `;
    return { requests };
  }
);

// Retrieves current user's vacation requests.
export const getMyVacationRequests = api<void, VacationRequestsResponse>(
  { auth: true, expose: true, method: "GET", path: "/vacation/requests/me" },
  async () => {
    const auth = getAuthData()!;
    const requests = await db.queryAll<VacationRequest>`
      SELECT * FROM vacation_requests 
      WHERE user_id = ${auth.userID} 
      ORDER BY start_date DESC
    `;
    return { requests };
  }
);

// Calculates vacation balance for a specific user (admin only).
export const getUserVacationBalance = api<{ user_id: string; admission_date: Date }, VacationBalanceResponse>(
  { auth: true, expose: true, method: "GET", path: "/vacation/balance/user/:user_id" },
  async (req) => {
    const auth = getAuthData()!;
    if (auth.role !== 'admin') {
      throw APIError.permissionDenied("you are not authorized to view other users' vacation balance");
    }

    const today = new Date();
    const admissionDate = new Date(req.admission_date);
    
    const monthsWorked = Math.floor((today.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const completedPeriods = Math.floor(monthsWorked / 12);
    const totalAvailable = completedPeriods * 30;
    
    const usedRequests = await db.queryAll<{ days: number }>`
      SELECT days FROM vacation_requests 
      WHERE user_id = ${req.user_id} AND status = 'approved'
    `;
    const usedDays = usedRequests.reduce((sum, r) => sum + r.days, 0);
    
    const availableDays = Math.max(0, totalAvailable - usedDays);
    
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    
    let expiringDays = 0;
    let nextExpirationDate: Date | undefined;
    
    if (completedPeriods > 0) {
      const nextExpiration = new Date(admissionDate);
      nextExpiration.setFullYear(nextExpiration.getFullYear() + completedPeriods + 1);
      
      if (nextExpiration <= threeMonthsFromNow) {
        expiringDays = Math.min(availableDays, 30);
        nextExpirationDate = nextExpiration;
      }
    }
    
    const expiredDays = completedPeriods > 1 ? Math.max(0, (completedPeriods - 1) * 30 - usedDays) : 0;

    const balance: VacationBalance = {
      user_id: req.user_id,
      admission_date: admissionDate,
      total_available: totalAvailable,
      used_days: usedDays,
      available_days: availableDays,
      expiring_days: expiringDays,
      expired_days: expiredDays,
      next_expiration_date: nextExpirationDate
    };

    return { balance };
  }
);

// Retrieves current user's vacation balance.
export const getMyVacationBalance = api<void, VacationBalanceResponse>(
  { auth: true, expose: true, method: "GET", path: "/vacation/balance/me" },
  async () => {
    const auth = getAuthData()!;
    const profile = await profileClient.getMyProfile();
    if (!profile.profile) {
      throw APIError.notFound("user profile not found, cannot calculate vacation balance");
    }
    const admissionDate = new Date(profile.profile.dados_profissionais.data_admissao);
    
    const result = await getUserVacationBalance({ user_id: auth.userID, admission_date: admissionDate });
    return result;
  }
);

// Approves or rejects a vacation request (admin only).
export const updateVacationRequestStatus = api<{ id: string; status: "approved" | "rejected"; notes?: string }, VacationRequest>(
  { auth: true, expose: true, method: "PATCH", path: "/vacation/requests/:id/status" },
  async (req) => {
    const auth = getAuthData()!;
    if (auth.role !== 'admin') {
      throw APIError.permissionDenied("you are not authorized to approve or reject vacation requests");
    }

    const now = new Date();
    const vacationRequest = await db.queryRow<VacationRequest>`
      UPDATE vacation_requests 
      SET status = ${req.status},
          approved_at = ${req.status === 'approved' ? now : null},
          approved_by = ${auth.name},
          notes = COALESCE(${req.notes}, notes)
      WHERE id = ${req.id}
      RETURNING *
    `;

    if (!vacationRequest) {
      throw new Error("Vacation request not found");
    }

    return vacationRequest;
  }
);

// Deletes a vacation request.
export const deleteVacationRequest = api<{ id: string }, void>(
  { auth: true, expose: true, method: "DELETE", path: "/vacation/requests/:id" },
  async (req) => {
    await db.exec`DELETE FROM vacation_requests WHERE id = ${req.id}`;
  }
);
