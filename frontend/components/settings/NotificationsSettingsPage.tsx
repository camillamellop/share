import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Bell, Save } from "lucide-react";
import backend from "~backend/client";
import PageHeader from "../PageHeader";

export default function NotificationsSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [config, setConfig] = useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const { data: configData, isLoading } = useQuery({
    queryKey: ["operationsConfig"],
    queryFn: () => backend.operations.getOperationsConfig()
  });

  const saveConfigMutation = useMutation({
    mutationFn: (data: any) => backend.operations.saveOperationsConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operationsConfig"] });
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error saving config:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (configData?.config) {
      setConfig(configData.config);
      setNotificationsEnabled(configData.config.notifications?.enabled ?? true);
    }
  }, [configData]);

  const handleSave = () => {
    if (!config) return;

    const updatedConfig = {
      ...config,
      notifications: {
        ...config.notifications,
        enabled: notificationsEnabled,
      },
    };
    
    const { id, created_at, updated_at, ...saveData } = updatedConfig;

    saveConfigMutation.mutate(saveData);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="h-48 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Configurações de Notificação"
        description="Gerencie as configurações gerais do sistema."
        backPath="/"
      >
        <Button onClick={handleSave} disabled={saveConfigMutation.isPending} className="bg-cyan-600 hover:bg-cyan-700">
          <Save className="w-4 h-4 mr-2" />
          Salvar Alterações
        </Button>
      </PageHeader>

      <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <span>Notificações</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications-switch" className="text-slate-300">
                Ativar notificações do sistema
              </Label>
              <p className="text-sm text-slate-400">
                Receba alertas sobre vencimentos, agendamentos e outras informações importantes.
              </p>
            </div>
            <Switch
              id="notifications-switch"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
