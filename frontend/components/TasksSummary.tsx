import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
import backend from "~backend/client";
import { Link } from "react-router-dom";

export default function TasksSummary() {
  const { data, isLoading } = useQuery({
    queryKey: ["todayTasks"],
    queryFn: () => backend.tasks.list({ user_id: "user_1" }) // Mock user ID
  });

  if (isLoading) {
    return (
      <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Tarefas do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "in-progress": return <Clock className="w-4 h-4 text-yellow-400" />;
      case "pending": return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const pendingTasks = data.tasks.filter(task => task.status !== "completed");

  return (
    <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <Link to="/tasks" className="hover:text-cyan-400">Minhas Tarefas</Link>
          <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
            {pendingTasks.length} pendentes
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.tasks.slice(0, 4).map((task) => (
          <div
            key={task.id}
            className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-white font-medium text-sm">{task.title}</h4>
              {getStatusIcon(task.status)}
            </div>
            <p className="text-slate-400 text-xs mb-2 line-clamp-2">
              {task.description}
            </p>
            <div className="flex items-center justify-between">
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              {task.due_date && (
                <span className="text-slate-500 text-xs">
                  {new Date(task.due_date).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
