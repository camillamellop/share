import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

interface ClientFormProps {
  client?: any;
  onClose: () => void;
  onSave: (client: any) => void;
}

export default function ClientForm({ client, onClose, onSave }: ClientFormProps) {
  const [form, setForm] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    notes: '',
    active: true,
  });

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name || '',
        document: client.document || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        company: client.company || '',
        notes: client.notes || '',
        active: client.active !== false,
      });
    }
  }, [client]);

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, id: client?.id });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">
            {client ? 'Editar Cliente' : 'Novo Cliente'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-slate-300">Nome *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="document" className="text-slate-300">CPF/CNPJ *</Label>
                <Input
                  id="document"
                  value={form.document}
                  onChange={(e) => handleChange('document', e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-slate-300">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-slate-300">Telefone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="company" className="text-slate-300">Empresa</Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) => handleChange('company', e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="address" className="text-slate-300">Endereço</Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-slate-300">Observações</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => handleChange('active', e.target.checked)}
                className="rounded border-slate-700"
              />
              <Label htmlFor="active" className="text-slate-300">Cliente ativo</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                {client ? 'Atualizar' : 'Criar'} Cliente
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
