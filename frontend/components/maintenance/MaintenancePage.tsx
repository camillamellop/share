import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, User, Plane } from "lucide-react";
import MaintenanceModal from "./MaintenanceModal";
import backend from "~backend/client";
import PageHeader from "../PageHeader";

export default function MaintenancePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'crew' | 'aircraft'>('crew');
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["allExpirations"],
    queryFn: () => backend.maintenance.listAllExpirations()
  });

  const createCrewExpMutation = useMutation({
    mutationFn: (data: any) => backend.maintenance.createCrewExpiration(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allExpirations"] }),
  });
  const updateCrewExpMutation = useMutation({
    mutationFn: (data: any) => backend.maintenance.updateCrewExpiration(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allExpirations"] }),
  });
  const deleteCrewExpMutation = useMutation({
    mutationFn: (id: string) => backend.maintenance.deleteCrewExpiration({ id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allExpirations"] }),
  });

  const createAircraftInspMutation = useMutation({
    mutationFn: (data: any) => backend.maintenance.createAircraftInspection(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allExpirations"] }),
  });
  const updateAircraftInspMutation = useMutation({
    mutationFn: (data: any) => backend.maintenance.updateAircraftInspection(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allExpirations"] }),
  });
  const deleteAircraftInspMutation = useMutation({
    mutationFn: (id: string) => backend.maintenance.deleteAircraftInspection({ id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allExpirations"] }),
  });

  const handleSave = (itemData: any) => {
    const { type, ...data } = itemData;
    const mutation = itemData.id 
      ? (type === 'crew' ? updateCrewExpMutation : updateAircraftInspMutation)
      : (type === 'crew' ? createCrewExpMutation : createAircraftInspMutation);
    
    mutation.mutate(data, {
      onSuccess: () => {
        toast({ title: "Sucesso", description: "Item salvo com sucesso!" });
        setIsModalOpen(false);
        setEditingItem(null);
      },
      onError: (error) => {
        console.error("Error saving item:", error);
        toast({ title: "Erro", description: "Erro ao salvar item.", variant: "destructive" });
      }
    });
  };

  const handleDelete = (type: 'crew' | 'aircraft', id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      const mutation = type === 'crew' ? deleteCrewExpMutation : deleteAircraftInspMutation;
      mutation.mutate(id, {
        onSuccess: () => toast({ title: "Sucesso", description: "Item excluído com sucesso!" }),
        onError: (error) => {
          console.error("Error deleting item:", error);
          toast({ title: "Erro", description: "Erro ao excluir item.", variant: "destructive" });
        }
      });
    }
  };

  const openModal = (type: 'crew' | 'aircraft', item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const getDaysRemaining = (dateStr: string) => {
    const today = new Date();
    const expirationDate = new Date(dateStr);
    const diffTime = expirationDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDateColor = (days: number) => {
    if (days < 0) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (days <= 30) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  const crewExpirations = data?.crew_expirations || [];
  const aircraftInspections = data?.aircraft_inspections || [];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Controle de Vencimentos"
        description="Gerencie os vencimentos de licenças, exames e inspeções."
        backPath="/"
      />

      <Tabs defaultValue="crew">
        <TabsList className="grid w-full grid-cols-2 bg-slate-900/90 backdrop-blur-sm border-slate-800">
          <TabsTrigger value="crew" className="text-slate-300 data-[state=active]:text-cyan-400">
            <User className="mr-2 h-4 w-4" />Tripulação
          </TabsTrigger>
          <TabsTrigger value="aircraft" className="text-slate-300 data-[state=active]:text-cyan-400">
            <Plane className="mr-2 h-4 w-4" />Aeronaves
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crew">
          <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-white">Vencimentos de Tripulação</CardTitle>
              <Button onClick={() => openModal('crew')} className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="w-4 h-4 mr-2" /> Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-slate-400">
                    <tr>
                      <th className="p-2 border-b border-slate-700">Tripulante</th>
                      <th className="p-2 border-b border-slate-700">Item</th>
                      <th className="p-2 border-b border-slate-700">Vencimento</th>
                      <th className="p-2 border-b border-slate-700">Status</th>
                      <th className="p-2 border-b border-slate-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {crewExpirations.map(item => {
                      const daysRemaining = getDaysRemaining(item.expiration_date.toString());
                      return (
                        <tr key={item.id} className="hover:bg-slate-800/50">
                          <td className="p-2 border-b border-slate-800">{item.crew_member_name}</td>
                          <td className="p-2 border-b border-slate-800">{item.item_type}</td>
                          <td className="p-2 border-b border-slate-800">{new Date(item.expiration_date).toLocaleDateString('pt-BR')}</td>
                          <td className="p-2 border-b border-slate-800">
                            <Badge className={getDateColor(daysRemaining)}>
                              {daysRemaining < 0 ? 'Vencido' : `Vence em ${daysRemaining} dias`}
                            </Badge>
                          </td>
                          <td className="p-2 border-b border-slate-800">
                            <Button variant="ghost" size="icon" onClick={() => openModal('crew', item)}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete('crew', item.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aircraft">
          <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-white">Inspeções de Aeronaves</CardTitle>
              <Button onClick={() => openModal('aircraft')} className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="w-4 h-4 mr-2" /> Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-slate-400">
                    <tr>
                      <th className="p-2 border-b border-slate-700">Aeronave</th>
                      <th className="p-2 border-b border-slate-700">Inspeção</th>
                      <th className="p-2 border-b border-slate-700">Vencimento (Data)</th>
                      <th className="p-2 border-b border-slate-700">Vencimento (Horas)</th>
                      <th className="p-2 border-b border-slate-700">Status</th>
                      <th className="p-2 border-b border-slate-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {aircraftInspections.map(item => {
                      const daysRemaining = item.next_due_date ? getDaysRemaining(item.next_due_date.toString()) : Infinity;
                      return (
                        <tr key={item.id} className="hover:bg-slate-800/50">
                          <td className="p-2 border-b border-slate-800">{item.aircraft_registration}</td>
                          <td className="p-2 border-b border-slate-800">{item.inspection_type}</td>
                          <td className="p-2 border-b border-slate-800">{item.next_due_date ? new Date(item.next_due_date).toLocaleDateString('pt-BR') : '-'}</td>
                          <td className="p-2 border-b border-slate-800">{item.next_due_hours ? `${item.next_due_hours.toFixed(1)}h` : '-'}</td>
                          <td className="p-2 border-b border-slate-800">
                            {item.next_due_date && (
                              <Badge className={getDateColor(daysRemaining)}>
                                {daysRemaining < 0 ? 'Vencido' : `Vence em ${daysRemaining} dias`}
                              </Badge>
                            )}
                          </td>
                          <td className="p-2 border-b border-slate-800">
                            <Button variant="ghost" size="icon" onClick={() => openModal('aircraft', item)}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete('aircraft', item.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isModalOpen && (
        <MaintenanceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          item={editingItem}
          type={modalType}
        />
      )}
    </div>
  );
}
