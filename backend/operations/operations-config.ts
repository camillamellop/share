import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

const db = SQLDatabase.named("operations");

export interface OperationsConfig {
  id: string;
  status_options: { [key: string]: StatusOption };
  tipo_voo_options: { [key: string]: TipoVooOption };
  theme: ThemeConfig;
  locale: LocaleConfig;
  notifications: NotificationsConfig;
  created_at: Date;
  updated_at: Date;
}

export interface StatusOption {
  label: string;
  icon: string;
  color: string;
}

export interface TipoVooOption {
  label: string;
  icon: string;
  color: string;
}

export interface ThemeConfig {
  default_theme: string;
  enable_dark_mode: boolean;
}

export interface LocaleConfig {
  language: string;
  date_format: string;
  time_format: string;
}

export interface NotificationsConfig {
  enabled: boolean;
}

export interface CreateOperationsConfigRequest {
  status_options: { [key: string]: StatusOption };
  tipo_voo_options: { [key: string]: TipoVooOption };
  theme: ThemeConfig;
  locale: LocaleConfig;
  notifications: NotificationsConfig;
}

export interface OperationsConfigResponse {
  config?: OperationsConfig;
}

// Retrieves the operations configuration.
export const getOperationsConfig = api<void, OperationsConfigResponse>(
  { expose: true, method: "GET", path: "/operations/config" },
  async () => {
    const config = await db.queryRow<any>`
      SELECT * FROM operations_config ORDER BY created_at DESC LIMIT 1
    `;
    
    if (!config) {
      return { config: undefined };
    }

    // Parse JSON fields back to objects for response
    const result = {
      ...config,
      status_options: JSON.parse(config.status_options),
      tipo_voo_options: JSON.parse(config.tipo_voo_options),
      theme: JSON.parse(config.theme),
      locale: JSON.parse(config.locale),
      notifications: config.notifications ? JSON.parse(config.notifications) : { enabled: true }
    };

    return { config: result };
  }
);

// Creates or updates the operations configuration.
export const saveOperationsConfig = api<CreateOperationsConfigRequest, OperationsConfig>(
  { expose: true, method: "POST", path: "/operations/config" },
  async (req) => {
    const now = new Date();
    
    // Check if config already exists
    const existing = await db.queryRow<{ id: string }>`
      SELECT id FROM operations_config ORDER BY created_at DESC LIMIT 1
    `;

    if (existing) {
      // Update existing config
      const updated = await db.queryRow<any>`
        UPDATE operations_config 
        SET status_options = ${JSON.stringify(req.status_options)},
            tipo_voo_options = ${JSON.stringify(req.tipo_voo_options)},
            theme = ${JSON.stringify(req.theme)},
            locale = ${JSON.stringify(req.locale)},
            notifications = ${JSON.stringify(req.notifications)},
            updated_at = ${now}
        WHERE id = ${existing.id}
        RETURNING *
      `;

      // Parse JSON fields back to objects for response
      const result = {
        ...updated!,
        status_options: JSON.parse(updated!.status_options),
        tipo_voo_options: JSON.parse(updated!.tipo_voo_options),
        theme: JSON.parse(updated!.theme),
        locale: JSON.parse(updated!.locale),
        notifications: JSON.parse(updated!.notifications)
      };

      return result;
    } else {
      // Create new config
      const id = `config_${Date.now()}`;
      const created = await db.queryRow<any>`
        INSERT INTO operations_config (
          id, status_options, tipo_voo_options, theme, locale, notifications, created_at, updated_at
        )
        VALUES (
          ${id}, ${JSON.stringify(req.status_options)}, 
          ${JSON.stringify(req.tipo_voo_options)}, ${JSON.stringify(req.theme)}, 
          ${JSON.stringify(req.locale)}, ${JSON.stringify(req.notifications)}, ${now}, ${now}
        )
        RETURNING *
      `;

      // Parse JSON fields back to objects for response
      const result = {
        ...created!,
        status_options: JSON.parse(created!.status_options),
        tipo_voo_options: JSON.parse(created!.tipo_voo_options),
        theme: JSON.parse(created!.theme),
        locale: JSON.parse(created!.locale),
        notifications: JSON.parse(created!.notifications)
      };

      return result;
    }
  }
);
