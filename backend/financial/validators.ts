import { z } from "zod";

// ======== BILLING ========
export const createBillingSchema = z.object({
  devedor: z.string().min(1, "Devedor é obrigatório."),
  referencia: z.string().min(1, "Referência é obrigatória."),
  valor: z.number().positive("Valor deve ser positivo."),
  vencimento: z.coerce.date(),
});

// ======== RECEIPTS ========
export const createReceiptSchema = z.object({
  cliente_nome: z.string().min(1, "Nome do cliente é obrigatório."),
  cliente_cpf_cnpj: z.string().optional(),
  cliente_endereco: z.string().optional(),
  descricao: z.string().min(1, "Descrição é obrigatória."),
  valor: z.number().positive("Valor deve ser positivo."),
  data_emissao: z.coerce.date(),
  observacoes: z.string().optional(),
});

// ======== TRAVEL REPORTS ========
const travelExpenseSchema = z.object({
  categoria: z.string().min(1),
  descricao: z.string().min(1),
  valor: z.number().positive(),
  pago_por: z.string().min(1),
});

export const createTravelReportSchema = z.object({
  cotista: z.string().min(1),
  aeronave: z.string().min(1),
  tripulante: z.string().min(1),
  destino: z.string().min(1),
  data_inicio: z.coerce.date(),
  data_fim: z.coerce.date(),
  despesas: z.array(travelExpenseSchema).min(1, "Pelo menos uma despesa é necessária."),
  observacoes: z.string().optional(),
});
