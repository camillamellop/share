import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Scale, Plus, Check, Send, Wrench, Fuel, Receipt, MoreVertical, DollarSign } from "lucide-react";
import backend from "~backend/client";
import PageHeader from "../PageHeader";
import ExpenseFormModal from "./ExpenseFormModal";
import type { FinancialTransaction, TransactionStatus } from "~backend/financial/transactions";

const getCategoryIcon = (category?: string) => {
  switch (category) {
    case 'Manutenção': return <Wrench className="w-5 h-5 text-orange-400" />;
    case 'Combustível': return <Fuel className="w-5 h-5 text-yellow-400" />;
    case 'Taxas Aeroportuárias': return <Receipt className="w-5 h-5 text-blue-400" />;
    default: return <DollarSign className="w-5 h-5 text-slate-400" />;
  }
};

const getStatusInfo = (status: TransactionStatus) => {
  switch (status) {
    case 'pending_payment': return { label: 'Pagamento Pendente', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    case 'awaiting_billing': return { label: 'Aguardando Cobrança', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    case 'billed': return { label: 'Cobrança Enviada', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    case 'paid':
    case 'received':
      return { label: 'Conciliado', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    default: return { label: 'Desconhecido', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
  }
};

export default function ReconciliationPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: pendingExpenses, isLoading: pendingLoading } = useQuery({
    queryKey: ["transactions", "pending_payment"],
    queryFn: () => backend.financial.listTransactions({ status: 'pending_payment' })
  });

  const { data: pendingReimbursements, isLoading: reimbursementsLoading } = useQuery({
    queryKey: ["transactions", "awaiting_billing,billed"],
    queryFn: () => backend.financial.listTransactions({ status: 'awaiting_billing,billed' })
  });

  const { data: reconciled, isLoading: reconciledLoading } = useQuery({
    queryKey: ["transactions", "paid,received"],
    queryFn: () => backend.financial.listTransactions({ status: 'paid,received' })
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => backend.financial.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({ title: "Sucesso", description: "Despesa lançada com sucesso!" });
      setIsModalOpen(false);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: string; status: TransactionStatus }) => backend.financial.updateTransactionStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({ title: "Sucesso", description: "Status atualizado." });
    },
  });

  const handleSaveExpense = (data: any) => {
    createMutation.mutate(data);
  };

  const handleUpdateStatus = (id: string, status: TransactionStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  const TransactionCard = ({ transaction }: { transaction: FinancialTransaction }) => (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-4 flex items-start gap-4">
        <div className="p-3 rounded-lg bg-slate-700 mt-1">
          {getCategoryIcon(transaction.category)}
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="md:col-span-2">
            <h3 className="font-semibold text-white">{transaction.description}</h3>
            <p className="text-xs text-slate-400">
              {transaction.source_type ? `${transaction.source_type}-${transaction.source_id}` : `DESP-${transaction.id.slice(-6)}`} • {new Date(transaction.transaction_date).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="text-sm">
            <div className="text-slate-400">Valor</div>
            <div className="text-green-400 font-bold">R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="text-sm">
            <div className="text-slate-400">Aeronave</div>
            <div className="text-white">{transaction.aircraft || 'N/A'}</div>
          </div>
        </div>
        <div className="ml-auto flex flex-col items-end gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
          <Badge className={getStatusInfo(transaction.status).color}>
            {getStatusInfo(transaction.status).label}
          </Badge>
        </div>
      </CardContent>
      <div className="px-4 pb-4 flex justify-between items-center">
        <div className="text-xs text-slate-400">
          Para: <span className="text-slate-300">{transaction.party_name}</span>
        </div>
        <div className="flex gap-2">
          {transaction.status === 'pending_payment' && (
            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(transaction.id, 'paid')}>
              <Check className="w-3 h-3 mr-1" /> Marcar como Pago
            </Button>
          )}
          {transaction.status === 'awaiting_billing' && (
            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(transaction.id, 'billed')}>
              <Send className="w-3 h-3 mr-1" /> Enviar Cobrança
            </Button>
          )}
          {transaction.status === 'billed' && (
            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(transaction.id, 'received')}>
              <Check className="w-3 h-3 mr-1" /> Confirmar Recebimento
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  const renderTabContent = (transactions: FinancialTransaction[] | undefined, isLoading: boolean, emptyMessage: string) => {
    if (isLoading) return <div className="text-center text-slate-400 p-8">Carregando...</div>;
    if (!transactions || transactions.length === 0) return <div className="text-center text-slate-400 p-8">{emptyMessage}</div>;
    return (
      <div className="space-y-4">
        {transactions.map(t => <TransactionCard key={t.id} transaction={t} />)}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Conciliação Financeira"
        description="Acompanhe o fluxo de despesas e recebimentos."
        backPath="/"
      >
        <Button onClick={() => setIsModalOpen(true)} className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="w-4 h-4 mr-2" />
          Lançar Despesa
        </Button>
      </PageHeader>

      <Tabs defaultValue="pending_expenses">
        <TabsList className="grid w-full grid-cols-3 bg-slate-900/90 backdrop-blur-sm border-slate-800">
          <TabsTrigger value="pending_expenses" className="text-slate-300 data-[state=active]:text-cyan-400">Lançamentos</TabsTrigger>
          <TabsTrigger value="pending_reimbursements" className="text-slate-300 data-[state=active]:text-cyan-400">Saídas a Cobrar</TabsTrigger>
          <TabsTrigger value="reconciled" className="text-slate-300 data-[state=active]:text-cyan-400">Conciliados</TabsTrigger>
        </TabsList>

        <TabsContent value="pending_expenses" className="mt-6">
          {renderTabContent(pendingExpenses?.transactions, pendingLoading, "Nenhuma despesa pendente de pagamento.")}
        </TabsContent>
        <TabsContent value="pending_reimbursements" className="mt-6">
          {renderTabContent(pendingReimbursements?.transactions, reimbursementsLoading, "Nenhuma saída aguardando cobrança do cliente.")}
        </TabsContent>
        <TabsContent value="reconciled" className="mt-6">
          {renderTabContent(reconciled?.transactions, reconciledLoading, "Nenhuma transação conciliada.")}
        </TabsContent>
      </Tabs>

      {isModalOpen && (
        <ExpenseFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveExpense}
        />
      )}
    </div>
  );
}
