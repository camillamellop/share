import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, Wallet } from "lucide-react";
import backend from "~backend/client";

export default function PurchaseRequisitionStats() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["requisitionStats"],
    queryFn: () => backend.purchasing.getStats()
  });

  const stats = [
    { title: "Total", value: statsData?.total || 0, icon: FileText, color: "text-blue-400" },
    { title: "Pendentes", value: statsData?.pending || 0, icon: Clock, color: "text-orange-400" },
    { title: "Aprovadas", value: statsData?.approved || 0, icon: CheckCircle, color: "text-green-400" },
    { title: "Valor Total", value: `R$ ${statsData?.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`, icon: Wallet, color: "text-purple-400" },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-slate-900/90 backdrop-blur-sm border-slate-800 animate-pulse">
            <CardContent className="p-4 h-24"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg bg-slate-800`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
