import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, CheckSquare } from "lucide-react";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: any) => void;
  task?: any;
}

export default function TaskModal({ isOpen, onClose, onSave, task }: TaskModalProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    category: '',
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        category: task.category || '',
      });
    } else {
      setForm({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        category: '',
      });
    }
  }, [task]);

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      due_date: form.due_date ? new Date(form.due_date) : undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-cyan-400" />
            <span>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</span>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-slate-300">Título *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-slate-300">Descrição</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority" className="text-slate-300">Prioridade</Label>
                <Select value={form.priority} onValueChange={(value) => handleChange('priority', value)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="due_date" className="text-slate-300">Data de Vencimento</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={form.due_date}
                  onChange={(e) => handleChange('due_date', e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category" className="text-slate-300">Categoria</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="Ex: Operacional, Documentação"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                {task ? 'Atualizar' : 'Criar'} Tarefa
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
