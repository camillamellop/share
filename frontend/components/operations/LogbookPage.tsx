import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { BookOpen, Plus, Trash2, DollarSign, Users, Printer } from "lucide-react";
import LogbookEntryForm from "./LogbookEntryForm";
import backend from "~backend/client";
import PageHeader from "../PageHeader";
import PrintableLogbook from "./PrintableLogbook";

export default function LogbookPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { aircraftId } = useParams<{ aircraftId: string }>();
  const [showForm, setShowForm] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: logbookData, isLoading } = useQuery({
    queryKey: ["logbook", aircraftId, selectedMonth, selectedYear],
    queryFn: () => backend.operations.getLogbook({
      aircraft_id: aircraftId!,
      month: selectedMonth,
      year: selectedYear,
    }),
    enabled: !!aircraftId && !!selectedMonth && !!selectedYear,
  });

  const createEntryMutation = useMutation({
    mutationFn: (data: any) => backend.operations.createLogbookEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logbook", aircraftId, selectedMonth, selectedYear] });
      toast({ title: "Sucesso", description: "Trecho adicionado com sucesso!" });
      setShowForm(false);
    },
    onError: (error) => {
      console.error("Error creating logbook entry:", error);
      toast({ title: "Erro", description: "Erro ao adicionar trecho.", variant: "destructive" });
    }
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (id: string) => backend.operations.deleteLogbookEntry({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logbook", aircraftId, selectedMonth, selectedYear] });
      toast({ title: "Sucesso", description: "Trecho excluído com sucesso!" });
    },
    onError: (error) => {
      console.error("Error deleting logbook entry:", error);
      toast({ title: "Erro", description: "Erro ao excluir trecho.", variant: "destructive" });
    }
  });

  const handleSaveEntry = (entryData: any) => {
    createEntryMutation.mutate({ ...entryData, logbook_id: logbookData?.logbook.id });
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este trecho?")) {
      deleteEntryMutation.mutate(id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const logbook = logbookData?.logbook;
  const entries = logbook?.entries || [];
  const summary = logbook?.monthly_summary;

  const formatHours = (hours: number) => (hours || 0).toFixed(1).replace('.', ',');

  return (
    <>
      <div className="p-6 space-y-6 print:hidden">
        <PageHeader
          title={`Diário de Bordo - ${aircraftId}`}
          description={`Mês de ${new Date(selectedYear, selectedMonth - 1).toLocaleString('pt-BR', { month: 'long' })} de ${selectedYear}`}
          backPath="/operations/logbook"
        >
          <Button onClick={handlePrint} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Gerar PDF
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Período</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => 
                    <SelectItem key={m} value={m.toString()}>
                      {new Date(2000, m - 1).toLocaleString('pt-BR', { month: 'long' })}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(y => 
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Aeronave</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">AERONAVE:</span> <span className="text-white font-mono">{logbook?.aircraft_registration}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">MODELO:</span> <span className="text-white font-mono">{logbook?.aircraft_model}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">CONS. MED:</span> <span className="text-white font-mono">{logbook?.aircraft_consumption} L/H</span></div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Horas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">ANTER.:</span> <span className="text-blue-400 font-mono">{formatHours(logbook?.previous_hours)} H</span></div>
              <div className="flex justify-between"><span className="text-slate-400">ATUAL:</span> <span className="text-blue-400 font-mono">{formatHours(logbook?.current_hours)} H</span></div>
              <div className="flex justify-between"><span className="text-slate-400">P.REV.:</span> <span className="text-red-400 font-mono">{formatHours(logbook?.revision_hours)} H</span></div>
              <div className="flex justify-between"><span className="text-slate-400">DISP.:</span> <span className="text-green-400 font-mono">{formatHours((logbook?.revision_hours || 0) - (logbook?.current_hours || 0))} H</span></div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Resumo Mensal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center"><DollarSign className="w-4 h-4 mr-2" /> Total Diárias:</span> 
                <span className="text-green-400 font-mono">R$ {summary?.total_allowance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center"><Users className="w-4 h-4 mr-2" /> Tripulantes:</span> 
                <span className="text-white font-mono">{summary?.crew_hours.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {summary && summary.crew_hours.length > 0 && (
          <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>Horas por Tripulante (Mês)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm text-left">
                <thead className="text-slate-400">
                  <tr>
                    <th className="p-2 border-b border-slate-700">Tripulante</th>
                    <th className="p-2 border-b border-slate-700 text-center">Horas PIC</th>
                    <th className="p-2 border-b border-slate-700 text-center">Horas SIC</th>
                    <th className="p-2 border-b border-slate-700 text-center">Total</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {summary.crew_hours.map(crew => (
                    <tr key={crew.crew_name} className="hover:bg-slate-800/50">
                      <td className="p-2 border-b border-slate-800 font-semibold">{crew.crew_name}</td>
                      <td className="p-2 border-b border-slate-800 text-center font-mono">{formatHours(crew.pic_hours)}</td>
                      <td className="p-2 border-b border-slate-800 text-center font-mono">{formatHours(crew.sic_hours)}</td>
                      <td className="p-2 border-b border-slate-800 text-center font-mono font-bold text-cyan-400">{formatHours(crew.total_hours)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span>Trechos do Mês</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-slate-400">
                  <tr>
                    <th rowSpan={2} className="p-2 border-b border-slate-700">DATA</th>
                    <th rowSpan={2} className="p-2 border-b border-slate-700">DE</th>
                    <th rowSpan={2} className="p-2 border-b border-slate-700">PARA</th>
                    <th colSpan={4} className="p-2 border-b border-slate-700 text-center">HORÁRIOS</th>
                    <th colSpan={4} className="p-2 border-b border-slate-700 text-center">TEMPO DE VOO</th>
                    <th rowSpan={2} className="p-2 border-b border-slate-700">IFR</th>
                    <th rowSpan={2} className="p-2 border-b border-slate-700">POUSOS</th>
                    <th colSpan={2} className="p-2 border-b border-slate-700 text-center">COMBUSTÍVEL</th>
                    <th colSpan={3} className="p-2 border-b border-slate-700 text-center">CANAC</th>
                    <th rowSpan={2} className="p-2 border-b border-slate-700">DIARIAS</th>
                    <th rowSpan={2} className="p-2 border-b border-slate-700"></th>
                  </tr>
                  <tr className="text-slate-500">
                    <th className="p-2 border-b border-slate-700">AC</th>
                    <th className="p-2 border-b border-slate-700">DEP</th>
                    <th className="p-2 border-b border-slate-700">POU</th>
                    <th className="p-2 border-b border-slate-700">COR</th>
                    <th className="p-2 border-b border-slate-700">T.VOO</th>
                    <th className="p-2 border-b border-slate-700">T.DIA</th>
                    <th className="p-2 border-b border-slate-700">T.NOITE</th>
                    <th className="p-2 border-b border-slate-700">TOTAL</th>
                    <th className="p-2 border-b border-slate-700">ABAST</th>
                    <th className="p-2 border-b border-slate-700">FUEL</th>
                    <th className="p-2 border-b border-slate-700">CÉLULA</th>
                    <th className="p-2 border-b border-slate-700">PIC</th>
                    <th className="p-2 border-b border-slate-700">SIC</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {entries.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-800/50">
                      <td className="p-2 border-b border-slate-800">{new Date(entry.date).toLocaleDateString('pt-BR')}</td>
                      <td className="p-2 border-b border-slate-800">{entry.from_airport}</td>
                      <td className="p-2 border-b border-slate-800">{entry.to_airport}</td>
                      <td className="p-2 border-b border-slate-800">{entry.time_activated}</td>
                      <td className="p-2 border-b border-slate-800">{entry.time_departure}</td>
                      <td className="p-2 border-b border-slate-800">{entry.time_arrival}</td>
                      <td className="p-2 border-b border-slate-800">{entry.time_shutdown}</td>
                      <td className="p-2 border-b border-slate-800">{formatHours(entry.flight_time_total)}</td>
                      <td className="p-2 border-b border-slate-800">{formatHours(entry.flight_time_day)}</td>
                      <td className="p-2 border-b border-slate-800">{formatHours(entry.flight_time_night)}</td>
                      <td className="p-2 border-b border-slate-800">{formatHours(entry.flight_time_total)}</td>
                      <td className="p-2 border-b border-slate-800">{formatHours(entry.ifr_hours)}</td>
                      <td className="p-2 border-b border-slate-800">{entry.landings}</td>
                      <td className="p-2 border-b border-slate-800">{entry.fuel_added}</td>
                      <td className="p-2 border-b border-slate-800">{entry.fuel_on_arrival}</td>
                      <td className="p-2 border-b border-slate-800">{formatHours(entry.cell_hours)}</td>
                      <td className="p-2 border-b border-slate-800">{entry.pic_anac}</td>
                      <td className="p-2 border-b border-slate-800">{entry.sic_anac}</td>
                      <td className="p-2 border-b border-slate-800">R$ {entry.daily_allowance.toFixed(2)}</td>
                      <td className="p-2 border-b border-slate-800">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)} className="h-6 w-6">
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {showForm && (
                    <tr>
                      <td colSpan={20}>
                        <LogbookEntryForm onSave={handleSaveEntry} onCancel={() => setShowForm(false)} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {!showForm && (
              <div className="mt-4 flex justify-end">
                <Button onClick={() => setShowForm(true)} className="bg-cyan-600 hover:bg-cyan-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Trecho
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="hidden print:block">
        {logbook && <PrintableLogbook logbook={logbook} />}
      </div>
    </>
  );
}
