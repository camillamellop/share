import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, User, Plane } from "lucide-react";

interface CrewMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: any) => void;
  member?: any;
}

export default function CrewMemberModal({ isOpen, onClose, onSave, member }: CrewMemberModalProps) {
  const [form, setForm] = useState({
    name: '',
    cpf: '',
    department: '',
    position: '',
    anac_license: '',
    is_pilot: false,
    is_active: true,
  });

  useEffect(() => {
    if (member) {
      setForm({
        name: member.name || '',
        cpf: member.cpf || '',
        department: member.department || '',
        position: member.position || '',
        anac_license: member.anac_license || '',
        is_pilot: member.is_pilot || false,
        is_active: member.is_active !== false,
      });
    } else {
      setForm({
        name: '',
        cpf: '',
        department: '',
        position: '',
        anac_license: '',
        is_pilot: false,
        is_active: true,
      });
    }
  }, [member]);

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <User className="w-5 h-5 text-cyan-400" />
            <span>{member ? 'Editar Membro' : 'Novo Membro da Tripulação'}</span>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-slate-300">Nome Completo *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Ex: João Silva Santos"
                />
              </div>
              
              <div>
                <Label htmlFor="cpf" className="text-slate-300">CPF</Label>
                <Input
                  id="cpf"
                  value={form.cpf}
                  onChange={(e) => handleChange('cpf', e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department" className="text-slate-300">Departamento *</Label>
                <Select value={form.department} onValueChange={(value) => handleChange('department', value)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADM">ADM</SelectItem>
                    <SelectItem value="OPERAÇÕES">OPERAÇÕES</SelectItem>
                    <SelectItem value="DOCUMENTOS">DOCUMENTOS</SelectItem>
                    <SelectItem value="MKT">MKT</SelectItem>
                    <SelectItem value="MANUTENÇÃO">MANUTENÇÃO</SelectItem>
                    <SelectItem value="FINANCEIRO">FINANCEIRO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="position" className="text-slate-300">Cargo *</Label>
                <Input
                  id="position"
                  value={form.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Ex: Comandante, Administrativo"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_pilot"
                  checked={form.is_pilot}
                  onChange={(e) => handleChange('is_pilot', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="is_pilot" className="text-slate-300 flex items-center">
                  <Plane className="w-4 h-4 mr-2 text-cyan-400" />
                  É Piloto/Tripulante
                </Label>
              </div>

              {form.is_pilot && (
                <div>
                  <Label htmlFor="anac_license" className="text-slate-300">Licença ANAC</Label>
                  <Input
                    id="anac_license"
                    value={form.anac_license}
                    onChange={(e) => handleChange('anac_license', e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="Ex: 113374"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => handleChange('is_active', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="is_active" className="text-slate-300">
                  Ativo
                </Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                {member ? 'Atualizar' : 'Criar'} Membro
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
