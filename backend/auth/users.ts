import { api, APIError } from "encore.dev/api";
import { db } from "./encore.service";
import * as bcrypt from "bcrypt";
import { operations, profile as profileClient } from "~encore/clients";
import { getAuthData } from "~encore/auth";

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operations' | 'crew';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UsersResponse {
  users: User[];
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'operations' | 'crew';
  cpf: string;
  department: string;
  position: string;
  anac_license?: string;
  is_active?: boolean;
}

export interface UpdateUserRequest {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'operations' | 'crew';
  is_active?: boolean;
}

const initialUsers = [
  { name: 'Aline Rondon da Silva', cpf: '061.472.181-40', department: 'ADM', position: 'Administrativo', role: 'operations', is_pilot: false },
  { name: 'Augusto César Muzzi Moulin', cpf: '030.046.061-07', department: 'OPERAÇÕES', position: 'Operador', role: 'operations', is_pilot: false },
  { name: 'Camilla de Mello Pereira', cpf: '002.370.891-30', department: 'ADM', position: 'Administrativo', role: 'admin', is_pilot: false },
  { name: 'Daniele Casamary Foggiato França', cpf: '055.749.201-74', department: 'ADM', position: 'Administrativo', role: 'operations', is_pilot: false },
  { name: 'Karoline Jardim de Assis', cpf: '071.698.311-71', department: 'ADM', position: 'Administrativo', role: 'operations', is_pilot: false },
  { name: 'Rodrigo de Moraes Toscano', cpf: '283.212.928-52', department: 'OPERAÇÕES', position: 'Comandante', anac_license: '113374', role: 'crew', is_pilot: true },
  { name: 'Wendell Muniz Canedo', cpf: '031.312.941-08', department: 'OPERAÇÕES', position: 'Comandante', anac_license: '191100', role: 'crew', is_pilot: true },
  { name: 'Rolffe de Lima Erbe', cpf: '049.491.829-27', department: 'OPERAÇÕES', position: 'Comandante', anac_license: '130042', role: 'crew', is_pilot: true },
  { name: 'Luana Vasconcelos', cpf: '000.000.000-00', department: 'MKT', position: 'Marketing', role: 'operations', is_pilot: false },
];

async function seedUsers() {
  const saltRounds = 10;
  const defaultPassword = "password123";
  const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

  for (const userData of initialUsers) {
    const id = `user_${userData.cpf.replace(/\D/g, '')}`;
    const email = `${userData.name.split(' ')[0].toLowerCase()}.${userData.name.split(' ').slice(-1)[0].toLowerCase()}@sharebrasil.com`;
    const now = new Date();

    const user = await db.queryRow<User>`
      INSERT INTO users (id, email, password_hash, name, role, is_active, created_at, updated_at)
      VALUES (${id}, ${email}, ${passwordHash}, ${userData.name}, ${userData.role}, true, ${now}, ${now})
      ON CONFLICT (email) DO NOTHING
      RETURNING *
    `;

    if (user) {
      // Create profile
      await profileClient.createUserProfile({
        user_id: user.id,
        dados_pessoais: {
          nome: user.name,
          email: user.email,
          cpf: userData.cpf,
          telefone: '', rg: '', data_nascimento: new Date(), endereco: '', cidade: '', estado: '', cep: '', estado_civil: '', nacionalidade: 'Brasileira'
        },
        dados_profissionais: {
          cargo: userData.position,
          departamento: userData.department,
          data_admissao: new Date(),
          salario: 0, tipo_contrato: '', supervisor: '', licencas: [], certificacoes: [], experiencia_anos: 0
        },
        dados_bancarios: {
          banco: '', agencia: '', conta: '', tipo_conta: '', pix: ''
        }
      });

      // Create crew member if applicable
      if (userData.is_pilot) {
        await operations.internalCreateCrewMember({
          user_id: user.id,
          name: user.name,
          cpf: userData.cpf,
          department: userData.department,
          position: userData.position,
          anac_license: userData.anac_license,
        });
      }
    }
  }
}

// Lists all users. (Admin only)
export const listUsers = api<void, UsersResponse>(
  { auth: true, expose: true, method: "GET", path: "/auth/users" },
  async () => {
    const auth = getAuthData()!;
    if (auth.role !== 'admin') {
      throw APIError.permissionDenied("only admins can list users");
    }
    const users = await db.queryAll<User>`SELECT id, email, name, role, is_active, created_at, updated_at FROM users ORDER BY name ASC`;
    return { users };
  }
);

// Creates a new user. (Admin only)
export const createUser = api<CreateUserRequest, User>(
  { auth: true, expose: true, method: "POST", path: "/auth/users" },
  async (req) => {
    const auth = getAuthData()!;
    if (auth.role !== 'admin') {
      throw APIError.permissionDenied("only admins can create users");
    }

    const saltRounds = 10;
    const password = req.password || 'password123'; // Default password if not provided
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const id = `user_${req.cpf.replace(/\D/g, '')}`;
    const now = new Date();

    // Check for existing user by email or CPF-based ID
    const existingUser = await db.queryRow<User>`
      SELECT id FROM users WHERE email = ${req.email} OR id = ${id}
    `;
    if (existingUser) {
      throw APIError.alreadyExists("Já existe um usuário com este email ou CPF.");
    }

    const user = await db.queryRow<User>`
      INSERT INTO users (id, email, password_hash, name, role, is_active, created_at, updated_at)
      VALUES (${id}, ${req.email}, ${passwordHash}, ${req.name}, ${req.role}, ${req.is_active !== false}, ${now}, ${now})
      RETURNING id, email, name, role, is_active, created_at, updated_at
    `;
    if (!user) {
      throw APIError.internal("failed to create user in auth service");
    }

    // Now, create associated records, similar to seedUsers
    try {
      // Create profile
      await profileClient.createUserProfile({
        user_id: user.id,
        dados_pessoais: {
          nome: user.name,
          email: user.email,
          cpf: req.cpf,
          telefone: '', rg: '', data_nascimento: new Date(), endereco: '', cidade: '', estado: '', cep: '', estado_civil: '', nacionalidade: 'Brasileira'
        },
        dados_profissionais: {
          cargo: req.position,
          departamento: req.department,
          data_admissao: new Date(),
          salario: 0, tipo_contrato: '', supervisor: '', licencas: [], certificacoes: [], experiencia_anos: 0
        },
        dados_bancarios: {
          banco: '', agencia: '', conta: '', tipo_conta: '', pix: ''
        }
      });

      // Create crew member if role is 'crew'
      if (user.role === 'crew') {
        await operations.internalCreateCrewMember({
          user_id: user.id,
          name: user.name,
          cpf: req.cpf,
          department: req.department,
          position: req.position,
          anac_license: req.anac_license,
        });
      }
    } catch (error) {
      // If creating associated records fails, roll back the user creation.
      await db.exec`DELETE FROM users WHERE id = ${user.id}`;
      console.error("Failed to create associated user records, rolling back user creation.", error);
      throw APIError.internal("failed to create associated user records", { cause: error });
    }

    return user;
  }
);

// Updates a user. (Admin only)
export const updateUser = api<UpdateUserRequest, User>(
  { auth: true, expose: true, method: "PUT", path: "/auth/users/:id" },
  async (req) => {
    const auth = getAuthData()!;
    if (auth.role !== 'admin') {
      throw APIError.permissionDenied("only admins can update users");
    }

    const now = new Date();
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (req.name) {
      updateFields.push(`name = $${paramIndex++}`);
      params.push(req.name);
    }
    if (req.email) {
      const existing = await db.queryRow`SELECT id FROM users WHERE email = ${req.email} AND id != ${req.id}`;
      if (existing) {
        throw APIError.alreadyExists("Este email já está em uso por outro usuário.");
      }
      updateFields.push(`email = $${paramIndex++}`);
      params.push(req.email);
    }
    if (req.role) {
      updateFields.push(`role = $${paramIndex++}`);
      params.push(req.role);
    }
    if (req.is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex++}`);
      params.push(req.is_active);
    }
    if (req.password) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(req.password, saltRounds);
      updateFields.push(`password_hash = $${paramIndex++}`);
      params.push(passwordHash);
    }

    if (updateFields.length === 0) {
      throw APIError.invalidArgument("no fields to update");
    }

    updateFields.push(`updated_at = $${paramIndex++}`);
    params.push(now);

    params.push(req.id);

    const query = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, name, role, is_active, created_at, updated_at
    `;

    const user = await db.rawQueryRow<User>(query, ...params);

    if (!user) {
      throw APIError.notFound("user not found");
    }
    return user;
  }
);

// Deletes a user. (Admin only)
export const deleteUser = api<{ id: string }, void>(
  { auth: true, expose: true, method: "DELETE", path: "/auth/users/:id" },
  async ({ id }) => {
    const auth = getAuthData()!;
    if (auth.role !== 'admin') {
      throw APIError.permissionDenied("only admins can delete users");
    }
    if (id === auth.userID) {
      throw APIError.invalidArgument("cannot delete your own account");
    }
    await db.exec`DELETE FROM users WHERE id = ${id}`;
  }
);
