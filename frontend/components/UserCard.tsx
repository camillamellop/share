import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Calendar, FileText, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useBackend } from "../hooks/useBackend";
import { useQuery } from "@tanstack/react-query";

export default function UserCard() {
  const { user } = useAuth();
  const backend = useBackend();

  const { data: vacationData, isLoading: vacationLoading } = useQuery({
    queryKey: ["vacationBalance", user?.userID],
    queryFn: () => backend.vacation.getMyVacationBalance(),
    enabled: !!user,
  });

  if (!user) {
    return (
      <Card className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 hover:border-cyan-500/50 transition-colors">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="w-16 h-16 bg-slate-700 rounded-full mx-auto"></div>
            <div className="h-4 bg-slate-700 rounded w-3/4 mx-auto"></div>
            <div className="h-3 bg-slate-700 rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const vacationBalance = vacationData?.balance;

  const getVacationSummary = () => {
    if (vacationLoading) return { text: "Carregando...", color: "text-slate-400", icon: Calendar, urgent: false };
    if (!vacationBalance) return null;

    if (vacationBalance.expiring_days > 0) {
      return {
        text: `${vacationBalance.expiring_days} dias a vencer`,
        color: "text-yellow-400",
        icon: AlertTriangle,
        urgent: true
      };
    }

    if (vacationBalance.available_days > 0) {
      return {
        text: `${vacationBalance.available_days} dias disponíveis`,
        color: "text-green-400",
        icon: Calendar,
        urgent: false
      };
    }

    return null;
  };

  const vacationSummary = getVacationSummary();

  return (
    <Card className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 hover:border-cyan-500/50 transition-colors">
      <CardHeader className="text-center pb-4">
        <Link to="/profile" className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden block cursor-pointer group">
          <div className="w-full h-full bg-cyan-500 flex items-center justify-center group-hover:bg-cyan-600 transition-colors">
            <User className="w-8 h-8 text-white" />
          </div>
        </Link>
        <CardTitle className="text-white text-lg">Meu Perfil</CardTitle>
        <p className="text-slate-400 text-sm">{user.name}</p>
        <p className="text-slate-500 text-xs capitalize">{user.role}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {vacationSummary && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Férias</span>
              <vacationSummary.icon className={`w-4 h-4 ${vacationSummary.color}`} />
            </div>
            <div className={`font-semibold ${vacationSummary.color}`}>
              {vacationSummary.text}
            </div>
            {vacationBalance?.next_expiration_date && vacationSummary.urgent && (
              <div className="text-slate-400 text-xs mt-1">
                Vence em: {new Date(vacationBalance.next_expiration_date).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        )}

        {!vacationSummary && !vacationLoading && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Férias</span>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-slate-400 text-sm">
              Clique para verificar
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start text-slate-300 bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 hover:text-white backdrop-blur-sm" asChild>
            <Link to="/profile">
              <User className="w-4 h-4 mr-2" />
              Meu Perfil
            </Link>
          </Button>
          
          <Button variant="ghost" className="w-full justify-start text-slate-300 bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 hover:text-white backdrop-blur-sm" asChild>
            <Link to="/vacation">
              <Calendar className="w-4 h-4 mr-2" />
              Férias
            </Link>
          </Button>
          
          <Button variant="ghost" className="w-full justify-start text-slate-300 bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 hover:text-white backdrop-blur-sm" asChild>
            <Link to="/profile">
              <FileText className="w-4 h-4 mr-2" />
              Docs
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
