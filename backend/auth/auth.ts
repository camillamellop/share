import { APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";

// AuthParams is no longer used for validation, but the type signature requires it.
interface AuthParams {}

export interface AuthData {
  userID: string;
  email: string;
  name: string;
  role: 'admin' | 'operations' | 'crew';
}

const auth = authHandler<AuthParams, AuthData>(async () => {
  // Since login is removed, we return a default admin user for all requests.
  // This allows all `auth: true` endpoints to work without a real login process.
  // This mock user corresponds to 'Camilla de Mello Pereira' from the initial seed data.
  return {
    userID: 'user_00237089130',
    email: 'camilla.pereira@sharebrasil.com',
    name: 'Camilla de Mello Pereira',
    role: 'admin',
  };
});

export const gw = new Gateway({ authHandler: auth });
