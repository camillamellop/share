import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { X, Star, Plus, Trash2, Route } from "lucide-react";
import backend from "~backend/client";
import type { CreateFavoriteRouteRequest } from "~backend/operations/flight-planning";

interface FavoriteRoutesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FavoriteRoutesModal({ isOpen, onClose }: FavoriteRoutesModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateFavoriteRouteRequest>({
    name: '',
    departure_airport: '',
    arrival_airport: '',
    route: '',
    altitude: 10000,
    estimated_time: 0,
    distance: 0,
  });

  const { data: routesData, isLoading } = useQuery({
    queryKey: ["favoriteRoutes"],
    queryFn: () => backend.operations.getFavoriteRoutes()
  });

  const createRouteMutation = useMutation({
    mutationFn: (data: CreateFavoriteRouteRequest) => backend.operations.createFavoriteRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favoriteRoutes"] });
      toast({
        title: "Sucesso",
        description: "Rota favorita criada com sucesso!",
      });
      setShowForm(false);
      setForm({
        name: '',
        departure_airport: '',
        arrival_airport: '',
        route: '',
        altitude: 10000,
        estimated_time: 0,
        distance: 0,
      });
    },
    onError: (error) => {
      console.error("Error creating favorite route:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar rota favorita.",
        variant: "destructive",
      });
    }
  });

  const deleteRouteMutation = useMutation({
    mutationFn: (id: string) => backend.operations.deleteFavoriteRoute({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favoriteRoutes"] });
      toast({
        title: "Sucesso",
        description: "Rota favorita excluída com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error deleting favorite route:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir rota favorita.",
        variant: "destructive",
      });
    }
  });

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRouteMutation.mutate(form);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta rota favorita?')) {
      deleteRouteMutation.mutate(id);
    }
  };

  if (!isOpen) return null;

  const routes = routesData?.routes || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span>Rotas Favoritas</span>
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowForm(!showForm)} 
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Rota
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {showForm && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Nova Rota Favorita</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-slate-300">Nome da Rota *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="Ex: São Paulo - Rio de Janeiro"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="departure_airport" className="text-slate-300">Aeroporto de Partida *</Label>
                      <Input
                        id="departure_airport"
                        value={form.departure_airport}
                        onChange={(e) => handleChange('departure_airport', e.target.value)}
                        required
                        className="bg-slate-800 border-slate-700 text-white"
                        placeholder="Ex: SBSP"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="arrival_airport" className="text-slate-300">Aeroporto de Chegada *</Label>
                      <Input
                        id="arrival_airport"
                        value={form.arrival_airport}
                        onChange={(e) => handleChange('arrival_airport', e.target.value)}
                        required
                        className="bg-slate-800 border-slate-700 text-white"
                        placeholder="Ex: SBRJ"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="route" className="text-slate-300">Rota *</Label>
                    <Input
                      id="route"
                      value={form.route}
                      onChange={(e) => handleChange('route', e.target.value)}
                      required
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="Ex: SBSP DCT ARAXÁ DCT SBRJ"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="altitude" className="text-slate-300">Altitude (ft) *</Label>
                      <Input
                        id="altitude"
                        type="number"
                        value={form.altitude}
                        onChange={(e) => handleChange('altitude', parseInt(e.target.value) || 0)}
                        required
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="distance" className="text-slate-300">Distância (km) *</Label>
                      <Input
                        id="distance"
                        type="number"
                        value={form.distance}
                        onChange={(e) => handleChange('distance', parseInt(e.target.value) || 0)}
                        required
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="estimated_time" className="text-slate-300">Tempo Estimado (min) *</Label>
                      <Input
                        id="estimated_time"
                        type="number"
                        value={form.estimated_time}
                        onChange={(e) => handleChange('estimated_time', parseInt(e.target.value) || 0)}
                        required
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                      Salvar Rota
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-slate-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : routes.length > 0 ? (
            <div className="space-y-4">
              {routes.map((route) => (
                <Card key={route.id} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Route className="w-4 h-4 text-cyan-400" />
                          <h3 className="text-white font-semibold">{route.name}</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-slate-400">Rota:</p>
                            <p className="text-slate-300 font-semibold">
                              {route.departure_airport} → {route.arrival_airport}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-slate-400">Altitude:</p>
                            <p className="text-slate-300">{route.altitude} ft</p>
                          </div>
                          
                          <div>
                            <p className="text-slate-400">Distância:</p>
                            <p className="text-slate-300">{route.distance} km</p>
                          </div>
                          
                          <div>
                            <p className="text-slate-400">Tempo:</p>
                            <p className="text-slate-300">{route.estimated_time} min</p>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-slate-400 text-xs">Waypoints:</p>
                          <p className="text-slate-300 text-xs">{route.route}</p>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(route.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">Nenhuma rota favorita encontrada.</p>
              <Button onClick={() => setShowForm(true)} className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Rota
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
