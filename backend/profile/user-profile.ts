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
        ${JSON.stringify(req.dados_pessoais)}, 
        ${JSON.stringify(req.dados_profissionais)}, 
        ${JSON.stringify(req.dados_bancarios)}, 
        ${now}, ${now}
      )
      RETURNING *
    `;

    // Parse JSON fields back to objects for response
    const result = {
      ...profile!,
      dados_pessoais: JSON.parse(profile!.dados_pessoais as any),
      dados_profissionais: JSON.parse(profile!.dados_profissionais as any),
      dados_bancarios: JSON.parse(profile!.dados_bancarios as any)
    };
    return result;
  }
);

// Updates an existing user profile.
export const updateUserProfile = api<UpdateUserProfileRequest, UserProfile>(
  { auth: true, expose: true, method: "PUT", path: "/profile/:id" },
  async (req) => {
    const auth = getAuthData()!;
    const now = new Date();

    // Get current profile to merge with updates
    const currentProfile = await db.queryRow<any>`
      SELECT * FROM user_profiles WHERE id = ${req.id}
    `;

    if (!currentProfile) {
      throw APIError.notFound("Profile not found");
    }

    if (currentProfile.user_id !== auth.userID && auth.role !== 'admin') {
      throw APIError.permissionDenied("you are not authorized to update this profile");
    }

    // Parse current JSON data
    const currentDadosPessoais = JSON.parse(currentProfile.dados_pessoais);
    const currentDadosProfissionais = JSON.parse(currentProfile.dados_profissionais);
    const currentDadosBancarios = JSON.parse(currentProfile.dados_bancarios);

    // Merge with updates
    const updatedDadosPessoais = req.dados_pessoais 
      ? { ...currentDadosPessoais, ...req.dados_pessoais }
      : currentDadosPessoais;
    
    const updatedDadosProfissionais = req.dados_profissionais
      ? { ...currentDadosProfissionais, ...req.dados_profissionais }
      : currentDadosProfissionais;
    
    const updatedDadosBancarios = req.dados_bancarios
      ? { ...currentDadosBancarios, ...req.dados_bancarios }
      : currentDadosBancarios;

    const profile = await db.queryRow<UserProfile>`
      UPDATE user_profiles 
      SET foto_perfil = COALESCE(${req.foto_perfil}, foto_perfil),
          dados_pessoais = ${JSON.stringify(updatedDadosPessoais)},
          dados_profissionais = ${JSON.stringify(updatedDadosProfissionais)},
          dados_bancarios = ${JSON.stringify(updatedDadosBancarios)},
          updated_at = ${now}
      WHERE id = ${req.id}
      RETURNING *
    `;

    if (!profile) {
      throw APIError.notFound("Profile not found");
    }

    // Parse JSON fields back to objects for response
    const result = {
      ...profile,
      dados_pessoais: JSON.parse(profile.dados_pessoais as any),
      dados_profissionais: JSON.parse(profile.dados_profissionais as any),
      dados_bancarios: JSON.parse(profile.dados_bancarios as any)
    };
    return result;
  }
);

// Retrieves current user profile.
export const getMyProfile = api<void, UserProfileResponse>(
  { auth: true, expose: true, method: "GET", path: "/profile/me" },
  async () => {
    const auth = getAuthData();
    if (!auth) throw APIError.unauthenticated();
    
    const profile = await db.queryRow<any>`
      SELECT * FROM user_profiles WHERE user_id = ${auth.userID}
    `;
    
    if (!profile) {
      return { profile: null };
    }

    // Parse JSON fields back to objects for response
    const result = {
      ...profile,
      dados_pessoais: JSON.parse(profile.dados_pessoais),
      dados_profissionais: JSON.parse(profile.dados_profissionais),
      dados_bancarios: JSON.parse(profile.dados_bancarios)
    };

    return { profile: result };
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
