import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { DollarSign, Printer, FileText } from "lucide-react";
import { useBackend } from "../../hooks/useBackend";
import type { CreateBillingRequest } from "~backend/financial/billing";
import PageHeader from "../PageHeader";
import PrintableBilling from "./PrintableBilling";

export default function BillingGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const backend = useBackend();

  const [form, setForm] = useState<CreateBillingRequest>({
    devedor: '',
    referencia: '',
    valor: 0,
    vencimento: new Date(),
  });

  const [generatedBilling, setGeneratedBilling] = useState<any>(null);
  const [showPrintView, setShowPrintView] = useState(false);

  // Load clients for selection
  const { data: clientsData } = useQuery({
    queryKey: ["clients"],
    queryFn: () => backend.agenda.getClients()
  });

  const createBillingMutation = useMutation({
    mutationFn: (data: CreateBillingRequest) => backend.financial.createBilling(data),
    onSuccess: (billing) => {
      queryClient.invalidateQueries({ queryKey: ["billingDocuments"] });
      setGeneratedBilling(billing);
      toast({
        title: "Sucesso",
        description: "Documento de cobrança gerado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error creating billing:", error);
      toast({
        title: "Erro",
        description: "Erro ao gerar documento de cobrança.",
        variant: "destructive",
      });
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ 
      ...form, 
      [name]: name === 'valor' ? parseFloat(value) || 0 : 
               name === 'vencimento' ? new Date(value) : value 
    });
  };

  const handleClientSelect = (clientId: string) => {
    const client = clientsData?.clients?.find(c => c.id === clientId);
    if (client) {
      setForm({
        ...form,
        devedor: client.name
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBillingMutation.mutate(form);
  };

  const handlePrint = () => {
    setShowPrintView(true);
    // Use setTimeout to ensure the print view is rendered before printing
    setTimeout(() => {
      try {
        window.print();
      } catch (error) {
        console.error("Print error:", error);
        toast({
          title: "Erro de Impressão",
          description: "Não foi possível gerar o PDF. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setShowPrintView(false);
      }
    }, 500);
  };

  if (showPrintView && generatedBilling) {
    return <PrintableBilling document={generatedBilling} />;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Gerador de Cobranças"
        description="Crie e emita documentos de cobrança para clientes."
        backPath="/"
      />
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-cyan-400" />
              <span>Gerar Documento de Cobrança</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente_select" className="text-slate-300">Selecionar Cliente</Label>
                  <Select onValueChange={handleClientSelect}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Selecione um cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clientsData?.clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} - {client.document}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="devedor" className="text-slate-300">Nome do Devedor *</Label>
                  <Input
                    id="devedor"
                    name="devedor"
                    value={form.devedor}
                    onChange={handleChange}
                    required
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="referencia" className="text-slate-300">Referência do Débito *</Label>
                <Input
                  id="referencia"
                  name="referencia"
                  value={form.referencia}
                  onChange={handleChange}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor" className="text-slate-300">Valor (R$) *</Label>
                  <Input
                    id="valor"
                    name="valor"
                    type="number"
                    step="0.01"
                    value={form.valor}
                    onChange={handleChange}
                    required
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="vencimento" className="text-slate-300">Data de Vencimento *</Label>
                  <Input
                    id="vencimento"
                    name="vencimento"
                    type="date"
                    value={form.vencimento.toISOString().split('T')[0]}
                    onChange={handleChange}
                    required
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Button
                  type="submit"
                  disabled={createBillingMutation.isPending}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {createBillingMutation.isPending ? 'Gerando...' : 'Gerar Cobrança'}
                </Button>
                {generatedBilling && (
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Gerar PDF
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
