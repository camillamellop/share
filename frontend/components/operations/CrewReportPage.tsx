import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, User, Plane, Clock } from "lucide-react";
import backend from "~backend/client";
import PageHeader from "../PageHeader";

export default function CrewReportPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["crewMonthlyReport", selectedMonth, selectedYear],
    queryFn: () => backend.operations.getCrewMonthlyReport({
      month: selectedMonth,
      year: selectedYear,
    }),
    enabled: !!selectedMonth && !!selectedYear,
  });

  const { data: aircraftData } = useQuery({
    queryKey: ["aircrafts"],
    queryFn: () => backend.operations.getAircrafts()
  });

  const report = reportData?.report || [];
  const aircrafts = aircraftData?.aircraft || [];

  const formatHours = (hours: number) => (hours || 0).toFixed(1).replace('.', ',');

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Relatório Mensal de Tripulação"
        description="Horas voadas por tripulante em cada aeronave."
        backPath="/"
      />

      <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Filtro de Período</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <CardTitle className="text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>
              Relatório de {new Date(selectedYear, selectedMonth - 1).toLocaleString('pt-BR', { month: 'long' })} de {selectedYear}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-8 bg-slate-700 rounded"></div>
              <div className="h-12 bg-slate-700 rounded"></div>
              <div className="h-12 bg-slate-700 rounded"></div>
              <div className="h-12 bg-slate-700 rounded"></div>
            </div>
          ) : report.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-slate-400">
                  <tr>
                    <th className="p-2 border-b border-slate-700"><User className="inline w-4 h-4 mr-1" />Tripulante</th>
                    {aircrafts.map(ac => (
                      <th key={ac.id} className="p-2 border-b border-slate-700 text-center"><Plane className="inline w-4 h-4 mr-1" />{ac.registration}</th>
                    ))}
                    <th className="p-2 border-b border-slate-700 text-center"><Clock className="inline w-4 h-4 mr-1" />Total</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {report.map(crew => (
                    <tr key={crew.crew_name} className="hover:bg-slate-800/50">
                      <td className="p-2 border-b border-slate-800 font-semibold">{crew.crew_name}</td>
                      {aircrafts.map(ac => (
                        <td key={ac.id} className="p-2 border-b border-slate-800 text-center font-mono">
                          {formatHours(crew.aircraft_hours[ac.registration])}
                        </td>
                      ))}
                      <td className="p-2 border-b border-slate-800 text-center font-mono font-bold text-cyan-400">
                        {formatHours(crew.total_hours)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400">Nenhum dado encontrado para este período.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
