import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, User, Plane } from "lucide-react";
import backend from "~backend/client";

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  item?: any;
  type: 'crew' | 'aircraft';
}

export default function MaintenanceModal({ isOpen, onClose, onSave, item, type }: MaintenanceModalProps) {
  const [form, setForm] = useState<any>({});

  const { data: crewData } = useQuery({
    queryKey: ["pilots"],
    queryFn: () => backend.operations.getPilots(),
    enabled: type === 'crew'
  });

  const { data: aircraftData } = useQuery({
    queryKey: ["aircrafts"],
    queryFn: () => backend.operations.getAircrafts(),
    enabled: type === 'aircraft'
  });

  useEffect(() => {
    if (item) {
      setForm(item);
    } else {
      setForm(type === 'crew' ? {
        crew_member_id: '',
        crew_member_name: '',
        item_type: '',
        expiration_date: '',
        notes: ''
      } : {
        aircraft_id: '',
        aircraft_registration: '',
        inspection_type: '',
        last_inspection_date: '',
        last_inspection_hours: 0,
        next_due_date: '',
        next_due_hours: 0,
        notes: ''
      });
    }
  }, [item, type]);

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCrewSelect = (id: string) => {
    const crew = crewData?.pilots.find(c => c.id === id);
    if (crew) {
      setForm(prev => ({ ...prev, crew_member_id: id, crew_member_name: crew.name }));
    }
  };

  const handleAircraftSelect = (id: string) => {
    const aircraft = aircraftData?.aircraft.find(a => a.id === id);
    if (aircraft) {
      setForm(prev => ({ ...prev, aircraft_id: id, aircraft_registration: aircraft.registration }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, type });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            {type === 'crew' ? <User className="w-5 h-5 text-cyan-400" /> : <Plane className="w-5 h-5 text-cyan-400" />}
            <span>{item ? 'Editar' : 'Novo'} Vencimento de {type === 'crew' ? 'Tripulante' : 'Aeronave'}</span>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {type === 'crew' ? (
              <>
                <div>
                  <Label htmlFor="crew_member_id" className="text-slate-300">Tripulante *</Label>
                  <Select value={form.crew_member_id} onValueChange={handleCrewSelect} required>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Selecione o tripulante" /></SelectTrigger>
                    <SelectContent>
                      {crewData?.pilots.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="item_type" className="text-slate-300">Tipo de Item *</Label>
                  <Select value={form.item_type} onValueChange={(v) => handleChange('item_type', v)} required>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CMA">CMA</SelectItem>
                      <SelectItem value="CHT">CHT</SelectItem>
                      <SelectItem value="IFR">IFR</SelectItem>
                      <SelectItem value="MLTE">MLTE</SelectItem>
                      <SelectItem value="MNTE">MNTE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expiration_date" className="text-slate-300">Data de Vencimento *</Label>
                  <Input id="expiration_date" type="date" value={form.expiration_date?.split('T')[0] || ''} onChange={(e) => handleChange('expiration_date', e.target.value)} required className="bg-slate-800 border-slate-700 text-white" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="aircraft_id" className="text-slate-300">Aeronave *</Label>
                  <Select value={form.aircraft_id} onValueChange={handleAircraftSelect} required>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Selecione a aeronave" /></SelectTrigger>
                    <SelectContent>
                      {aircraftData?.aircraft.map(a => <SelectItem key={a.id} value={a.id}>{a.registration}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="inspection_type" className="text-slate-300">Tipo de Inspeção *</Label>
                  <Input id="inspection_type" value={form.inspection_type || ''} onChange={(e) => handleChange('inspection_type', e.target.value)} required className="bg-slate-800 border-slate-700 text-white" placeholder="Ex: IAM, 50h, 100h" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="next_due_date" className="text-slate-300">Próximo Vencimento (Data)</Label>
                    <Input id="next_due_date" type="date" value={form.next_due_date?.split('T')[0] || ''} onChange={(e) => handleChange('next_due_date', e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="next_due_hours" className="text-slate-300">Próximo Vencimento (Horas)</Label>
                    <Input id="next_due_hours" type="number" step="0.1" value={form.next_due_hours || ''} onChange={(e) => handleChange('next_due_hours', parseFloat(e.target.value))} className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                </div>
              </>
            )}
            <div>
              <Label htmlFor="notes" className="text-slate-300">Observações</Label>
              <Textarea id="notes" value={form.notes || ''} onChange={(e) => handleChange('notes', e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">Salvar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
