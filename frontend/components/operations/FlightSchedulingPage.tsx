import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { CalendarCheck, Plus, Search, Edit, Trash2, Plane, Users, Clock, MapPin } from "lucide-react";
import FlightScheduleModal from "./FlightScheduleModal";
import FlightScheduleStats from "./FlightScheduleStats";
import backend from "~backend/client";
import type { CreateFlightScheduleRequest, FlightSchedule } from "~backend/operations/flight-scheduling";
import PageHeader from "../PageHeader";

export default function FlightSchedulingPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<FlightSchedule | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedAircraft, setSelectedAircraft] = useState<string>('');

  const { data: schedulesData, isLoading } = useQuery({
    queryKey: ["flightSchedules"],
    queryFn: () => backend.operations.getFlightSchedules()
  });

  const { data: aircraftData } = useQuery({
    queryKey: ["aircrafts"],
    queryFn: () => backend.operations.getAircrafts()
  });

  const createScheduleMutation = useMutation({
    mutationFn: (data: CreateFlightScheduleRequest) => backend.operations.createFlightSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flightSchedules"] });
      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error creating schedule:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar agendamento.",
        variant: "destructive",
      });
    }
  });

  const updateScheduleMutation = useMutation({
    mutationFn: (data: any) => backend.operations.updateFlightSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flightSchedules"] });
      toast({
        title: "Sucesso",
        description: "Agendamento atualizado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error updating schedule:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar agendamento.",
        variant: "destructive",
      });
    }
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: (id: string) => backend.operations.deleteFlightSchedule({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flightSchedules"] });
      toast({
        title: "Sucesso",
        description: "Agendamento excluído com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error deleting schedule:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir agendamento.",
        variant: "destructive",
      });
    }
  });

  const schedules = schedulesData?.schedules || [];

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = !searchTerm || 
      schedule.nome_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.aeronave?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.destino?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.origem?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !selectedStatus || schedule.status === selectedStatus;
    const matchesAircraft = !selectedAircraft || schedule.aeronave === selectedAircraft;

    return matchesSearch && matchesStatus && matchesAircraft;
  });

  const handleSaveSchedule = (scheduleData: any) => {
    if (editingSchedule) {
      updateScheduleMutation.mutate({ ...scheduleData, id: editingSchedule.id });
    } else {
      createScheduleMutation.mutate(scheduleData);
    }
    setIsModalOpen(false);
    setEditingSchedule(null);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      deleteScheduleMutation.mutate(scheduleId);
    }
  };

  const openEditModal = (schedule: FlightSchedule) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pendente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      confirmado: 'bg-green-500/20 text-green-400 border-green-500/30',
      realizado: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      cancelado: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pendente: 'Pendente',
      confirmado: 'Confirmado',
      realizado: 'Realizado',
      cancelado: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getTipoVooColor = (tipo: string) => {
    const colors: { [key: string]: string } = {
      executivo: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      treinamento: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      manutencao: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[tipo] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getTipoVooLabel = (tipo: string) => {
    const labels: { [key: string]: string } = {
      executivo: 'Executivo',
      treinamento: 'Treinamento',
      manutencao: 'Manutenção',
    };
    return labels[tipo] || tipo;
  };

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
        title="Agendamento de Voos"
        description="Gerencie os agendamentos de voos da empresa."
        backPath="/"
      >
        <Button onClick={openAddModal} className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </PageHeader>

      <FlightScheduleStats />

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
                placeholder="Buscar por cliente, aeronave, destino..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white rounded-md px-3 py-2"
            >
              <option value="">Todos os Status</option>
              <option value="pendente">Pendente</option>
              <option value="confirmado">Confirmado</option>
              <option value="realizado">Realizado</option>
              <option value="cancelado">Cancelado</option>
            </select>

            <select
              value={selectedAircraft}
              onChange={e => setSelectedAircraft(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white rounded-md px-3 py-2"
            >
              <option value="">Todas as Aeronaves</option>
              {aircraftData?.aircraft?.map((aircraft) => (
                <option key={aircraft.id} value={aircraft.registration}>{aircraft.registration}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {filteredSchedules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchedules.map(schedule => (
            <Card key={schedule.id} className="bg-slate-900/90 backdrop-blur-sm border-slate-800 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarCheck className="w-4 h-4 text-cyan-400" />
                      <span className="text-white font-semibold">{schedule.aeronave}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(schedule.status)}>
                        {getStatusLabel(schedule.status)}
                      </Badge>
                      <Badge className={getTipoVooColor(schedule.tipo_voo)}>
                        {getTipoVooLabel(schedule.tipo_voo)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditModal(schedule)}
                    >
                      <Edit className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400">Data:</p>
                    <p className="text-slate-300 font-semibold">
                      {new Date(schedule.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Horário:</p>
                    <p className="text-slate-300 font-semibold">{schedule.horario}</p>
                  </div>
                </div>

                <div>
                  <p className="text-slate-400">Cliente:</p>
                  <p className="text-slate-300 font-semibold">{schedule.nome_cliente}</p>
                </div>

                <div className="flex items-center text-slate-300">
                  <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                  <span className="text-xs">{schedule.origem} → {schedule.destino}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-slate-300">
                    <Users className="w-4 h-4 mr-2 text-green-400" />
                    <span className="text-xs">{schedule.passageiros} pax</span>
                  </div>
                  <div className="flex items-center text-slate-300">
                    <Clock className="w-4 h-4 mr-2 text-yellow-400" />
                    <span className="text-xs">{schedule.duracao_estimada}</span>
                  </div>
                </div>

                <div>
                  <p className="text-slate-400 text-xs">Tripulação:</p>
                  <p className="text-slate-300 text-xs">{schedule.tripulacao}</p>
                </div>

                {schedule.observacoes && (
                  <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-md p-2 mt-2">
                    <p className="text-xs text-yellow-400">{schedule.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">Nenhum agendamento encontrado.</p>
          <Button onClick={openAddModal} className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Agendamento
          </Button>
        </div>
      )}

      {isModalOpen && (
        <FlightScheduleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSchedule}
          schedule={editingSchedule}
          config={{ aircrafts: aircraftData?.aircraft?.map(a => a.registration) }}
        />
      )}
    </div>
  );
}
