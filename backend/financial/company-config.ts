import { api } from "encore.dev/api";
import { db } from "./encore.service";

export interface CompanyConfig {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  logotipo_url: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCompanyConfigRequest {
  nome: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  logotipo_url?: string;
}

export interface UpdateCompanyConfigRequest {
  id: string;
  nome?: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  logotipo_url?: string;
}

export interface CompanyConfigResponse {
  config?: CompanyConfig;
}

// Retrieves the company configuration.
export const getCompanyConfig = api<void, CompanyConfigResponse>(
  { expose: true, method: "GET", path: "/company/config" },
  async () => {
    const config = await db.queryRow<CompanyConfig>`
      SELECT * FROM company_config ORDER BY created_at DESC LIMIT 1
    `;
    return { config: config || undefined };
  }
);

// Creates or updates the company configuration.
export const saveCompanyConfig = api<CreateCompanyConfigRequest, CompanyConfig>(
  { expose: true, method: "POST", path: "/company/config" },
  async (req) => {
    const now = new Date();
    
    // Check if config already exists
    const existing = await db.queryRow<{ id: string }>`
      SELECT id FROM company_config ORDER BY created_at DESC LIMIT 1
    `;

    if (existing) {
      // Update existing config
      const updated = await db.queryRow<CompanyConfig>`
        UPDATE company_config 
        SET nome = ${req.nome},
            cnpj = ${req.cnpj || ''},
            endereco = ${req.endereco || ''},
            telefone = ${req.telefone || ''},
            email = ${req.email || ''},
            logotipo_url = ${req.logotipo_url || ''},
            updated_at = ${now}
        WHERE id = ${existing.id}
        RETURNING *
      `;
      return updated!;
    } else {
      // Create new config
      const id = `config_${Date.now()}`;
      const created = await db.queryRow<CompanyConfig>`
        INSERT INTO company_config (id, nome, cnpj, endereco, telefone, email, logotipo_url, created_at, updated_at)
        VALUES (${id}, ${req.nome}, ${req.cnpj || ''}, ${req.endereco || ''}, ${req.telefone || ''}, ${req.email || ''}, ${req.logotipo_url || ''}, ${now}, ${now})
        RETURNING *
      `;
      return created!;
    }
  }
);
