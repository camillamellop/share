import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Receipt, FileText, DollarSign, Printer } from "lucide-react";
import { useBackend } from "../../hooks/useBackend";
import PageHeader from "../PageHeader";
import PrintableReceipt from "../financial/PrintableReceipt";
import PrintableTravelReport from "../financial/PrintableTravelReport";
import PrintableBilling from "../financial/PrintableBilling";

export default function ReportsPage() {
  const backend = useBackend();
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [printingReport, setPrintingReport] = useState<any>(null);
  const [printingReportType, setPrintingReportType] = useState<string | null>(null);

  const { data: receiptsData, isLoading: receiptsLoading } = useQuery({
    queryKey: ["allReceipts"],
    queryFn: () => backend.financial.getReceipts()
  });

  const { data: travelReportsData, isLoading: travelReportsLoading } = useQuery({
    queryKey: ["allTravelReports"],
    queryFn: () => backend.financial.getTravelReports()
  });

  const { data: billingData, isLoading: billingLoading } = useQuery({
    queryKey: ["allBillingDocuments"],
    queryFn: () => backend.financial.getBillingDocuments()
  });

  const handlePrint = (report: any, type: string) => {
    setPrintingReport(report);
    setPrintingReportType(type);
  };

  useEffect(() => {
    if (printingReport) {
      const timer = setTimeout(() => {
        window.print();
        setPrintingReport(null);
        setPrintingReportType(null);
      }, 100); // Small delay to allow state to update and component to render
      return () => clearTimeout(timer);
    }
  }, [printingReport]);

  const filterData = (data: any[], dateField: string, clientField: string) => {
    if (!data) return [];
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      const matchesSearch = !searchTerm || item[clientField]?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStartDate = !startDate || itemDate >= new Date(startDate);
      const matchesEndDate = !endDate || itemDate <= new Date(endDate);
      return matchesSearch && matchesStartDate && matchesEndDate;
    });
  };

  const filteredReceipts = filterData(receiptsData?.receipts, 'data_emissao', 'cliente_nome');
  const filteredTravelReports = filterData(travelReportsData?.reports, 'created_at', 'cotista');
  const filteredBillingDocs = filterData(billingData?.documents, 'created_at', 'devedor');

  const renderLoading = () => (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-700 rounded" />)}
    </div>
  );

  return (
    <>
      <div className="p-6 space-y-6 print:hidden">
        <PageHeader
          title="Arquivo de Relatórios"
          description="Consulte todos os documentos gerados pelo sistema."
          backPath="/"
        />

        <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar por cliente/cotista/devedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="receipts">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/90 backdrop-blur-sm border-slate-800">
            <TabsTrigger value="receipts" className="text-slate-300 data-[state=active]:text-cyan-400">
              <Receipt className="mr-2 h-4 w-4" />Recibos
            </TabsTrigger>
            <TabsTrigger value="travel_reports" className="text-slate-300 data-[state=active]:text-cyan-400">
              <FileText className="mr-2 h-4 w-4" />Relatórios de Viagem
            </TabsTrigger>
            <TabsTrigger value="billing" className="text-slate-300 data-[state=active]:text-cyan-400">
              <DollarSign className="mr-2 h-4 w-4" />Cobranças
            </TabsTrigger>
          </TabsList>

          <TabsContent value="receipts">
            <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
              <CardContent className="p-4">
                {receiptsLoading ? renderLoading() : (
                  <ul className="space-y-2">
                    {filteredReceipts.map(item => (
                      <li key={item.id} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <div>
                          <p className="text-white font-semibold">{item.numero} - {item.cliente_nome}</p>
                          <p className="text-slate-400 text-sm">
                            {item.descricao} - R$ {item.valor.toFixed(2)} | Criado por: {item.created_by_name}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handlePrint(item, 'receipt')}><Printer className="w-4 h-4 mr-2" /> Imprimir</Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="travel_reports">
            <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
              <CardContent className="p-4">
                {travelReportsLoading ? renderLoading() : (
                  <ul className="space-y-2">
                    {filteredTravelReports.map(item => (
                      <li key={item.id} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <div>
                          <p className="text-white font-semibold">{item.numero_relatorio} - {item.cotista}</p>
                          <p className="text-slate-400 text-sm">
                            {item.tripulante} / {item.destino} - R$ {item.valor_total.toFixed(2)} | Criado por: {item.created_by_name}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handlePrint(item, 'travel_report')}><Printer className="w-4 h-4 mr-2" /> Imprimir</Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
              <CardContent className="p-4">
                {billingLoading ? renderLoading() : (
                  <ul className="space-y-2">
                    {filteredBillingDocs.map(item => (
                      <li key={item.id} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <div>
                          <p className="text-white font-semibold">{item.numero_cobranca} - {item.devedor}</p>
                          <p className="text-slate-400 text-sm">
                            {item.referencia} - R$ {item.valor.toFixed(2)} | Criado por: {item.created_by_name}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handlePrint(item, 'billing')}><Printer className="w-4 h-4 mr-2" /> Imprimir</Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <div className="hidden print:block">
        {printingReport && printingReportType === 'receipt' && <PrintableReceipt receipt={printingReport} />}
        {printingReport && printingReportType === 'travel_report' && <PrintableTravelReport report={printingReport} />}
        {printingReport && printingReportType === 'billing' && <PrintableBilling document={printingReport} />}
      </div>
    </>
  );
}
