import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "./encore.service";

export interface PersonalData {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  rg: string;
  data_nascimento: Date;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  estado_civil: string;
  nacionalidade: string;
}

export interface ProfessionalData {
  cargo: string;
  departamento: string;
  data_admissao: Date;
  salario: number;
  tipo_contrato: string;
  supervisor: string;
  licencas: string[];
  certificacoes: string[];
  experiencia_anos: number;
}

export interface BankData {
  banco: string;
  agencia: string;
  conta: string;
  tipo_conta: string;
  pix: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  foto_perfil: string;
  dados_pessoais: PersonalData;
  dados_profissionais: ProfessionalData;
  dados_bancarios: BankData;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserProfileRequest {
  user_id: string;
  foto_perfil?: string;
  dados_pessoais: PersonalData;
  dados_profissionais: ProfessionalData;
  dados_bancarios: BankData;
}

export interface UpdateUserProfileRequest {
  id: string;
  foto_perfil?: string;
  dados_pessoais?: Partial<PersonalData>;
  dados_profissionais?: Partial<ProfessionalData>;
  dados_bancarios?: Partial<BankData>;
}

export interface UserProfileResponse {
  profile: UserProfile | null;
}

// Creates a new user profile.
export const createUserProfile = api<CreateUserProfileRequest, UserProfile>(
  { expose: false, method: "POST", path: "/profile" },
  async (req) => {
    const id = `profile_${Date.now()}`;
    const now = new Date();

    const profile = await db.queryRow<UserProfile>`
      INSERT INTO user_profiles (
        id, user_id, foto_perfil, dados_pessoais, dados_profissionais, 
        dados_bancarios, created_at, updated_at
      )
      VALUES (
        ${id}, ${req.user_id}, ${req.foto_perfil || ''}, 
        ${req.dados_pessoais}, 
        ${req.dados_profissionais}, 
        ${req.dados_bancarios}, 
        ${now}, ${now}
      )
      RETURNING *
    `;

    return profile!;
  }
);

// Updates an existing user profile.
export const updateUserProfile = api<UpdateUserProfileRequest, UserProfile>(
  { auth: true, expose: true, method: "PUT", path: "/profile/:id" },
  async (req) => {
    const auth = getAuthData()!;
    const now = new Date();

    // Get current profile to merge with updates
    const currentProfile = await db.queryRow<UserProfile>`
      SELECT * FROM user_profiles WHERE id = ${req.id}
    `;

    if (!currentProfile) {
      throw APIError.notFound("Profile not found");
    }

    if (currentProfile.user_id !== auth.userID && auth.role !== 'admin') {
      throw APIError.permissionDenied("you are not authorized to update this profile");
    }

    // Merge with updates
    const updatedDadosPessoais = req.dados_pessoais 
      ? { ...currentProfile.dados_pessoais, ...req.dados_pessoais }
      : currentProfile.dados_pessoais;
    
    const updatedDadosProfissionais = req.dados_profissionais
      ? { ...currentProfile.dados_profissionais, ...req.dados_profissionais }
      : currentProfile.dados_profissionais;
    
    const updatedDadosBancarios = req.dados_bancarios
      ? { ...currentProfile.dados_bancarios, ...req.dados_bancarios }
      : currentProfile.dados_bancarios;

    const profile = await db.queryRow<UserProfile>`
      UPDATE user_profiles 
      SET foto_perfil = COALESCE(${req.foto_perfil}, foto_perfil),
          dados_pessoais = ${updatedDadosPessoais},
          dados_profissionais = ${updatedDadosProfissionais},
          dados_bancarios = ${updatedDadosBancarios},
          updated_at = ${now}
      WHERE id = ${req.id}
      RETURNING *
    `;

    if (!profile) {
      throw APIError.notFound("Profile not found");
    }

    return profile;
  }
);

// Retrieves current user profile.
export const getMyProfile = api<void, UserProfileResponse>(
  { auth: true, expose: true, method: "GET", path: "/profile/me" },
  async () => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated();
    
    const profile = await db.queryRow<UserProfile>`
      SELECT * FROM user_profiles WHERE user_id = ${auth.userID}
    `;
    
    if (!profile) {
      return { profile: null };
    }

    return { profile };
  }
);

// Deletes a user profile.
export const deleteUserProfile = api<{ id: string }, void>(
  { auth: true, expose: true, method: "DELETE", path: "/profile/:id" },
  async (req) => {
    const auth = getAuthData()!;
    const profile = await db.queryRow<{ user_id: string }>`SELECT user_id FROM user_profiles WHERE id = ${req.id}`;
    
    if (profile && profile.user_id !== auth.userID && auth.role !== 'admin') {
      throw APIError.permissionDenied("you are not authorized to delete this profile");
    }

    await db.exec`DELETE FROM user_profiles WHERE id = ${req.id}`;
  }
);
