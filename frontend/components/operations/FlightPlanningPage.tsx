import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Route, Plus, Search, Edit, Trash2, Cloud, CheckSquare, Star } from "lucide-react";
import FlightPlanModal from "./FlightPlanModal";
import WeatherDisplay from "./WeatherDisplay";
import FavoriteRoutesModal from "./FavoriteRoutesModal";
import backend from "~backend/client";
import type { CreateFlightPlanRequest, FlightPlan } from "~backend/operations/flight-planning";
import PageHeader from "../PageHeader";

export default function FlightPlanningPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoutesModalOpen, setIsRoutesModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<FlightPlan | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showWeather, setShowWeather] = useState<string | null>(null);

  const { data: plansData, isLoading } = useQuery({
    queryKey: ["flightPlans"],
    queryFn: () => backend.operations.getFlightPlans()
  });

  const { data: routesData } = useQuery({
    queryKey: ["favoriteRoutes"],
    queryFn: () => backend.operations.getFavoriteRoutes()
  });

  const createPlanMutation = useMutation({
    mutationFn: (data: CreateFlightPlanRequest) => backend.operations.createFlightPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flightPlans"] });
      toast({
        title: "Sucesso",
        description: "Plano de voo criado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error creating flight plan:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar plano de voo.",
        variant: "destructive",
      });
    }
  });

  const updatePlanMutation = useMutation({
    mutationFn: (data: any) => backend.operations.updateFlightPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flightPlans"] });
      toast({
        title: "Sucesso",
        description: "Plano de voo atualizado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error updating flight plan:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar plano de voo.",
        variant: "destructive",
      });
    }
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id: string) => backend.operations.deleteFlightPlan({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flightPlans"] });
      toast({
        title: "Sucesso",
        description: "Plano de voo excluído com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error deleting flight plan:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir plano de voo.",
        variant: "destructive",
      });
    }
  });

  const plans = plansData?.flight_plans || [];
  const routes = routesData?.routes || [];

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = !searchTerm || 
      plan.flight_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.aircraft?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.departure_airport?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.arrival_airport?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !selectedStatus || plan.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleSavePlan = (planData: any) => {
    if (editingPlan) {
      updatePlanMutation.mutate({ ...planData, id: editingPlan.id });
    } else {
      createPlanMutation.mutate(planData);
    }
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handleDeletePlan = (planId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este plano de voo?')) {
      deletePlanMutation.mutate(planId);
    }
  };

  const openEditModal = (plan: FlightPlan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      filed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      approved: 'bg-green-500/20 text-green-400 border-green-500/30',
      active: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      completed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      draft: 'Rascunho',
      filed: 'Protocolado',
      approved: 'Aprovado',
      active: 'Ativo',
      completed: 'Concluído',
    };
    return labels[status] || status;
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
        title="Planejamento de Voo"
        description="Crie e gerencie planos de voo com dados meteorológicos."
        backPath="/"
      >
        <div className="flex gap-2">
          <Button onClick={() => setIsRoutesModalOpen(true)} variant="outline">
            <Star className="w-4 h-4 mr-2" />
            Rotas Favoritas
          </Button>
          <Button onClick={openAddModal} className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Plano de Voo
          </Button>
        </div>
      </PageHeader>

      <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Planos de Voo Salvos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar por número do voo, aeronave, aeroportos..."
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
              <option value="draft">Rascunho</option>
              <option value="filed">Protocolado</option>
              <option value="approved">Aprovado</option>
              <option value="active">Ativo</option>
              <option value="completed">Concluído</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {filteredPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map(plan => (
            <Card key={plan.id} className="bg-slate-900/90 backdrop-blur-sm border-slate-800 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Route className="w-4 h-4 text-cyan-400" />
                      <span className="text-white font-semibold">{plan.flight_number}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(plan.status)}>
                        {getStatusLabel(plan.status)}
                      </Badge>
                      {plan.checklist_completed && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckSquare className="w-3 h-3 mr-1" />
                          Checklist OK
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowWeather(plan.id)}
                    >
                      <Cloud className="w-4 h-4 text-blue-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditModal(plan)}
                    >
                      <Edit className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400">Aeronave:</p>
                    <p className="text-slate-300 font-semibold">{plan.aircraft}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Altitude:</p>
                    <p className="text-slate-300 font-semibold">{plan.altitude} ft</p>
                  </div>
                </div>

                <div>
                  <p className="text-slate-400">Rota:</p>
                  <p className="text-slate-300 font-semibold">
                    {plan.departure_airport} → {plan.arrival_airport}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400">Partida:</p>
                    <p className="text-slate-300 text-xs">
                      {new Date(plan.departure_time).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Chegada:</p>
                    <p className="text-slate-300 text-xs">
                      {new Date(plan.arrival_time).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400">Combustível:</p>
                    <p className="text-slate-300 font-semibold">{plan.fuel_burn_liters}L</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Peso Total:</p>
                    <p className="text-slate-300 font-semibold">
                      {plan.weight_balance.total_weight}kg
                    </p>
                  </div>
                </div>

                {plan.weight_balance && !plan.weight_balance.within_limits && (
                  <div className="bg-red-900/20 border border-red-800/30 rounded-md p-2 mt-2">
                    <p className="text-xs text-red-400">⚠️ Peso fora dos limites!</p>
                  </div>
                )}

                {plan.route && (
                  <div>
                    <p className="text-slate-400 text-xs">Rota:</p>
                    <p className="text-slate-300 text-xs">{plan.route}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">Nenhum plano de voo encontrado.</p>
          <Button onClick={openAddModal} className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Plano de Voo
          </Button>
        </div>
      )}

      {isModalOpen && (
        <FlightPlanModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSavePlan}
          plan={editingPlan}
          favoriteRoutes={routes}
        />
      )}

      {isRoutesModalOpen && (
        <FavoriteRoutesModal
          isOpen={isRoutesModalOpen}
          onClose={() => setIsRoutesModalOpen(false)}
        />
      )}

      {showWeather && (
        <WeatherDisplay
          planId={showWeather}
          plan={plans.find(p => p.id === showWeather)}
          onClose={() => setShowWeather(null)}
        />
      )}
    </div>
  );
}
