import { api, APIError } from "encore.dev/api";
import { db } from "./encore.service";

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
    const id = `contact_${Date.now()}`;
    const now = new Date();

    const contact = await db.queryRow<Contact>`
      INSERT INTO contacts (
        id, nome, categoria_nome, categoria_cor, empresa, cargo, 
        observacoes, favorito, telefones, emails, endereco_principal, 
        created_at, updated_at
      )
      VALUES (
        ${id}, ${req.nome}, ${req.categoria_nome}, ${req.categoria_cor || ''}, 
        ${req.empresa || ''}, ${req.cargo || ''}, ${req.observacoes || ''}, 
        ${req.favorito || false}, ${JSON.stringify(req.telefones)}, 
        ${JSON.stringify(req.emails)}, ${req.endereco_principal || ''}, 
        ${now}, ${now}
      )
      RETURNING *
    `;

    // Parse JSON arrays back to objects for response
    const result = {
      ...contact!,
      telefones: JSON.parse(contact!.telefones as any),
      emails: JSON.parse(contact!.emails as any)
    };
    return result;
  }
);

// Updates an existing contact.
export const updateContact = api<UpdateContactRequest, Contact>(
  { auth: true, expose: true, method: "PUT", path: "/contacts/:id" },
  async (req) => {
    const now = new Date();

    const contact = await db.queryRow<Contact>`
      UPDATE contacts 
      SET nome = COALESCE(${req.nome}, nome),
          categoria_nome = COALESCE(${req.categoria_nome}, categoria_nome),
          categoria_cor = COALESCE(${req.categoria_cor}, categoria_cor),
          empresa = COALESCE(${req.empresa}, empresa),
          cargo = COALESCE(${req.cargo}, cargo),
          observacoes = COALESCE(${req.observacoes}, observacoes),
          favorito = COALESCE(${req.favorito}, favorito),
          telefones = COALESCE(${req.telefones ? JSON.stringify(req.telefones) : null}, telefones),
          emails = COALESCE(${req.emails ? JSON.stringify(req.emails) : null}, emails),
          endereco_principal = COALESCE(${req.endereco_principal}, endereco_principal),
          updated_at = ${now}
      WHERE id = ${req.id}
      RETURNING *
    `;

    if (!contact) {
      throw APIError.notFound("Contact not found");
    }

    // Parse JSON arrays back to objects for response
    const result = {
      ...contact,
      telefones: JSON.parse(contact.telefones as any),
      emails: JSON.parse(contact.emails as any)
    };
    return result;
  }
);

// Retrieves all contacts.
export const getContacts = api<void, ContactsResponse>(
  { auth: true, expose: true, method: "GET", path: "/contacts" },
  async () => {
    const contacts = await db.queryAll<any>`
      SELECT * FROM contacts ORDER BY favorito DESC, nome ASC
    `;
    
    // Parse JSON arrays for each contact
    const parsedContacts = contacts.map(contact => ({
      ...contact,
      telefones: JSON.parse(contact.telefones),
      emails: JSON.parse(contact.emails)
    }));

    return { contacts: parsedContacts };
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

    // Parse JSON arrays back to objects for response
    const result = {
      ...contact,
      telefones: JSON.parse(contact.telefones as any),
      emails: JSON.parse(contact.emails as any)
    };
    return result;
  }
);
