import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plane, Calendar, Clock, Plus, Edit, Trash2 } from "lucide-react";
import backend from "~backend/client";
import { Link } from "react-router-dom";
import PageHeader from "../PageHeader";
import AircraftFormModal from "./AircraftFormModal";
import { useToast } from "@/components/ui/use-toast";

export default function LogbookHomePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState<any>(null);

  const { data: aircraftData, isLoading } = useQuery({
    queryKey: ["aircrafts"],
    queryFn: () => backend.operations.getAircrafts()
  });

  const createAircraftMutation = useMutation({
    mutationFn: (data: any) => backend.operations.createAircraft(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aircrafts"] });
      toast({ title: "Sucesso", description: "Aeronave criada com sucesso!" });
      setIsModalOpen(false);
    },
    onError: (error) => {
      console.error("Error creating aircraft:", error);
      toast({ title: "Erro", description: "Erro ao criar aeronave.", variant: "destructive" });
    }
  });

  const updateAircraftMutation = useMutation({
    mutationFn: (data: any) => backend.operations.updateAircraft(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aircrafts"] });
      toast({ title: "Sucesso", description: "Aeronave atualizada com sucesso!" });
      setIsModalOpen(false);
    },
    onError: (error) => {
      console.error("Error updating aircraft:", error);
      toast({ title: "Erro", description: "Erro ao atualizar aeronave.", variant: "destructive" });
    }
  });

  const deleteAircraftMutation = useMutation({
    mutationFn: (id: string) => backend.operations.deleteAircraft({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aircrafts"] });
      toast({ title: "Sucesso", description: "Aeronave excluída com sucesso!" });
    },
    onError: (error) => {
      console.error("Error deleting aircraft:", error);
      toast({ title: "Erro", description: "Erro ao excluir aeronave.", variant: "destructive" });
    }
  });

  const handleSaveAircraft = (data: any) => {
    if (editingAircraft) {
      updateAircraftMutation.mutate(data);
    } else {
      createAircraftMutation.mutate(data);
    }
  };

  const handleDeleteAircraft = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja excluir esta aeronave?")) {
      deleteAircraftMutation.mutate(id);
    }
  };

  const openModal = (e: React.MouseEvent | null, aircraft = null) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEditingAircraft(aircraft);
    setIsModalOpen(true);
  };

  const aircrafts = aircraftData?.aircraft || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "maintenance": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "inactive": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Ativa";
      case "maintenance": return "Manutenção";
      case "inactive": return "Inativa";
      default: return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Diários de Bordo"
        description="Gerencie os diários de bordo digitais das aeronaves."
        backPath="/"
      >
        <Button onClick={() => openModal(null)} className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Aeronave
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-slate-700 rounded animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aircrafts.map(aircraft => (
            <Link to={`/operations/logbook/${aircraft.registration}`} key={aircraft.id} className="relative group">
              <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800 hover:border-cyan-500/50 transition-all h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3">
                        <Plane className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-xl font-bold text-white">{aircraft.registration}</h3>
                      </div>
                      <p className="text-slate-400 text-sm">{aircraft.model}</p>
                    </div>
                    <Badge className={getStatusColor(aircraft.status)}>
                      {getStatusLabel(aircraft.status)}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-4 h-4" />
                      <span>Diário {new Date().getFullYear()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="w-4 h-4" />
                      <span>{aircraft.total_hours.toFixed(1).replace('.', ',')} horas totais</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-slate-800/50 hover:bg-slate-700" onClick={(e) => openModal(e, aircraft)}>
                  <Edit className="w-4 h-4 text-slate-300" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-slate-800/50 hover:bg-slate-700" onClick={(e) => handleDeleteAircraft(e, aircraft.id)}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isModalOpen && (
        <AircraftFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveAircraft}
          aircraft={editingAircraft}
        />
      )}
    </div>
  );
}
