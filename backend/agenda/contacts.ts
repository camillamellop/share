import { api, APIError } from "encore.dev/api";
import { db } from "./encore.service";
import { createContactSchema, updateContactSchema } from "./validators";

export interface Contact {
  id: string;
  nome: string;
  categoria_nome: string;
  categoria_cor: string;
  empresa: string;
  cargo: string;
  observacoes: string;
  favorito: boolean;
  telefones: string[];
  emails: string[];
  endereco_principal: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateContactRequest {
  nome: string;
  categoria_nome: string;
  categoria_cor?: string;
  empresa?: string;
  cargo?: string;
  observacoes?: string;
  favorito?: boolean;
  telefones: string[];
  emails: string[];
  endereco_principal?: string;
}

export interface UpdateContactRequest {
  id: string;
  nome?: string;
  categoria_nome?: string;
  categoria_cor?: string;
  empresa?: string;
  cargo?: string;
  observacoes?: string;
  favorito?: boolean;
  telefones?: string[];
  emails?: string[];
  endereco_principal?: string;
}

export interface ContactsResponse {
  contacts: Contact[];
}

// Creates a new contact.
export const createContact = api<CreateContactRequest, Contact>(
  { auth: true, expose: true, method: "POST", path: "/contacts" },
  async (req) => {
    const validatedReq = createContactSchema.parse(req);
    const id = `contact_${Date.now()}`;
    const now = new Date();

    const contact = await db.queryRow<Contact>`
      INSERT INTO contacts (
        id, nome, categoria_nome, categoria_cor, empresa, cargo, 
        observacoes, favorito, telefones, emails, endereco_principal, 
        created_at, updated_at
      )
      VALUES (
        ${id}, ${validatedReq.nome}, ${validatedReq.categoria_nome}, ${validatedReq.categoria_cor || ''}, 
        ${validatedReq.empresa || ''}, ${validatedReq.cargo || ''}, ${validatedReq.observacoes || ''}, 
        ${validatedReq.favorito || false}, ${validatedReq.telefones}, 
        ${validatedReq.emails}, ${validatedReq.endereco_principal || ''}, 
        ${now}, ${now}
      )
      RETURNING *
    `;

    return contact!;
  }
);

// Updates an existing contact.
export const updateContact = api<UpdateContactRequest, Contact>(
  { auth: true, expose: true, method: "PUT", path: "/contacts/:id" },
  async (req) => {
    const { id, ...updateData } = updateContactSchema.parse(req);
    const now = new Date();

    const contact = await db.queryRow<Contact>`
      UPDATE contacts 
      SET nome = COALESCE(${updateData.nome}, nome),
          categoria_nome = COALESCE(${updateData.categoria_nome}, categoria_nome),
          categoria_cor = COALESCE(${updateData.categoria_cor}, categoria_cor),
          empresa = COALESCE(${updateData.empresa}, empresa),
          cargo = COALESCE(${updateData.cargo}, cargo),
          observacoes = COALESCE(${updateData.observacoes}, observacoes),
          favorito = COALESCE(${updateData.favorito}, favorito),
          telefones = COALESCE(${updateData.telefones}, telefones),
          emails = COALESCE(${updateData.emails}, emails),
          endereco_principal = COALESCE(${updateData.endereco_principal}, endereco_principal),
          updated_at = ${now}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!contact) {
      throw APIError.notFound("Contact not found");
    }

    return contact;
  }
);

// Retrieves all contacts.
export const getContacts = api<void, ContactsResponse>(
  { auth: true, expose: true, method: "GET", path: "/contacts" },
  async () => {
    const contacts = await db.queryAll<Contact>`
      SELECT * FROM contacts ORDER BY favorito DESC, nome ASC
    `;
    return { contacts };
  }
);

// Deletes a contact.
export const deleteContact = api<{ id: string }, void>(
  { auth: true, expose: true, method: "DELETE", path: "/contacts/:id" },
  async (req) => {
    await db.exec`DELETE FROM contacts WHERE id = ${req.id}`;
  }
);

// Toggles favorite status of a contact.
export const toggleFavorite = api<{ id: string }, Contact>(
  { auth: true, expose: true, method: "PATCH", path: "/contacts/:id/favorite" },
  async (req) => {
    const now = new Date();

    const contact = await db.queryRow<Contact>`
      UPDATE contacts 
      SET favorito = NOT favorito,
          updated_at = ${now}
      WHERE id = ${req.id}
      RETURNING *
    `;

    if (!contact) {
      throw APIError.notFound("Contact not found");
    }

    return contact;
  }
);
