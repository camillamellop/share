import { api, APIError } from "encore.dev/api";
import { db } from "./encore.service";
import { getAuthData } from "~encore/auth";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
}

export interface UpdateAnnouncementRequest {
  id: string;
  title?: string;
  content?: string;
}

export interface AnnouncementsResponse {
  announcements: Announcement[];
}

// Creates a new announcement.
export const create = api<CreateAnnouncementRequest, Announcement>(
  { auth: true, expose: true, method: "POST", path: "/announcements" },
  async (req) => {
    const auth = getAuthData()!;
    const id = `ann_${Date.now()}`;
    const now = new Date();
    const announcement = await db.queryRow<Announcement>`
      INSERT INTO announcements (id, title, content, author_id, author, created_at, updated_at)
      VALUES (${id}, ${req.title}, ${req.content}, ${auth.userID}, ${auth.name}, ${now}, ${now})
      RETURNING *
    `;
    return announcement!;
  }
);

// Lists all announcements.
export const list = api<void, AnnouncementsResponse>(
  { auth: true, expose: true, method: "GET", path: "/announcements" },
  async () => {
    const announcements = await db.queryAll<Announcement>`
      SELECT * FROM announcements ORDER BY created_at DESC
    `;
    return { announcements };
  }
);

// Updates an announcement.
export const update = api<UpdateAnnouncementRequest, Announcement>(
  { auth: true, expose: true, method: "PUT", path: "/announcements/:id" },
  async (req) => {
    const now = new Date();
    const announcement = await db.queryRow<Announcement>`
      UPDATE announcements
      SET title = COALESCE(${req.title}, title),
          content = COALESCE(${req.content}, content),
          updated_at = ${now}
      WHERE id = ${req.id}
      RETURNING *
    `;
    if (!announcement) throw APIError.notFound("Announcement not found");
    return announcement;
  }
);

// Deletes an announcement.
export const del = api<{ id: string }, void>(
  { auth: true, expose: true, method: "DELETE", path: "/announcements/:id" },
  async ({ id }) => {
    await db.exec`DELETE FROM announcements WHERE id = ${id}`;
  }
);
