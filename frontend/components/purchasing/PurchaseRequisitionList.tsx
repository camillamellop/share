import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

interface PurchaseRequisitionListProps {
  requisitions: any[];
  isLoading: boolean;
}

export default function PurchaseRequisitionList({ requisitions, isLoading }: PurchaseRequisitionListProps) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pendente': return { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
      case 'em_analise': return { label: 'Em Análise', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'aprovada': return { label: 'Aprovada', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
      case 'rejeitada': return { label: 'Rejeitada', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
      case 'concluida': return { label: 'Concluída', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
      default: return { label: status, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    }
  };

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'baixa': return { label: 'Baixa', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
      case 'media': return { label: 'Média', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
      case 'alta': return { label: 'Alta', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
      default: return { label: priority, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-slate-900/90 backdrop-blur-sm border-slate-800 animate-pulse">
            <CardContent className="p-4 h-32"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm">{requisitions.length} solicitações encontradas</p>
      {requisitions.map((req) => (
        <Card key={req.id} className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-slate-800 mt-1">
                <ShoppingCart className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-lg font-semibold text-white">{req.title}</h3>
                  <div className="flex gap-2">
                    <Badge className={getStatusInfo(req.status).color}>{getStatusInfo(req.status).label}</Badge>
                    <Badge className={getPriorityInfo(req.priority).color}>{getPriorityInfo(req.priority).label}</Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-3">{req.type}</p>
                <p className="text-sm text-slate-300">{req.description}</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 mt-3 gap-4">
              <span>Solicitado por: <span className="text-slate-400">{req.created_by_name}</span></span>
              <div className="flex gap-4">
                <span>Valor: <span className="text-slate-400">R$ {req.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></span>
                <span>Criado: <span className="text-slate-400">{new Date(req.created_at).toLocaleDateString('pt-BR')}</span></span>
                {req.needed_by && <span>Necessário: <span className="text-slate-400">{new Date(req.needed_by).toLocaleDateString('pt-BR')}</span></span>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
