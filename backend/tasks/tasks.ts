import { api, APIError } from "encore.dev/api";
import { db } from "./encore.service";
import { getAuthData } from "~encore/auth";

export type TaskStatus = "pending" | "in-progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: Date;
  category?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: Date;
  category?: string;
}

export interface UpdateTaskRequest {
  id: string;
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  due_date?: Date;
  category?: string;
}

export interface TasksResponse {
  tasks: Task[];
}

// Creates a new task for the authenticated user.
export const create = api<CreateTaskRequest, Task>(
  { auth: true, expose: true, method: "POST", path: "/tasks" },
  async (req) => {
    const auth = getAuthData()!;
    const id = `task_${Date.now()}`;
    const now = new Date();

    const task = await db.queryRow<Task>`
      INSERT INTO tasks (
        id, user_id, title, description, priority, status, due_date, category, created_at, updated_at
      )
      VALUES (
        ${id}, ${auth.userID}, ${req.title}, ${req.description}, 
        ${req.priority || 'medium'}, 'pending', ${req.due_date}, 
        ${req.category}, ${now}, ${now}
      )
      RETURNING *
    `;
    return task!;
  }
);

// Lists tasks for the authenticated user.
export const list = api<void, TasksResponse>(
  { auth: true, expose: true, method: "GET", path: "/tasks" },
  async () => {
    const auth = getAuthData()!;
    const tasks = await db.queryAll<Task>`
      SELECT * FROM tasks WHERE user_id = ${auth.userID} ORDER BY due_date ASC, created_at DESC
    `;
    return { tasks };
  }
);

// Updates a task, checking for ownership.
export const update = api<UpdateTaskRequest, Task>(
  { auth: true, expose: true, method: "PUT", path: "/tasks/:id" },
  async (req) => {
    const auth = getAuthData()!;
    const task = await db.queryRow<Task>`SELECT * FROM tasks WHERE id = ${req.id}`;
    if (!task) {
      throw APIError.notFound("task not found");
    }
    if (task.user_id !== auth.userID) {
      throw APIError.permissionDenied("you are not authorized to update this task");
    }

    const now = new Date();
    const updatedTask = await db.queryRow<Task>`
      UPDATE tasks
      SET title = COALESCE(${req.title}, title),
          description = COALESCE(${req.description}, description),
          priority = COALESCE(${req.priority}, priority),
          status = COALESCE(${req.status}, status),
          due_date = COALESCE(${req.due_date}, due_date),
          category = COALESCE(${req.category}, category),
          updated_at = ${now}
      WHERE id = ${req.id}
      RETURNING *
    `;
    return updatedTask!;
  }
);

// Deletes a task, checking for ownership.
export const del = api<{ id: string }, void>(
  { auth: true, expose: true, method: "DELETE", path: "/tasks/:id" },
  async ({ id }) => {
    const auth = getAuthData()!;
    const task = await db.queryRow<Task>`SELECT * FROM tasks WHERE id = ${id}`;
    if (!task) return;
    if (task.user_id !== auth.userID) {
      throw APIError.permissionDenied("you are not authorized to delete this task");
    }
    await db.exec`DELETE FROM tasks WHERE id = ${id}`;
  }
);
