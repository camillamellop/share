import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PersonalDataFormProps {
  data: any;
  onUpdate: (data: any) => void;
  isEditing: boolean;
}

export default function PersonalDataForm({ data, onUpdate, isEditing }: PersonalDataFormProps) {
  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  return (
    <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Dados Pessoais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nome" className="text-slate-300">Nome Completo *</Label>
            <Input
              id="nome"
              value={data.nome || ''}
              onChange={(e) => handleChange('nome', e.target.value)}
              disabled={!isEditing}
              className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="text-slate-300">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={data.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={!isEditing}
              className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="telefone" className="text-slate-300">Telefone</Label>
            <Input
              id="telefone"
              value={data.telefone || ''}
              onChange={(e) => handleChange('telefone', e.target.value)}
              disabled={!isEditing}
              className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
            />
          </div>
          
          <div>
            <Label htmlFor="cpf" className="text-slate-300">CPF</Label>
            <Input
              id="cpf"
              value={data.cpf || ''}
              onChange={(e) => handleChange('cpf', e.target.value)}
              disabled={!isEditing}
              className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
            />
          </div>
          
          <div>
            <Label htmlFor="rg" className="text-slate-300">RG</Label>
            <Input
              id="rg"
              value={data.rg || ''}
              onChange={(e) => handleChange('rg', e.target.value)}
              disabled={!isEditing}
              className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="data_nascimento" className="text-slate-300">Data de Nascimento</Label>
            <Input
              id="data_nascimento"
              type="date"
              value={data.data_nascimento ? new Date(data.data_nascimento).toISOString().split('T')[0] : ''}
              onChange={(e) => handleChange('data_nascimento', new Date(e.target.value))}
              disabled={!isEditing}
              className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
            />
          </div>
          
          <div>
            <Label htmlFor="estado_civil" className="text-slate-300">Estado Civil</Label>
            <Select 
              value={data.estado_civil || ''} 
              onValueChange={(value) => handleChange('estado_civil', value)}
              disabled={!isEditing}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white disabled:opacity-60">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                <SelectItem value="casado">Casado(a)</SelectItem>
                <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                <SelectItem value="uniao_estavel">União Estável</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="endereco" className="text-slate-300">Endereço Completo</Label>
          <Input
            id="endereco"
            value={data.endereco || ''}
            onChange={(e) => handleChange('endereco', e.target.value)}
            disabled={!isEditing}
            className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="cidade" className="text-slate-300">Cidade</Label>
            <Input
              id="cidade"
              value={data.cidade || ''}
              onChange={(e) => handleChange('cidade', e.target.value)}
              disabled={!isEditing}
              className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
            />
          </div>
          
          <div>
            <Label htmlFor="estado" className="text-slate-300">Estado</Label>
            <Input
              id="estado"
              value={data.estado || ''}
              onChange={(e) => handleChange('estado', e.target.value)}
              disabled={!isEditing}
              className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
            />
          </div>
          
          <div>
            <Label htmlFor="cep" className="text-slate-300">CEP</Label>
            <Input
              id="cep"
              value={data.cep || ''}
              onChange={(e) => handleChange('cep', e.target.value)}
              disabled={!isEditing}
              className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="nacionalidade" className="text-slate-300">Nacionalidade</Label>
          <Input
            id="nacionalidade"
            value={data.nacionalidade || 'Brasileira'}
            onChange={(e) => handleChange('nacionalidade', e.target.value)}
            disabled={!isEditing}
            className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
          />
        </div>
      </CardContent>
    </Card>
  );
}
