import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BankDataFormProps {
  data: any;
  onUpdate: (data: any) => void;
  isEditing: boolean;
}

export default function BankDataForm({ data, onUpdate, isEditing }: BankDataFormProps) {
  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  return (
    <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Dados Bancários</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="banco" className="text-slate-300">Banco</Label>
            <Input
              id="banco"
              value={data.banco || ''}
              onChange={(e) => handleChange('banco', e.target.value)}
              disabled={!isEditing}
              className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
              placeholder="Ex: Banco do Brasil, Itaú, etc."
            />
          </div>
          
          <div>
            <Label htmlFor="agencia" className="text-slate-300">Agência</Label>
            <Input
              id="agencia"
              value={data.agencia || ''}
              onChange={(e) => handleChange('agencia', e.target.value)}
              disabled={!isEditing}
              className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
              placeholder="Ex: 1234-5"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="conta" className="text-slate-300">Conta</Label>
            <Input
              id="conta"
              value={data.conta || ''}
              onChange={(e) => handleChange('conta', e.target.value)}
              disabled={!isEditing}
              className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
              placeholder="Ex: 12345-6"
            />
          </div>
          
          <div>
            <Label htmlFor="tipo_conta" className="text-slate-300">Tipo de Conta</Label>
            <Select 
              value={data.tipo_conta || ''} 
              onValueChange={(value) => handleChange('tipo_conta', value)}
              disabled={!isEditing}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white disabled:opacity-60">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="corrente">Conta Corrente</SelectItem>
                <SelectItem value="poupanca">Conta Poupança</SelectItem>
                <SelectItem value="salario">Conta Salário</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="pix" className="text-slate-300">Chave PIX</Label>
          <Input
            id="pix"
            value={data.pix || ''}
            onChange={(e) => handleChange('pix', e.target.value)}
            disabled={!isEditing}
            className="bg-slate-800 border-slate-700 text-white disabled:opacity-60"
            placeholder="CPF, e-mail, telefone ou chave aleatória"
          />
        </div>

        <div className="bg-slate-800/50 p-4 rounded-lg">
          <p className="text-slate-400 text-sm">
            <strong>Importante:</strong> Estes dados são utilizados para pagamentos de salário, 
            reembolsos e outras transações financeiras. Mantenha sempre atualizados.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
