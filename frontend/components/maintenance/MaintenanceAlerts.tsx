import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Plane, User } from "lucide-react";
import backend from "~backend/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function MaintenanceAlerts() {
  const { data, isLoading } = useQuery({
    queryKey: ["maintenanceAlerts"],
    queryFn: () => backend.maintenance.getDashboardAlerts({ days: 30 })
  });

  if (isLoading) {
    return (
      <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800 animate-pulse">
        <CardContent className="p-4 h-24"></CardContent>
      </Card>
    );
  }

  if (!data || data.count === 0) {
    return null; // Don't show the card if there are no alerts
  }

  return (
    <Card className="bg-yellow-900/20 border border-yellow-800/30">
      <CardHeader>
        <CardTitle className="text-yellow-300 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <span>Alertas de Manutenção</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-yellow-200">
          {data.count} item(ns) com vencimento nos próximos 30 dias.
        </p>
        <div className="space-y-2">
          {data.alerts.slice(0, 3).map(alert => (
            <div key={alert.id} className="flex items-center justify-between text-sm bg-yellow-900/30 p-2 rounded-md">
              <div className="flex items-center space-x-2">
                {alert.type === 'crew' ? <User className="w-4 h-4 text-yellow-400" /> : <Plane className="w-4 h-4 text-yellow-400" />}
                <span className="text-yellow-200">{alert.name} - {alert.item_type}</span>
              </div>
              <span className="text-yellow-300 font-semibold">
                Vence em {alert.days_remaining} dias
              </span>
            </div>
          ))}
        </div>
        <Link to="/maintenance">
          <Button variant="outline" className="w-full mt-2 text-yellow-300 border-yellow-700 hover:bg-yellow-800/50">
            Ver todos os vencimentos
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
