import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, AlertTriangle, X, Plus, CheckCircle, Clock, XCircle } from "lucide-react";
import VacationRequestModal from "./VacationRequestModal";
import { useBackend } from "../../hooks/useBackend";
import type { CreateVacationRequestRequest } from "~backend/vacation/vacation-management";
import PageHeader from "../PageHeader";

export default function VacationPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const backend = useBackend();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ["vacationBalance"],
    queryFn: () => backend.vacation.getMyVacationBalance()
  });

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ["vacationRequests"],
    queryFn: () => backend.vacation.getMyVacationRequests()
  });

  const createRequestMutation = useMutation({
    mutationFn: (data: CreateVacationRequestRequest) => backend.vacation.createVacationRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacationRequests"] });
      queryClient.invalidateQueries({ queryKey: ["vacationBalance"] });
      toast({
        title: "Sucesso",
        description: "Solicitação de férias enviada com sucesso!",
      });
      setIsModalOpen(false);
    },
    onError: (error) => {
      console.error("Error creating vacation request:", error);
      toast({
        title: "Erro",
        description: "Erro ao solicitar férias.",
        variant: "destructive",
      });
    }
  });

  const deleteRequestMutation = useMutation({
    mutationFn: (id: string) => backend.vacation.deleteVacationRequest({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacationRequests"] });
      queryClient.invalidateQueries({ queryKey: ["vacationBalance"] });
      toast({
        title: "Sucesso",
        description: "Solicitação cancelada com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error deleting vacation request:", error);
      toast({
        title: "Erro",
        description: "Erro ao cancelar solicitação.",
        variant: "destructive",
      });
    }
  });

  const handleCreateRequest = (requestData: any) => {
    createRequestMutation.mutate({
      start_date: new Date(requestData.start_date),
      end_date: new Date(requestData.end_date),
      type: requestData.type,
      notes: requestData.notes
    });
  };

  const handleDeleteRequest = (id: string) => {
    if (window.confirm('Tem certeza que deseja cancelar esta solicitação?')) {
      deleteRequestMutation.mutate(id);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "rejected": return <XCircle className="w-4 h-4 text-red-400" />;
      case "pending": return <Clock className="w-4 h-4 text-yellow-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "rejected": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved": return "Aprovado";
      case "rejected": return "Rejeitado";
      case "pending": return "Pendente";
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "regulares": return "Férias Regulares";
      case "premio": return "Férias Prêmio";
      case "coletivas": return "Férias Coletivas";
      default: return type;
    }
  };

  if (balanceLoading || requestsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  const balance = balanceData?.balance;
  const requests = requestsData?.requests || [];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Extrato de Férias"
        description="Gerencie suas férias e solicitações."
        backPath="/"
      >
        <Button onClick={() => setIsModalOpen(true)} className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="w-4 h-4 mr-2" />
          Solicitar Férias
        </Button>
      </PageHeader>

      {balance && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Dias Disponíveis</p>
                  <p className="text-2xl font-bold text-green-400">{balance.available_days}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">A Vencer</p>
                  <p className="text-2xl font-bold text-yellow-400">{balance.expiring_days}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Dias Vencidos</p>
                  <p className="text-2xl font-bold text-red-400">{balance.expired_days}</p>
                </div>
                <X className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Dias Utilizados</p>
                  <p className="text-2xl font-bold text-blue-400">{balance.used_days}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Histórico de Solicitações</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold">
                          {getTypeLabel(request.type)}
                        </h3>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{getStatusLabel(request.status)}</span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Período:</p>
                          <p className="text-slate-300">
                            {new Date(request.start_date).toLocaleDateString('pt-BR')} até{' '}
                            {new Date(request.end_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-slate-400">Dias:</p>
                          <p className="text-slate-300 font-semibold">{request.days} dias</p>
                        </div>
                        
                        <div>
                          <p className="text-slate-400">Solicitado em:</p>
                          <p className="text-slate-300">
                            {new Date(request.requested_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      
                      {request.notes && (
                        <div className="mt-3 p-2 bg-slate-700/50 rounded">
                          <p className="text-xs text-slate-400 mb-1">Observações:</p>
                          <p className="text-sm text-slate-300">{request.notes}</p>
                        </div>
                      )}
                      
                      {request.approved_at && (
                        <div className="mt-2 text-xs text-slate-400">
                          {request.status === 'approved' ? 'Aprovado' : 'Rejeitado'} em:{' '}
                          {new Date(request.approved_at).toLocaleDateString('pt-BR')}
                          {request.approved_by && ` por ${request.approved_by}`}
                        </div>
                      )}
                    </div>
                    
                    {request.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRequest(request.id)}
                        className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white ml-4"
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">Nenhuma solicitação de férias encontrada.</p>
              <Button onClick={() => setIsModalOpen(true)} className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="w-4 h-4 mr-2" />
                Fazer Primeira Solicitação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {balance?.next_expiration_date && balance.expiring_days > 0 && (
        <Card className="bg-yellow-900/20 border-yellow-800/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-yellow-400 font-semibold">Atenção: Férias a vencer!</p>
                <p className="text-yellow-300 text-sm">
                  Você tem {balance.expiring_days} dias de férias que vencem em{' '}
                  {new Date(balance.next_expiration_date).toLocaleDateString('pt-BR')}.
                  Solicite suas férias o quanto antes para não perdê-las.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isModalOpen && (
        <VacationRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleCreateRequest}
          availableDays={balance?.available_days || 0}
        />
      )}
    </div>
  );
}
