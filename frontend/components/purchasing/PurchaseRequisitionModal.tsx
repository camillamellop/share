import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { X, ShoppingCart } from "lucide-react";
import backend from "~backend/client";
import type { CreateRequisitionRequest } from "~backend/purchasing/requisitions";

interface PurchaseRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PurchaseRequisitionModal({ isOpen, onClose }: PurchaseRequisitionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<CreateRequisitionRequest>({
    title: '',
    description: '',
    type: 'Compra',
    priority: 'media',
    value: 0,
    needed_by: undefined,
  });

  const createRequisitionMutation = useMutation({
    mutationFn: (data: CreateRequisitionRequest) => backend.purchasing.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseRequisitions"] });
      queryClient.invalidateQueries({ queryKey: ["requisitionStats"] });
      toast({
        title: "Sucesso",
        description: "Solicitação enviada com sucesso!",
      });
      onClose();
    },
    onError: (error) => {
      console.error("Error creating requisition:", error);
      toast({
        title: "Erro",
        description: "Erro ao enviar solicitação.",
        variant: "destructive",
      });
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'value' ? parseFloat(value) : value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value as any }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequisitionMutation.mutate({
      ...form,
      needed_by: form.needed_by ? new Date(form.needed_by) : undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-cyan-400" />
            <span>Nova Solicitação</span>
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
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="Ex: Aquisição de 2 Notebooks"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-slate-300">Descrição Detalhada *</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="Especifique os itens, quantidades, modelos, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type" className="text-slate-300">Tipo *</Label>
                <Select value={form.type} onValueChange={(value) => handleSelectChange('type', value)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Compra">Compra</SelectItem>
                    <SelectItem value="Serviço">Serviço</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority" className="text-slate-300">Prioridade *</Label>
                <Select value={form.priority} onValueChange={(value) => handleSelectChange('priority', value)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="value" className="text-slate-300">Valor Estimado (R$) *</Label>
                <Input
                  id="value"
                  name="value"
                  type="number"
                  step="0.01"
                  value={form.value}
                  onChange={handleChange}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="needed_by" className="text-slate-300">Necessário Para</Label>
                <Input
                  id="needed_by"
                  name="needed_by"
                  type="date"
                  value={form.needed_by ? form.needed_by.toString().split('T')[0] : ''}
                  onChange={handleChange}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white" disabled={createRequisitionMutation.isPending}>
                {createRequisitionMutation.isPending ? 'Enviando...' : 'Enviar Solicitação'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
