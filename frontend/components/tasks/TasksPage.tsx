import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { CheckSquare, Plus, Search, Edit, Trash2, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import TaskModal from "./TaskModal";
import { useBackend } from "../../hooks/useBackend";
import type { CreateTaskRequest, UpdateTaskRequest, Task } from "~backend/tasks/tasks";
import PageHeader from "../PageHeader";

export default function TasksPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const backend = useBackend();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => backend.tasks.list()
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskRequest) => backend.tasks.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({ title: "Sucesso", description: "Tarefa criada com sucesso!" });
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      toast({ title: "Erro", description: "Erro ao criar tarefa.", variant: "destructive" });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: UpdateTaskRequest) => backend.tasks.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({ title: "Sucesso", description: "Tarefa atualizada com sucesso!" });
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      toast({ title: "Erro", description: "Erro ao atualizar tarefa.", variant: "destructive" });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => backend.tasks.del({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({ title: "Sucesso", description: "Tarefa excluída com sucesso!" });
    },
    onError: (error) => {
      console.error("Error deleting task:", error);
      toast({ title: "Erro", description: "Erro ao excluir tarefa.", variant: "destructive" });
    }
  });

  const tasks = tasksData?.tasks || [];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSaveTask = (taskData: any) => {
    if (editingTask) {
      updateTaskMutation.mutate({ ...taskData, id: editingTask.id });
    } else {
      createTaskMutation.mutate(taskData);
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleStatusChange = (task: Task, status: 'pending' | 'in-progress' | 'completed') => {
    updateTaskMutation.mutate({ id: task.id, status });
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case "high": return { label: 'Alta', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
      case "medium": return { label: 'Média', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
      case "low": return { label: 'Baixa', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
      default: return { label: priority, color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="h-32 bg-slate-700 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Minhas Tarefas"
        description="Gerencie suas atividades e pendências."
        backPath="/"
      >
        <Button onClick={openAddModal} className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </PageHeader>

      <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar por título, descrição, categoria..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white rounded-md px-3 py-2"
          >
            <option value="">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="in-progress">Em Progresso</option>
            <option value="completed">Concluída</option>
          </select>
        </CardContent>
      </Card>

      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <Card key={task.id} className="bg-slate-900/90 backdrop-blur-sm border-slate-800 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(task.status)}
                      <span className="text-white font-semibold">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getPriorityInfo(task.priority).color}>
                        {getPriorityInfo(task.priority).label}
                      </Badge>
                      {task.category && (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          {task.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditModal(task)}
                    >
                      <Edit className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-slate-300 text-xs min-h-[40px]">{task.description}</p>
                {task.due_date && (
                  <div className="text-slate-400 text-xs">
                    Vencimento: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                  </div>
                )}
                <div className="flex gap-2">
                  {task.status !== 'pending' && <Button size="sm" variant="outline" onClick={() => handleStatusChange(task, 'pending')}>Pendente</Button>}
                  {task.status !== 'in-progress' && <Button size="sm" variant="outline" onClick={() => handleStatusChange(task, 'in-progress')}>Em Progresso</Button>}
                  {task.status !== 'completed' && <Button size="sm" variant="outline" onClick={() => handleStatusChange(task, 'completed')}>Concluída</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">Nenhuma tarefa encontrada.</p>
          <Button onClick={openAddModal} className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeira Tarefa
          </Button>
        </div>
      )}

      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTask}
          task={editingTask}
        />
      )}
    </div>
  );
}
