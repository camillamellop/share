import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plane } from "lucide-react";

interface AircraftFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (aircraft: any) => void;
  aircraft?: any;
}

export default function AircraftFormModal({ isOpen, onClose, onSave, aircraft }: AircraftFormModalProps) {
  const [form, setForm] = useState({
    registration: '',
    model: '',
    total_hours: 0,
    consumption_per_hour: 0,
    status: 'active',
  });

  useEffect(() => {
    if (aircraft) {
      setForm({
        registration: aircraft.registration || '',
        model: aircraft.model || '',
        total_hours: aircraft.total_hours || 0,
        consumption_per_hour: aircraft.consumption_per_hour || 0,
        status: aircraft.status || 'active',
      });
    } else {
      setForm({
        registration: '',
        model: '',
        total_hours: 0,
        consumption_per_hour: 0,
        status: 'active',
      });
    }
  }, [aircraft]);

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, id: aircraft?.id });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <Plane className="w-5 h-5 text-cyan-400" />
            <span>{aircraft ? 'Editar Aeronave' : 'Nova Aeronave'}</span>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="registration" className="text-slate-300">Prefixo *</Label>
                <Input
                  id="registration"
                  value={form.registration}
                  onChange={(e) => handleChange('registration', e.target.value.toUpperCase())}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Ex: PR-MDL"
                />
              </div>
              <div>
                <Label htmlFor="model" className="text-slate-300">Modelo *</Label>
                <Input
                  id="model"
                  value={form.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Ex: PA34220T"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total_hours" className="text-slate-300">Horas Totais</Label>
                <Input
                  id="total_hours"
                  type="number"
                  step="0.1"
                  value={form.total_hours}
                  onChange={(e) => handleChange('total_hours', parseFloat(e.target.value) || 0)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="consumption_per_hour" className="text-slate-300">Consumo (L/H)</Label>
                <Input
                  id="consumption_per_hour"
                  type="number"
                  step="0.1"
                  value={form.consumption_per_hour}
                  onChange={(e) => handleChange('consumption_per_hour', parseFloat(e.target.value) || 0)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status" className="text-slate-300">Status</Label>
              <Select value={form.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="inactive">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
                {aircraft ? 'Atualizar' : 'Salvar'} Aeronave
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
