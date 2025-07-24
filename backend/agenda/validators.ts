import { z } from "zod";

// ======== CLIENTS ========
export const createClientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  document: z.string().min(1, "Documento é obrigatório."),
  email: z.string().email("Email inválido.").optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
  active: z.boolean().optional(),
});

export const updateClientSchema = createClientSchema.partial().extend({
  id: z.string(),
});

// ======== CONTACTS ========
export const createContactSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório."),
  categoria_nome: z.string().min(1, "Categoria é obrigatória."),
  categoria_cor: z.string().optional(),
  empresa: z.string().optional(),
  cargo: z.string().optional(),
  observacoes: z.string().optional(),
  favorito: z.boolean().optional(),
  telefones: z.array(z.string()),
  emails: z.array(z.string().email("Email inválido.")),
  endereco_principal: z.string().optional(),
});

export const updateContactSchema = createContactSchema.partial().extend({
  id: z.string(),
});
