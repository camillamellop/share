import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, StickyNote, CheckSquare } from "lucide-react";
import { Link } from "react-router-dom";

const quickActions = [
  {
    icon: Calendar,
    title: "Agenda",
    description: "Visualizar compromissos e contatos",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    path: "/agenda/contacts"
  },
  {
    icon: CheckSquare,
    title: "Minhas Tarefas",
    description: "Gerenciar suas atividades e pendências",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    path: "/tasks"
  },
  {
    icon: StickyNote,
    title: "Bloco de Notas",
    description: "Anotações rápidas e lembretes",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    path: "/notes"
  }
];

export default function QuickActions() {
  return (
    <Card className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 hover:border-cyan-500/50 transition-colors">
      <CardHeader>
        <CardTitle className="text-white">Acessos Rápidos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-6 flex flex-col items-center space-y-3 bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-700/50 transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link to={action.path}>
                <div className={`p-3 rounded-lg ${action.color}`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <h3 className="text-white font-medium text-sm mb-1">{action.title}</h3>
                  <p className="text-slate-400 text-xs">{action.description}</p>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
