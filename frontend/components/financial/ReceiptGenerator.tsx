import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Receipt, Printer, FileText } from "lucide-react";
import { useBackend } from "../../hooks/useBackend";
import type { CreateReceiptRequest } from "~backend/financial/receipts";
import PageHeader from "../PageHeader";
import PrintableReceipt from "./PrintableReceipt";

export default function ReceiptGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const backend = useBackend();

  const [form, setForm] = useState<CreateReceiptRequest>({
    cliente_nome: '',
    cliente_cpf_cnpj: '',
    cliente_endereco: '',
    descricao: '',
    valor: 0,
    data_emissao: new Date(),
    observacoes: '',
  });

  const [generatedReceipt, setGeneratedReceipt] = useState<any>(null);
  const [showPrintView, setShowPrintView] = useState(false);

  // Load clients for selection
  const { data: clientsData } = useQuery({
    queryKey: ["clients"],
    queryFn: () => backend.agenda.getClients()
  });

  const createReceiptMutation = useMutation({
    mutationFn: (data: CreateReceiptRequest) => backend.financial.createReceipt(data),
    onSuccess: (receipt) => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      setGeneratedReceipt(receipt);
      toast({
        title: "Sucesso",
        description: "Recibo gerado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error creating receipt:", error);
      toast({
        title: "Erro",
        description: "Erro ao gerar recibo.",
        variant: "destructive",
      });
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ 
      ...form, 
      [name]: name === 'valor' ? parseFloat(value) || 0 : 
               name === 'data_emissao' ? new Date(value) : value 
    });
  };

  const handleClientSelect = (clientId: string) => {
    const client = clientsData?.clients?.find(c => c.id === clientId);
    if (client) {
      setForm({
        ...form,
        cliente_nome: client.name,
        cliente_cpf_cnpj: client.document || '',
        cliente_endereco: client.address || ''
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReceiptMutation.mutate(form);
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

  if (showPrintView && generatedReceipt) {
    return <PrintableReceipt receipt={generatedReceipt} />;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Gerador de Recibos"
        description="Crie e emita recibos para clientes e serviços."
        backPath="/"
      />
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-cyan-400" />
              <span>Gerar Recibo</span>
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
                  <Label htmlFor="cliente_nome" className="text-slate-300">Nome do Pagador *</Label>
                  <Input
                    id="cliente_nome"
                    name="cliente_nome"
                    value={form.cliente_nome}
                    onChange={handleChange}
                    required
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente_cpf_cnpj" className="text-slate-300">CPF/CNPJ</Label>
                  <Input
                    id="cliente_cpf_cnpj"
                    name="cliente_cpf_cnpj"
                    value={form.cliente_cpf_cnpj}
                    onChange={handleChange}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="cliente_endereco" className="text-slate-300">Endereço</Label>
                  <Input
                    id="cliente_endereco"
                    name="cliente_endereco"
                    value={form.cliente_endereco}
                    onChange={handleChange}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descricao" className="text-slate-300">Descrição *</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  value={form.descricao}
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
                  <Label htmlFor="data_emissao" className="text-slate-300">Data de Emissão *</Label>
                  <Input
                    id="data_emissao"
                    name="data_emissao"
                    type="date"
                    value={form.data_emissao.toISOString().split('T')[0]}
                    onChange={handleChange}
                    required
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes" className="text-slate-300">Observações</Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  value={form.observacoes}
                  onChange={handleChange}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-between items-center">
                <Button
                  type="submit"
                  disabled={createReceiptMutation.isPending}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {createReceiptMutation.isPending ? 'Gerando...' : 'Gerar Recibo'}
                </Button>
                {generatedReceipt && (
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
