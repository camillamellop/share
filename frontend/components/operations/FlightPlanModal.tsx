import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { X, Route, Calculator, Cloud, Star, Loader2 } from "lucide-react";
import backend from "~backend/client";

interface FlightPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: any) => void;
  plan?: any;
  favoriteRoutes: any[];
}

export default function FlightPlanModal({ isOpen, onClose, onSave, plan, favoriteRoutes }: FlightPlanModalProps) {
  const { toast } = useToast();

  const [form, setForm] = useState({
    flight_number: '',
    aircraft: '',
    departure_airport: '',
    arrival_airport: '',
    departure_time: '',
    route: '',
    altitude: 10000,
    payload: 400,
    speed_kts: 110,
  });

  const [calculations, setCalculations] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);

  const { data: aircraftData } = useQuery({
    queryKey: ["aircrafts"],
    queryFn: () => backend.operations.getAircrafts()
  });

  useEffect(() => {
    if (plan) {
      setForm({
        flight_number: plan.flight_number || '',
        aircraft: plan.aircraft || '',
        departure_airport: plan.departure_airport || '',
        arrival_airport: plan.arrival_airport || '',
        departure_time: plan.departure_time ? new Date(plan.departure_time).toISOString().slice(0, 16) : '',
        route: plan.route || '',
        altitude: plan.altitude || 10000,
        payload: plan.weight_balance?.payload || 400,
        speed_kts: 110, // Speed is not stored in plan yet, so use default
      });
    } else {
      setForm({
        flight_number: '',
        aircraft: '',
        departure_airport: '',
        arrival_airport: '',
        departure_time: '',
        route: '',
        altitude: 10000,
        payload: 400,
        speed_kts: 110,
      });
    }
  }, [plan]);

  const calculateFlightParamsMutation = useMutation({
    mutationFn: (data: { departure_icao: string; arrival_icao: string; aircraft_registration: string; speed_kts: number }) => 
      backend.operations.calculateFlightParameters(data),
    onSuccess: (data) => {
      setCalculations(data);
    },
    onError: (error) => {
      console.error("Error calculating flight parameters:", error);
      toast({
        title: "Erro",
        description: "Erro ao calcular parâmetros de voo.",
        variant: "destructive",
      });
    }
  });

  const getWeatherMutation = useMutation({
    mutationFn: (data: { departure: string; arrival: string }) => 
      backend.operations.getWeatherForRoute(data),
    onSuccess: (data) => {
      setWeatherData(data.weather);
    },
    onError: (error) => {
      console.error("Error getting weather:", error);
      toast({
        title: "Erro",
        description: "Erro ao obter dados meteorológicos.",
        variant: "destructive",
      });
    }
  });

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    if (form.departure_airport && form.arrival_airport && form.aircraft && form.speed_kts > 0) {
      calculateFlightParamsMutation.mutate({
        departure_icao: form.departure_airport,
        arrival_icao: form.arrival_airport,
        aircraft_registration: form.aircraft,
        speed_kts: form.speed_kts
      });
      getWeatherMutation.mutate({
        departure: form.departure_airport,
        arrival: form.arrival_airport
      });
    } else {
      toast({
        title: "Atenção",
        description: "Preencha os campos de partida, chegada, aeronave e velocidade.",
        variant: "destructive",
      });
    }
  };

  const handleUseFavoriteRoute = (route: any) => {
    setForm(prev => ({
      ...prev,
      departure_airport: route.departure_airport,
      arrival_airport: route.arrival_airport,
      route: route.route,
      altitude: route.altitude
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const planData = {
      ...form,
      departure_time: new Date(form.departure_time),
    };

    onSave(planData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-2 sm:p-4 pt-4 sm:pt-8">
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-4xl xl:max-w-6xl max-h-[98vh] sm:max-h-[95vh] flex flex-col bg-slate-900 border-slate-800 my-auto mx-2 sm:mx-4">
        <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
          <CardTitle className="text-white flex items-center space-x-2">
            <Route className="w-5 h-5 text-cyan-400" />
            <span>{plan ? 'Editar Plano de Voo' : 'Novo Plano de Voo'}</span>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-y-auto flex-1 p-4 sm:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="aircraft" className="text-slate-300 text-xs">Aeronave</Label>
                    <Select value={form.aircraft} onValueChange={(value) => handleChange('aircraft', value)}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="TAIL #" /></SelectTrigger>
                      <SelectContent>
                        {aircraftData?.aircraft?.map((ac) => (
                          <SelectItem key={ac.id} value={ac.registration}>{ac.registration}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="speed_kts" className="text-slate-300 text-xs">Spd (kts)</Label>
                    <Input id="speed_kts" type="number" value={form.speed_kts} onChange={(e) => handleChange('speed_kts', parseInt(e.target.value) || 0)} className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="altitude" className="text-slate-300 text-xs">Alt (ft)</Label>
                    <Input id="altitude" type="number" value={form.altitude} onChange={(e) => handleChange('altitude', parseInt(e.target.value) || 0)} className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="payload" className="text-slate-300 text-xs">Payload (kg)</Label>
                    <Input id="payload" type="number" value={form.payload} onChange={(e) => handleChange('payload', parseInt(e.target.value) || 0)} className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="departure_airport" className="text-slate-300 text-xs">Partida (ICAO)</Label>
                    <Input id="departure_airport" value={form.departure_airport} onChange={(e) => handleChange('departure_airport', e.target.value.toUpperCase())} required className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="arrival_airport" className="text-slate-300 text-xs">Destino (ICAO)</Label>
                    <Input id="arrival_airport" value={form.arrival_airport} onChange={(e) => handleChange('arrival_airport', e.target.value.toUpperCase())} required className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="departure_time" className="text-slate-300 text-xs">ETD (Local)</Label>
                  <Input id="departure_time" type="datetime-local" value={form.departure_time} onChange={(e) => handleChange('departure_time', e.target.value)} required className="bg-slate-800 border-slate-700 text-white" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate-400 text-xs">Dist (NM)</Label>
                    <Input value={calculations?.distance_nm || ''} readOnly className="bg-slate-700 border-slate-600 text-white" />
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs">ETE (min)</Label>
                    <Input value={calculations?.ete_minutes || ''} readOnly className="bg-slate-700 border-slate-600 text-white" />
                  </div>
                  <div>
                    <Label className="text-slate-400 text-xs">Burn (L)</Label>
                    <Input value={calculations?.fuel_burn_liters || ''} readOnly className="bg-slate-700 border-slate-600 text-white" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="route" className="text-slate-300 text-xs">Rota</Label>
                  <Textarea id="route" value={form.route} onChange={(e) => handleChange('route', e.target.value)} className="bg-slate-800 border-slate-700 text-white" placeholder="Ex: SBSP DCT ARAXÁ DCT SBRJ" />
                </div>

                <div className="flex justify-between items-center pt-4">
                  <Button type="button" variant="outline" onClick={handleCalculate} disabled={calculateFlightParamsMutation.isPending}>
                    {calculateFlightParamsMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calculator className="w-4 h-4 mr-2" />}
                    Calcular
                  </Button>
                  <div className="flex space-x-2">
                    <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                      {plan ? 'Atualizar' : 'Criar'} Plano
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              {favoriteRoutes.length > 0 && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center">
                      <Star className="w-4 h-4 mr-2 text-yellow-400" />
                      Rotas Favoritas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {favoriteRoutes.slice(0, 3).map((route) => (
                      <Button key={route.id} variant="outline" size="sm" onClick={() => handleUseFavoriteRoute(route)} className="w-full justify-start text-left text-xs">
                        <div>
                          <div className="font-semibold">{route.name}</div>
                          <div className="text-slate-400">{route.departure_airport} → {route.arrival_airport}</div>
                        </div>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              )}

              {weatherData && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center">
                      <Cloud className="w-4 h-4 mr-2 text-blue-400" />
                      Meteorologia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <div className="text-slate-400 mb-1">Partida ({weatherData.departure_weather.airport_code})</div>
                      <div className="text-white">{weatherData.departure_weather.temperature}°C, {weatherData.departure_weather.conditions}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1">Chegada ({weatherData.arrival_weather.airport_code})</div>
                      <div className="text-white">{weatherData.arrival_weather.temperature}°C, {weatherData.arrival_weather.conditions}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
