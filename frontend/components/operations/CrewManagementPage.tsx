import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Users, Plus, Search, Edit, Trash2, User, Shield, Plane } from "lucide-react";
import CrewMemberModal from "./CrewMemberModal";
import backend from "~backend/client";
import type { CreateCrewMemberRequest, CrewMember } from "~backend/operations/crew";
import PageHeader from "../PageHeader";

export default function CrewManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CrewMember | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [showPilotsOnly, setShowPilotsOnly] = useState(false);

  const { data: crewData, isLoading } = useQuery({
    queryKey: ["crewMembers"],
    queryFn: () => backend.operations.getCrewMembers()
  });

  const createMemberMutation = useMutation({
    mutationFn: (data: CreateCrewMemberRequest) => backend.operations.createCrewMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crewMembers"] });
      queryClient.invalidateQueries({ queryKey: ["pilots"] });
      toast({
        title: "Sucesso",
        description: "Membro da tripulação criado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error creating crew member:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar membro da tripulação.",
        variant: "destructive",
      });
    }
  });

  const updateMemberMutation = useMutation({
    mutationFn: (data: any) => backend.operations.updateCrewMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crewMembers"] });
      queryClient.invalidateQueries({ queryKey: ["pilots"] });
      toast({
        title: "Sucesso",
        description: "Membro da tripulação atualizado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error updating crew member:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar membro da tripulação.",
        variant: "destructive",
      });
    }
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id: string) => backend.operations.deleteCrewMember({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crewMembers"] });
      queryClient.invalidateQueries({ queryKey: ["pilots"] });
      toast({
        title: "Sucesso",
        description: "Membro da tripulação excluído com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error deleting crew member:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir membro da tripulação.",
        variant: "destructive",
      });
    }
  });

  const crewMembers = crewData?.crew_members || [];

  const filteredMembers = crewMembers.filter(member => {
    const matchesSearch = !searchTerm || 
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.cpf?.includes(searchTerm) ||
      member.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.position?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = !selectedDepartment || member.department === selectedDepartment;
    const matchesPilotFilter = !showPilotsOnly || member.is_pilot;

    return matchesSearch && matchesDepartment && matchesPilotFilter;
  });

  const handleSaveMember = (memberData: any) => {
    if (editingMember) {
      updateMemberMutation.mutate({ ...memberData, id: editingMember.id });
    } else {
      createMemberMutation.mutate(memberData);
    }
    setIsModalOpen(false);
    setEditingMember(null);
  };

  const handleDeleteMember = (memberId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este membro da tripulação?')) {
      deleteMemberMutation.mutate(memberId);
    }
  };

  const openEditModal = (member: CrewMember) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };

  const getDepartmentColor = (department: string) => {
    const colors: { [key: string]: string } = {
      'ADM': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'OPERAÇÕES': 'bg-green-500/20 text-green-400 border-green-500/30',
      'DOCUMENTOS': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'MKT': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    };
    return colors[department] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const departments = [...new Set(crewMembers.map(m => m.department))];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="h-32 bg-slate-700 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Gestão de Tripulação"
        description="Gerencie funcionários e tripulantes da empresa."
        backPath="/"
      >
        <Button onClick={openAddModal} className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Membro
        </Button>
      </PageHeader>

      <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar por nome, CPF, departamento..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <select
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white rounded-md px-3 py-2"
            >
              <option value="">Todos os Departamentos</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="pilotsOnly"
                checked={showPilotsOnly}
                onChange={e => setShowPilotsOnly(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="pilotsOnly" className="text-white text-sm">
                Apenas Pilotos
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(member => (
            <Card key={member.id} className="bg-slate-900/90 backdrop-blur-sm border-slate-800 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {member.is_pilot ? (
                        <Plane className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <User className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="text-white font-semibold">{member.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getDepartmentColor(member.department)}>
                        {member.department}
                      </Badge>
                      {member.is_pilot && (
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                          <Plane className="w-3 h-3 mr-1" />
                          Piloto
                        </Badge>
                      )}
                      {!member.is_active && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          Inativo
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditModal(member)}
                    >
                      <Edit className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteMember(member.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-400">Cargo:</p>
                  <p className="text-slate-300 font-semibold">{member.position}</p>
                </div>

                {member.cpf && (
                  <div>
                    <p className="text-slate-400">CPF:</p>
                    <p className="text-slate-300 font-mono">{member.cpf}</p>
                  </div>
                )}

                {member.anac_license && (
                  <div className="bg-cyan-900/20 border border-cyan-800/30 rounded-md p-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-cyan-400" />
                      <div>
                        <p className="text-cyan-400 text-xs font-semibold">Licença ANAC</p>
                        <p className="text-cyan-300 font-mono">{member.anac_license}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">Nenhum membro encontrado.</p>
          <Button onClick={openAddModal} className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeiro Membro
          </Button>
        </div>
      )}

      {isModalOpen && (
        <CrewMemberModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveMember}
          member={editingMember}
        />
      )}
    </div>
  );
}
