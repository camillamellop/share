import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, User, Shield, Plane } from "lucide-react";
import { useBackend } from "../../hooks/useBackend";
import PageHeader from "../PageHeader";
import UserFormModal from "./UserFormModal";
import type { User, CreateUserRequest, UpdateUserRequest } from "~backend/auth/users";

export default function UserManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const backend = useBackend();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => backend.auth.listUsers(),
  });

  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => backend.auth.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Sucesso", description: "Usuário criado com sucesso!" });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      console.error("Error creating user:", error);
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: UpdateUserRequest) => backend.auth.updateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Sucesso", description: "Usuário atualizado com sucesso!" });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      console.error("Error updating user:", error);
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => backend.auth.deleteUser({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Sucesso", description: "Usuário excluído com sucesso!" });
    },
    onError: (error: any) => {
      console.error("Error deleting user:", error);
      toast({
        title: "Erro ao excluir usuário",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  });

  const handleSaveUser = (userData: any) => {
    if (editingUser) {
      updateUserMutation.mutate({ ...userData, id: editingUser.id });
    } else {
      createUserMutation.mutate(userData);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin': return { label: 'Admin', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: Shield };
      case 'operations': return { label: 'Operações', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: User };
      case 'crew': return { label: 'Tripulação', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: Plane };
      default: return { label: role, color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: User };
    }
  };

  const users = usersData?.users || [];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Gestão de Usuários"
        description="Adicione, edite e remova usuários do sistema."
        backPath="/"
      >
        <Button onClick={openAddModal} className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </PageHeader>

      <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Usuários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-700 rounded" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-slate-400">
                  <tr>
                    <th className="p-2 border-b border-slate-700">Nome</th>
                    <th className="p-2 border-b border-slate-700">Email</th>
                    <th className="p-2 border-b border-slate-700">Perfil</th>
                    <th className="p-2 border-b border-slate-700">Status</th>
                    <th className="p-2 border-b border-slate-700 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {users.map(user => {
                    const roleInfo = getRoleInfo(user.role);
                    return (
                      <tr key={user.id} className="hover:bg-slate-800/50">
                        <td className="p-2 border-b border-slate-800 font-semibold">{user.name}</td>
                        <td className="p-2 border-b border-slate-800">{user.email}</td>
                        <td className="p-2 border-b border-slate-800">
                          <Badge className={roleInfo.color}>
                            <roleInfo.icon className="w-3 h-3 mr-1" />
                            {roleInfo.label}
                          </Badge>
                        </td>
                        <td className="p-2 border-b border-slate-800">
                          <Badge variant={user.is_active ? "default" : "secondary"}>
                            {user.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </td>
                        <td className="p-2 border-b border-slate-800 text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(user)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <UserFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveUser}
          user={editingUser}
        />
      )}
    </div>
  );
}
