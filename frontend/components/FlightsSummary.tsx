import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, MapPin, Clock } from "lucide-react";
import backend from "~backend/client";

export default function FlightsSummary() {
  const { data, isLoading } = useQuery({
    queryKey: ["scheduledFlights"],
    queryFn: () => backend.dashboard.getScheduledFlights()
  });

  if (isLoading) {
    return (
      <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Voos Agendados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "boarding": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "departed": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "delayed": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "cancelled": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled": return "Agendado";
      case "boarding": return "Embarque";
      case "departed": return "Partiu";
      case "delayed": return "Atrasado";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  };

  return (
    <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          Voos Agendados
          <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
            {data.flights.length} hoje
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.flights.slice(0, 3).map((flight) => (
          <div
            key={flight.id}
            className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Plane className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-medium">{flight.flightNumber}</span>
              </div>
              <Badge className={getStatusColor(flight.status)}>
                {getStatusLabel(flight.status)}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span className="text-slate-300">{flight.departure.airport}</span>
                <span className="text-slate-500">→</span>
                <span className="text-slate-300">{flight.arrival.airport}</span>
              </div>
              {flight.gate && (
                <span className="text-slate-400">Portão {flight.gate}</span>
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-slate-400">
                <Clock className="w-3 h-3" />
                <span>
                  {new Date(flight.departure.time).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} - {new Date(flight.arrival.time).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <span className="text-slate-500">{flight.aircraft}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
