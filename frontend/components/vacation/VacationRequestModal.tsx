import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Calendar } from "lucide-react";

interface VacationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (request: any) => void;
  availableDays: number;
}

export default function VacationRequestModal({ isOpen, onClose, onSave, availableDays }: VacationRequestModalProps) {
  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
    type: 'regulares',
    notes: '',
  });

  const [calculatedDays, setCalculatedDays] = useState(0);

  const handleChange = (field: string, value: string) => {
    const newForm = { ...form, [field]: value };
    setForm(newForm);

    // Calculate days when both dates are set
    if (field === 'start_date' || field === 'end_date') {
      if (newForm.start_date && newForm.end_date) {
        const startDate = new Date(newForm.start_date);
        const endDate = new Date(newForm.end_date);
        
        if (endDate >= startDate) {
          const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          setCalculatedDays(days);
        } else {
          setCalculatedDays(0);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (calculatedDays > availableDays) {
      alert(`Você não possui dias suficientes. Disponível: ${availableDays} dias.`);
      return;
    }

    if (calculatedDays <= 0) {
      alert('Por favor, selecione um período válido.');
      return;
    }

    onSave(form);
  };

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Minimum 1 day in advance
    return today.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <span>Solicitar Férias</span>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <p className="text-slate-300 text-sm">
                <strong>Dias disponíveis:</strong> {availableDays} dias
              </p>
              {calculatedDays > 0 && (
                <p className="text-cyan-400 text-sm mt-1">
                  <strong>Dias solicitados:</strong> {calculatedDays} dias
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="type" className="text-slate-300">Tipo de Férias *</Label>
              <Select value={form.type} onValueChange={(value) => handleChange('type', value)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regulares">Férias Regulares</SelectItem>
                  <SelectItem value="premio">Férias Prêmio</SelectItem>
                  <SelectItem value="coletivas">Férias Coletivas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date" className="text-slate-300">Data de Início *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                  min={getMinDate()}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="end_date" className="text-slate-300">Data de Fim *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={form.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                  min={form.start_date || getMinDate()}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-slate-300">Observações</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Informações adicionais sobre a solicitação..."
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {calculatedDays > availableDays && (
              <div className="bg-red-900/20 border border-red-800/30 rounded-md p-3">
                <p className="text-red-400 text-sm">
                  <strong>Atenção:</strong> Você está solicitando {calculatedDays} dias, mas possui apenas {availableDays} dias disponíveis.
                </p>
              </div>
            )}

            <div className="bg-slate-800/50 p-4 rounded-lg">
              <h4 className="text-slate-300 font-semibold mb-2">Informações Importantes:</h4>
              <ul className="text-slate-400 text-sm space-y-1">
                <li>• As férias devem ser solicitadas com pelo menos 30 dias de antecedência</li>
                <li>• O período mínimo de férias é de 5 dias corridos</li>
                <li>• Férias podem ser divididas em até 3 períodos</li>
                <li>• A aprovação está sujeita à disponibilidade operacional</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
                disabled={calculatedDays <= 0 || calculatedDays > availableDays}
              >
                Solicitar Férias
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
