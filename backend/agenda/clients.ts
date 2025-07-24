import { api, APIError } from "encore.dev/api";
import { db } from "./encore.service";
import { createClientSchema, updateClientSchema } from "./validators";

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
  company: string;
  notes: string;
  active: boolean;
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
  company?: string;
  notes?: string;
  active?: boolean;
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
  company?: string;
  notes?: string;
  active?: boolean;
}

export interface ClientsResponse {
  clients: Client[];
}

// Creates a new client.
export const createClient = api<CreateClientRequest, Client>(
  { auth: true, expose: true, method: "POST", path: "/clients" },
  async (req) => {
    const { name, document, email, phone, address, city, state, zip_code, notes, company, active } = createClientSchema.parse(req);
    const id = `client_${Date.now()}`;
    const now = new Date();

    const client = await db.queryRow<Client>`
      INSERT INTO clients (
        id, name, document, email, phone, address, city, state, zip_code, notes, company, active, created_at, updated_at
      )
      VALUES (
        ${id}, ${name}, ${document}, ${email || ''}, ${phone || ''}, 
        ${address || ''}, ${city || ''}, ${state || ''}, ${zip_code || ''}, 
        ${notes || ''}, ${company || ''}, ${active !== false}, ${now}, ${now}
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
    const { id, ...updateData } = updateClientSchema.parse(req);
    const now = new Date();

    const client = await db.queryRow<Client>`
      UPDATE clients 
      SET name = COALESCE(${updateData.name}, name),
          document = COALESCE(${updateData.document}, document),
          email = COALESCE(${updateData.email}, email),
          phone = COALESCE(${updateData.phone}, phone),
          address = COALESCE(${updateData.address}, address),
          city = COALESCE(${updateData.city}, city),
          state = COALESCE(${updateData.state}, state),
          zip_code = COALESCE(${updateData.zip_code}, zip_code),
          notes = COALESCE(${updateData.notes}, notes),
          company = COALESCE(${updateData.company}, company),
          active = COALESCE(${updateData.active}, active),
          updated_at = ${now}
      WHERE id = ${id}
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
