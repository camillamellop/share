import { api } from "encore.dev/api";

export interface UserProfile {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  employeeId: string;
  avatar?: string;
}

export interface VacationInfo {
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  nextVacation?: {
    startDate: Date;
    endDate: Date;
    status: "approved" | "pending" | "rejected";
  };
}

export interface UserProfileResponse {
  profile: UserProfile;
  vacation: VacationInfo;
}

// Retrieves the user profile and vacation information.
export const getUserProfile = api<void, UserProfileResponse>(
  { expose: true, method: "GET", path: "/user/profile" },
  async () => {
    // Mock data - in a real app this would come from a database
    return {
      profile: {
        id: "1",
        name: "Carlos Silva",
        position: "Piloto Comercial",
        department: "Operações de Voo",
        email: "carlos.silva@aviacao.com",
        phone: "+55 11 99999-9999",
        employeeId: "AV001234",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      vacation: {
        totalDays: 30,
        usedDays: 12,
        remainingDays: 18,
        nextVacation: {
          startDate: new Date("2025-02-15"),
          endDate: new Date("2025-02-25"),
          status: "approved"
        }
      }
    };
  }
);
