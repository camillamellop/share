import { api } from "encore.dev/api";
import { db } from "./encore.service";
import { getAuthData } from "~encore/auth";

export interface Note {
  user_id: string;
  content: string;
  updated_at: Date;
}

export interface SaveNoteRequest {
  content: string;
}

export interface GetResponse {
  note?: Note;
}

// Retrieves notes for the authenticated user.
export const get = api<void, GetResponse>(
  { auth: true, expose: true, method: "GET", path: "/notes" },
  async () => {
    const auth = getAuthData()!;
    const note = await db.queryRow<Note>`
      SELECT * FROM notes WHERE user_id = ${auth.userID}
    `;
    return { note: note || undefined };
  }
);

// Saves notes for the authenticated user.
export const save = api<SaveNoteRequest, Note>(
  { auth: true, expose: true, method: "POST", path: "/notes" },
  async (req) => {
    const auth = getAuthData()!;
    const now = new Date();
    const note = await db.queryRow<Note>`
      INSERT INTO notes (user_id, content, updated_at)
      VALUES (${auth.userID}, ${req.content}, ${now})
      ON CONFLICT (user_id) DO UPDATE
      SET content = ${req.content}, updated_at = ${now}
      RETURNING *
    `;
    return note!;
  }
);
