import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Building2, Save } from "lucide-react";
import backend from "~backend/client";
import type { CreateCompanyConfigRequest } from "~backend/financial/company-config";
import PageHeader from "../PageHeader";

export default function CompanyConfigPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<CreateCompanyConfigRequest>({
    nome: '',
    cnpj: '',
    endereco: '',
    telefone: '',
    email: '',
    logotipo_url: '',
  });

  const { data: companyConfigResponse, isLoading } = useQuery({
    queryKey: ["companyConfig"],
    queryFn: () => backend.financial.getCompanyConfig()
  });

  const saveConfigMutation = useMutation({
    mutationFn: (data: CreateCompanyConfigRequest) => backend.financial.saveCompanyConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companyConfig"] });
      toast({
        title: "Sucesso",
        description: "Configuração da empresa salva com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error saving company config:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração da empresa.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (companyConfigResponse?.config) {
      const config = companyConfigResponse.config;
      setForm({
        nome: config.nome,
        cnpj: config.cnpj || '',
        endereco: config.endereco || '',
        telefone: config.telefone || '',
        email: config.email || '',
        logotipo_url: config.logotipo_url || '',
      });
    }
  }, [companyConfigResponse]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfigMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="h-96 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Configuração da Empresa"
        description="Defina os dados da sua empresa para emissão de documentos."
        backPath="/"
      />
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              <span>Dados da Empresa</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome" className="text-slate-300">Nome da Empresa *</Label>
                <Input
                  id="nome"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="cnpj" className="text-slate-300">CNPJ</Label>
                <Input
                  id="cnpj"
                  name="cnpj"
                  value={form.cnpj}
                  onChange={handleChange}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="endereco" className="text-slate-300">Endereço</Label>
                <Input
                  id="endereco"
                  name="endereco"
                  value={form.endereco}
                  onChange={handleChange}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="telefone" className="text-slate-300">Telefone</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  value={form.telefone}
                  onChange={handleChange}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="logotipo_url" className="text-slate-300">URL do Logotipo</Label>
                <Input
                  id="logotipo_url"
                  name="logotipo_url"
                  value={form.logotipo_url}
                  onChange={handleChange}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <Button
                type="submit"
                disabled={saveConfigMutation.isPending}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveConfigMutation.isPending ? 'Salvando...' : 'Salvar Configuração'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
