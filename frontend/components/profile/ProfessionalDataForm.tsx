import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ProfessionalDataFormProps {
  data: any;
  onUpdate: (data: any) => void;
  isEditing: boolean;
}

export default function ProfessionalDataForm({ data, onUpdate, isEditing }: ProfessionalDataFormProps) {
  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleArrayChange = (field: string, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    onUpdate({ [field]: array });
  };

  return (
    <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Dados Profissionais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cargo" className="text-slate-300">Cargo *</Label>
            <Input
              id="cargo"
              value={data.cargo || ''}
              onChange={(e) => handleChange('cargo', e.target.value)}
              disabled={!isEditing}
              className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
            />
          </div>
          
          <div>
            <Label htmlFor="departamento" className="text-slate-300">Departamento *</Label>
            <Input
              id="departamento"
              value={data.departamento || ''}
              onChange={(e) => handleChange('departamento', e.target.value)}
              disabled={!isEditing}
              className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="data_admissao" className="text-slate-300">Data de Admissão</Label>
            <Input
              id="data_admissao"
              type="date"
              value={data.data_admissao ? new Date(data.data_admissao).toISOString().split('T')[0] : ''}
              onChange={(e) => handleChange('data_admissao', new Date(e.target.value))}
              disabled={!isEditing}
              className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
            />
          </div>
          
          <div>
            <Label htmlFor="experiencia_anos" className="text-slate-300">Anos de Experiência</Label>
            <Input
              id="experiencia_anos"
              type="number"
              value={data.experiencia_anos || 0}
              onChange={(e) => handleChange('experiencia_anos', parseInt(e.target.value) || 0)}
              disabled={!isEditing}
              className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="salario" className="text-slate-300">Salário (R$)</Label>
            <Input
              id="salario"
              type="number"
              step="0.01"
              value={data.salario || 0}
              onChange={(e) => handleChange('salario', parseFloat(e.target.value) || 0)}
              disabled={!isEditing}
              className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
            />
          </div>
          
          <div>
            <Label htmlFor="tipo_contrato" className="text-slate-300">Tipo de Contrato</Label>
            <Select 
              value={data.tipo_contrato || ''} 
              onValueChange={(value) => handleChange('tipo_contrato', value)}
              disabled={!isEditing}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white disabled:opacity-60">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clt">CLT</SelectItem>
                <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                <SelectItem value="estagio">Estágio</SelectItem>
                <SelectItem value="terceirizado">Terceirizado</SelectItem>
                <SelectItem value="temporario">Temporário</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="supervisor" className="text-slate-300">Supervisor Direto</Label>
          <Input
            id="supervisor"
            value={data.supervisor || ''}
            onChange={(e) => handleChange('supervisor', e.target.value)}
            disabled={!isEditing}
            className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
          />
        </div>

        <div>
          <Label htmlFor="licencas" className="text-slate-300">Licenças (separadas por vírgula)</Label>
          <Textarea
            id="licencas"
            value={data.licencas?.join(', ') || ''}
            onChange={(e) => handleArrayChange('licencas', e.target.value)}
            disabled={!isEditing}
            className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
            placeholder="Ex: ANAC, ICAO, etc."
          />
        </div>

        <div>
          <Label htmlFor="certificacoes" className="text-slate-300">Certificações (separadas por vírgula)</Label>
          <Textarea
            id="certificacoes"
            value={data.certificacoes?.join(', ') || ''}
            onChange={(e) => handleArrayChange('certificacoes', e.target.value)}
            disabled={!isEditing}
            className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
            placeholder="Ex: Certificação de Segurança, Primeiros Socorros, etc."
          />
        </div>
      </CardContent>
    </Card>
  );
}
