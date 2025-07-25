import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Wrench, CalendarCheck, Route, BookOpen, BarChart3, UserCog } from "lucide-react";
import { Link } from "react-router-dom";

const operationsLinks = [
  { icon: CalendarCheck, label: "Agendamento", path: "/operations/scheduling" },
  { icon: Route, label: "Plano de Voo", path: "/operations/flight-plan" },
  { icon: BookOpen, label: "Diário de Bordo", path: "/operations/logbook" },
  { icon: BarChart3, label: "Relatório Tripulação", path: "/operations/crew-report" },
  { icon: UserCog, label: "Gestão de Tripulação", path: "/operations/crew-management" }
];

const maintenanceLinks = [
  { icon: Wrench, label: "Controle de Vencimentos", path: "/maintenance" },
];

export default function OperationsMaintenanceMenu() {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 hover:border-cyan-500/50 transition-colors">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Plane className="w-5 h-5 text-cyan-400" />
            <span>Operações de Voo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {operationsLinks.map((link, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start text-slate-300 bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 hover:text-white backdrop-blur-sm"
              asChild
            >
              <Link to={link.path}>
                <link.icon className="w-4 h-4 mr-2" />
                {link.label}
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 hover:border-cyan-500/50 transition-colors">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-yellow-400" />
            <span>Manutenção</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {maintenanceLinks.map((link, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start text-slate-300 bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 hover:text-white backdrop-blur-sm"
              asChild
            >
              <Link to={link.path}>
                <link.icon className="w-4 h-4 mr-2" />
                {link.label}
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
