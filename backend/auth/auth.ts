import { APIError, Gateway, Header } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { secret } from "encore.dev/config";
import { SignJWT, jwtVerify } from "jose";

// AuthJwtSecret is a secret key used to sign and verify JSON Web Tokens (JWTs).
// This ensures that the authentication tokens are secure and have not been tampered with.
// For local development, a default value is provided. For production, you should set
// a strong, unique secret in the Encore Cloud dashboard under Infrastructure -> Secrets.
const jwtSecret = secret("AuthJwtSecret", { local: "default-secret-for-local-dev-please-change" });

interface AuthParams {
  authorization?: Header<"Authorization">;
}

export interface AuthData {
  userID: string;
  email: string;
  name: string;
  role: 'admin' | 'operations' | 'crew';
}

const auth = authHandler<AuthParams, AuthData>(async ({ authorization }) => {
  if (!authorization) {
    throw APIError.unauthenticated("missing authorization header");
  }
  const token = authorization.replace("Bearer ", "");
  if (!token) {
    throw APIError.unauthenticated("missing token");
  }

  try {
    const secretKey = new TextEncoder().encode(jwtSecret());
    const { payload } = await jwtVerify(token, secretKey);
    
    if (typeof payload.sub !== 'string' || !payload.email || !payload.role || !payload.name) {
      throw APIError.unauthenticated("invalid token payload");
    }

    return {
      userID: payload.sub,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as 'admin' | 'operations' | 'crew',
    };
  } catch (err) {
    throw APIError.unauthenticated("invalid token", { cause: err });
  }
});

export const gw = new Gateway({ authHandler: auth });

export async function generateToken(userID: string, email: string, name: string, role: string): Promise<string> {
  const secretKey = new TextEncoder().encode(jwtSecret());
  const token = await new SignJWT({ email, role, name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userID)
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secretKey);
  return token;
}
