import { api, APIError } from "encore.dev/api";
import { db } from "./encore.service";
import { getAuthData } from "~encore/auth";

export interface Client {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  notes: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateClientRequest {
  name: string;
  document: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
}

export interface UpdateClientRequest {
  id: string;
  name?: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
}

export interface ClientsResponse {
  clients: Client[];
}

// Creates a new client.
export const createClient = api<CreateClientRequest, Client>(
  { auth: true, expose: true, method: "POST", path: "/clients" },
  async (req) => {
    const id = `client_${Date.now()}`;
    const now = new Date();

    const client = await db.queryRow<Client>`
      INSERT INTO clients (
        id, name, document, email, phone, address, city, state, zip_code, notes, created_at, updated_at
      )
      VALUES (
        ${id}, ${req.name}, ${req.document}, ${req.email || ''}, ${req.phone || ''}, 
        ${req.address || ''}, ${req.city || ''}, ${req.state || ''}, ${req.zip_code || ''}, 
        ${req.notes || ''}, ${now}, ${now}
      )
      RETURNING *
    `;

    return client!;
  }
);

// Retrieves all clients.
export const getClients = api<void, ClientsResponse>(
  { auth: true, expose: true, method: "GET", path: "/clients" },
  async () => {
    const clients = await db.queryAll<Client>`
      SELECT * FROM clients ORDER BY name ASC
    `;
    return { clients };
  }
);

// Updates an existing client.
export const updateClient = api<UpdateClientRequest, Client>(
  { auth: true, expose: true, method: "PUT", path: "/clients/:id" },
  async (req) => {
    const now = new Date();

    const client = await db.queryRow<Client>`
      UPDATE clients 
      SET name = COALESCE(${req.name}, name),
          document = COALESCE(${req.document}, document),
          email = COALESCE(${req.email}, email),
          phone = COALESCE(${req.phone}, phone),
          address = COALESCE(${req.address}, address),
          city = COALESCE(${req.city}, city),
          state = COALESCE(${req.state}, state),
          zip_code = COALESCE(${req.zip_code}, zip_code),
          notes = COALESCE(${req.notes}, notes),
          updated_at = ${now}
      WHERE id = ${req.id}
      RETURNING *
    `;

    if (!client) {
      throw APIError.notFound("Client not found");
    }

    return client;
  }
);

// Deletes a client.
export const deleteClient = api<{ id: string }, void>(
  { auth: true, expose: true, method: "DELETE", path: "/clients/:id" },
  async ({ id }) => {
    await db.exec`DELETE FROM clients WHERE id = ${id}`;
  }
);
