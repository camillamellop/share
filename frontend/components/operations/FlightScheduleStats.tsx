import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Clock, CheckCircle, XCircle, Plane } from "lucide-react";
import backend from "~backend/client";

export default function FlightScheduleStats() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["flightScheduleStats"],
    queryFn: () => backend.operations.getFlightScheduleStats({})
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-slate-700 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!statsData) return null;

  const stats = [
    {
      title: "Total",
      value: statsData.total,
      icon: CalendarCheck,
      color: "text-cyan-400"
    },
    {
      title: "Pendentes",
      value: statsData.pendente,
      icon: Clock,
      color: "text-yellow-400"
    },
    {
      title: "Confirmados",
      value: statsData.confirmado,
      icon: CheckCircle,
      color: "text-green-400"
    },
    {
      title: "Realizados",
      value: statsData.realizado,
      icon: Plane,
      color: "text-blue-400"
    },
    {
      title: "Cancelados",
      value: statsData.cancelado,
      icon: XCircle,
      color: "text-red-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
