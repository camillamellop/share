import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, DollarSign } from "lucide-react";

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function ExpenseFormModal({ isOpen, onClose, onSave }: ExpenseFormModalProps) {
  const [form, setForm] = useState({
    description: '',
    category: 'Outros',
    amount: 0,
    party_name: '',
    aircraft: '',
    transaction_date: new Date().toISOString().split('T')[0],
    payment_method: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      type: 'expense',
      status: 'pending_payment',
      transaction_date: new Date(form.transaction_date),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-cyan-400" />
            <span>Lançar Nova Despesa</span>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="description" className="text-slate-300">Descrição *</Label>
              <Input
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="Ex: Compra de peças para motor"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount" className="text-slate-300">Valor (R$) *</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-slate-300">Categoria</Label>
                <Select value={form.category} onValueChange={(value) => handleSelectChange('category', value)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                    <SelectItem value="Combustível">Combustível</SelectItem>
                    <SelectItem value="Taxas Aeroportuárias">Taxas Aeroportuárias</SelectItem>
                    <SelectItem value="Salários">Salários</SelectItem>
                    <SelectItem value="Serviços">Serviços</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="party_name" className="text-slate-300">Fornecedor/Funcionário *</Label>
                <Input
                  id="party_name"
                  name="party_name"
                  value={form.party_name}
                  onChange={handleChange}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="aircraft" className="text-slate-300">Aeronave (se aplicável)</Label>
                <Input
                  id="aircraft"
                  name="aircraft"
                  value={form.aircraft}
                  onChange={handleChange}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Ex: PR-MDL"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transaction_date" className="text-slate-300">Data da Transação *</Label>
                <Input
                  id="transaction_date"
                  name="transaction_date"
                  type="date"
                  value={form.transaction_date}
                  onChange={handleChange}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="payment_method" className="text-slate-300">Forma de Pagamento</Label>
                <Input
                  id="payment_method"
                  name="payment_method"
                  value={form.payment_method}
                  onChange={handleChange}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Ex: Transferência, Cartão"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-slate-300">Observações</Label>
              <Textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                Lançar Despesa
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
