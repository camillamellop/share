import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, CalendarCheck } from "lucide-react";

interface FlightScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: any) => void;
  schedule?: any;
  config?: any;
}

export default function FlightScheduleModal({ isOpen, onClose, onSave, schedule, config }: FlightScheduleModalProps) {
  const [form, setForm] = useState({
    aeronave: '',
    data: '',
    horario: '',
    nome_cliente: '',
    destino: '',
    origem: '',
    passageiros: 1,
    tripulacao: '',
    observacoes: '',
    status: 'pendente',
    tipo_voo: 'executivo',
    duracao_estimada: '',
    contato_cliente: '',
  });

  useEffect(() => {
    if (schedule) {
      setForm({
        aeronave: schedule.aeronave || '',
        data: schedule.data ? new Date(schedule.data).toISOString().split('T')[0] : '',
        horario: schedule.horario || '',
        nome_cliente: schedule.nome_cliente || '',
        destino: schedule.destino || '',
        origem: schedule.origem || '',
        passageiros: schedule.passageiros || 1,
        tripulacao: schedule.tripulacao || '',
        observacoes: schedule.observacoes || '',
        status: schedule.status || 'pendente',
        tipo_voo: schedule.tipo_voo || 'executivo',
        duracao_estimada: schedule.duracao_estimada || '',
        contato_cliente: schedule.contato_cliente || '',
      });
    } else {
      setForm({
        aeronave: '',
        data: '',
        horario: '',
        nome_cliente: '',
        destino: '',
        origem: '',
        passageiros: 1,
        tripulacao: '',
        observacoes: '',
        status: 'pendente',
        tipo_voo: 'executivo',
        duracao_estimada: '',
        contato_cliente: '',
      });
    }
  }, [schedule]);

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const scheduleData = {
      ...form,
      data: new Date(form.data),
      passageiros: parseInt(form.passageiros.toString()) || 1,
    };

    onSave(scheduleData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <CalendarCheck className="w-5 h-5 text-cyan-400" />
            <span>{schedule ? 'Editar Agendamento' : 'Novo Agendamento'}</span>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="aeronave" className="text-slate-300">Aeronave *</Label>
                <Select value={form.aeronave} onValueChange={(value) => handleChange('aeronave', value)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Selecione a aeronave" />
                  </SelectTrigger>
                  <SelectContent>
                    {config?.aeronaves?.map((aircraft: string) => (
                      <SelectItem key={aircraft} value={aircraft}>{aircraft}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="data" className="text-slate-300">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={form.data}
                  onChange={(e) => handleChange('data', e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="horario" className="text-slate-300">Horário *</Label>
                <Input
                  id="horario"
                  type="time"
                  value={form.horario}
                  onChange={(e) => handleChange('horario', e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome_cliente" className="text-slate-300">Nome do Cliente *</Label>
                <Input
                  id="nome_cliente"
                  value={form.nome_cliente}
                  onChange={(e) => handleChange('nome_cliente', e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="contato_cliente" className="text-slate-300">Contato do Cliente *</Label>
                <Input
                  id="contato_cliente"
                  value={form.contato_cliente}
                  onChange={(e) => handleChange('contato_cliente', e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origem" className="text-slate-300">Origem *</Label>
                <Input
                  id="origem"
                  value={form.origem}
                  onChange={(e) => handleChange('origem', e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Ex: São Paulo (CGH)"
                />
              </div>
              
              <div>
                <Label htmlFor="destino" className="text-slate-300">Destino *</Label>
                <Input
                  id="destino"
                  value={form.destino}
                  onChange={(e) => handleChange('destino', e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Ex: Rio de Janeiro (SDU)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="passageiros" className="text-slate-300">Passageiros *</Label>
                <Input
                  id="passageiros"
                  type="number"
                  min="1"
                  value={form.passageiros}
                  onChange={(e) => handleChange('passageiros', parseInt(e.target.value) || 1)}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="duracao_estimada" className="text-slate-300">Duração Estimada *</Label>
                <Input
                  id="duracao_estimada"
                  value={form.duracao_estimada}
                  onChange={(e) => handleChange('duracao_estimada', e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Ex: 1h 30min"
                />
              </div>
              
              <div>
                <Label htmlFor="tipo_voo" className="text-slate-300">Tipo de Voo *</Label>
                <Select value={form.tipo_voo} onValueChange={(value) => handleChange('tipo_voo', value)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executivo">Executivo</SelectItem>
                    <SelectItem value="treinamento">Treinamento</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tripulacao" className="text-slate-300">Tripulação *</Label>
                <Input
                  id="tripulacao"
                  value={form.tripulacao}
                  onChange={(e) => handleChange('tripulacao', e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Ex: Cap. Roberto Santos"
                />
              </div>
              
              <div>
                <Label htmlFor="status" className="text-slate-300">Status</Label>
                <Select value={form.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="realizado">Realizado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes" className="text-slate-300">Observações</Label>
              <Textarea
                id="observacoes"
                value={form.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="Informações adicionais sobre o voo..."
              />
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg">
              <h4 className="text-slate-300 font-semibold mb-2">Informações Importantes:</h4>
              <ul className="text-slate-400 text-sm space-y-1">
                <li>• Confirme a disponibilidade da aeronave antes de agendar</li>
                <li>• Verifique as condições meteorológicas para a data do voo</li>
                <li>• Certifique-se de que a tripulação está disponível</li>
                <li>• Agendamentos pendentes podem ser cancelados pelo cliente</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                {schedule ? 'Atualizar' : 'Criar'} Agendamento
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
