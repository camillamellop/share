import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import PurchaseRequisitionStats from "./PurchaseRequisitionStats";
import PurchaseRequisitionList from "./PurchaseRequisitionList";
import PurchaseRequisitionModal from "./PurchaseRequisitionModal";
import backend from "~backend/client";
import PageHeader from "../PageHeader";

export default function PurchaseRequisitionPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: requisitionsData, isLoading } = useQuery({
    queryKey: ["purchaseRequisitions"],
    queryFn: () => backend.purchasing.list()
  });

  const requisitions = requisitionsData?.requisitions || [];

  const filteredRequisitions = requisitions.filter(req => {
    const matchesSearch = !searchTerm ||
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || req.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Solicitações de Compras"
        description="Faça suas solicitações de compras e serviços de forma rápida e eficiente"
        backPath="/"
      >
        <Button onClick={() => setIsModalOpen(true)} className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Solicitação
        </Button>
      </PageHeader>

      <PurchaseRequisitionStats />

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar solicitações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px] bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Todos os Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os Status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_analise">Em Análise</SelectItem>
            <SelectItem value="aprovada">Aprovada</SelectItem>
            <SelectItem value="rejeitada">Rejeitada</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <PurchaseRequisitionList requisitions={filteredRequisitions} isLoading={isLoading} />

      {isModalOpen && (
        <PurchaseRequisitionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
