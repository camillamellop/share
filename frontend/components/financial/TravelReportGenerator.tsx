import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Printer, Plus, Trash2, Plane, AlertTriangle } from "lucide-react";
import { useBackend } from "../../hooks/useBackend";
import type { CreateTravelReportRequest, TravelExpense } from "~backend/financial/travel-reports";
import PageHeader from "../PageHeader";
import PrintableTravelReport from "./PrintableTravelReport";

export default function TravelReportGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const backend = useBackend();

  const [form, setForm] = useState<CreateTravelReportRequest>({
    cotista: '',
    aeronave: '',
    tripulante: '',
    destino: '',
    data_inicio: new Date(),
    data_fim: new Date(),
    despesas: [{ categoria: '', descricao: '', valor: 0, pago_por: '' }],
    observacoes: '',
  });

  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [showPrintView, setShowPrintView] = useState(false);

  // Load clients and crew for selection
  const { data: clientsData } = useQuery({
    queryKey: ["clients"],
    queryFn: () => backend.agenda.getClients()
  });

  const { data: crewData } = useQuery({
    queryKey: ["crewMembers"],
    queryFn: () => backend.operations.getCrewMembers()
  });

  const { data: aircraftData } = useQuery({
    queryKey: ["aircrafts"],
    queryFn: () => backend.operations.getAircrafts()
  });

  const createReportMutation = useMutation({
    mutationFn: (data: CreateTravelReportRequest) => backend.financial.createTravelReport(data),
    onSuccess: (report) => {
      queryClient.invalidateQueries({ queryKey: ["travelReports"] });
      setGeneratedReport(report);
      toast({
        title: "Sucesso",
        description: "Relatório de viagem gerado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error creating travel report:", error);
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório de viagem.",
        variant: "destructive",
      });
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ 
      ...form, 
      [name]: name.includes('data_') ? new Date(value) : value 
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleDespesaChange = (index: number, field: keyof TravelExpense, value: string | number) => {
    const newDespesas = [...form.despesas];
    newDespesas[index] = {
      ...newDespesas[index],
      [field]: field === 'valor' ? parseFloat(value as string) || 0 : value
    };
    setForm({ ...form, despesas: newDespesas });
  };

  const addDespesa = () => {
    setForm({
      ...form,
      despesas: [...form.despesas, { categoria: '', descricao: '', valor: 0, pago_por: '' }],
    });
  };

  const removeDespesa = (index: number) => {
    const newDespesas = form.despesas.filter((_, i) => i !== index);
    setForm({ ...form, despesas: newDespesas });
  };

  const calculateTotal = () => {
    return form.despesas.reduce((sum, d) => sum + (d.valor || 0), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReportMutation.mutate(form);
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

  if (showPrintView && generatedReport) {
    return <PrintableTravelReport report={generatedReport} />;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Gerador de Relatórios de Viagem"
        description="Crie e emita relatórios de despesas de viagem."
        backPath="/"
      />
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Plane className="w-5 h-5 text-cyan-400" />
              <span>Relatório de Viagem</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-900/20 border border-yellow-800/30 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-yellow-300 mb-2 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Regras para Lançamento de Despesas:
              </h4>
              <ul className="list-disc list-inside text-yellow-200 text-sm space-y-1 pl-7">
                <li>É obrigatório anexar o comprovante de pagamento (recibo ou nota fiscal) para cada despesa.</li>
                <li>Cupons de cartão de crédito <strong>não</strong> são aceitos como comprovante de pagamento.</li>
                <li>Não serão reembolsadas despesas com bebidas alcoólicas.</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cotista" className="text-slate-300">Cotista *</Label>
                  <Select onValueChange={(value) => handleSelectChange('cotista', value)}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Selecione o cotista..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clientsData?.clients?.map((client) => (
                        <SelectItem key={client.id} value={client.name}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="aeronave" className="text-slate-300">Aeronave *</Label>
                  <Select onValueChange={(value) => handleSelectChange('aeronave', value)}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Selecione a aeronave..." />
                    </SelectTrigger>
                    <SelectContent>
                      {aircraftData?.aircraft?.map((aircraft) => (
                        <SelectItem key={aircraft.id} value={aircraft.registration}>
                          {aircraft.registration} - {aircraft.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tripulante" className="text-slate-300">Tripulante *</Label>
                  <Select onValueChange={(value) => handleSelectChange('tripulante', value)}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Selecione o tripulante..." />
                    </SelectTrigger>
                    <SelectContent>
                      {crewData?.crew?.map((member) => (
                        <SelectItem key={member.id} value={member.name}>
                          {member.name} - {member.anac_license}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="destino" className="text-slate-300">Destino *</Label>
                  <Input
                    id="destino"
                    name="destino"
                    value={form.destino}
                    onChange={handleChange}
                    required
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_inicio" className="text-slate-300">Data Início *</Label>
                  <Input
                    id="data_inicio"
                    name="data_inicio"
                    type="date"
                    value={form.data_inicio.toISOString().split('T')[0]}
                    onChange={handleChange}
                    required
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="data_fim" className="text-slate-300">Data Fim *</Label>
                  <Input
                    id="data_fim"
                    name="data_fim"
                    type="date"
                    value={form.data_fim.toISOString().split('T')[0]}
                    onChange={handleChange}
                    required
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-300">Despesas</Label>
                <div className="space-y-2">
                  {form.despesas.map((despesa, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-2">
                        <Input
                          placeholder="Categoria"
                          value={despesa.categoria}
                          onChange={(e) => handleDespesaChange(index, 'categoria', e.target.value)}
                          className="bg-slate-800 border-slate-700 text-white text-xs"
                        />
                      </div>
                      <div className="col-span-4">
                        <Input
                          placeholder="Descrição"
                          value={despesa.descricao}
                          onChange={(e) => handleDespesaChange(index, 'descricao', e.target.value)}
                          className="bg-slate-800 border-slate-700 text-white text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Valor"
                          value={despesa.valor}
                          onChange={(e) => handleDespesaChange(index, 'valor', e.target.value)}
                          className="bg-slate-800 border-slate-700 text-white text-xs"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          placeholder="Pago por"
                          value={despesa.pago_por}
                          onChange={(e) => handleDespesaChange(index, 'pago_por', e.target.value)}
                          className="bg-slate-800 border-slate-700 text-white text-xs"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeDespesa(index)}
                          className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addDespesa}
                    className="text-cyan-400 border-cyan-400 hover:bg-cyan-400 hover:text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Despesa
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-slate-300">Valor Total</Label>
                <Input
                  value={`R$ ${calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  readOnly
                  className="bg-slate-700 border-slate-600 text-white font-bold"
                />
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
                  disabled={createReportMutation.isPending}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {createReportMutation.isPending ? 'Gerando...' : 'Gerar Relatório'}
                </Button>
                {generatedReport && (
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
