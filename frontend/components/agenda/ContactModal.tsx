import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2 } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: any) => void;
  contact?: any;
}

const categories = [
  { value: 'hospedagem', label: 'Hospedagem', color: 'bg-blue-100 text-blue-800' },
  { value: 'transporte', label: 'Transporte', color: 'bg-green-100 text-green-800' },
  { value: 'servicos', label: 'Serviços', color: 'bg-purple-100 text-purple-800' },
  { value: 'cliente', label: 'Cliente', color: 'bg-pink-100 text-pink-800' },
  { value: 'fornecedor', label: 'Fornecedor', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'aeroporto', label: 'Aeroporto', color: 'bg-sky-100 text-sky-800' },
  { value: 'combustivel', label: 'Combustível', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'manutencao', label: 'Manutenção', color: 'bg-orange-100 text-orange-800' },
  { value: 'emergencia', label: 'Emergência', color: 'bg-red-100 text-red-800' },
  { value: 'outros', label: 'Outros', color: 'bg-gray-100 text-gray-800' },
];

export default function ContactModal({ isOpen, onClose, onSave, contact }: ContactModalProps) {
  const [form, setForm] = useState({
    nome: '',
    categoria_nome: '',
    categoria_cor: '',
    empresa: '',
    cargo: '',
    observacoes: '',
    favorito: false,
    telefones: [''],
    emails: [''],
    endereco_principal: '',
  });

  useEffect(() => {
    if (contact) {
      setForm({
        nome: contact.nome || '',
        categoria_nome: contact.categoria_nome || '',
        categoria_cor: contact.categoria_cor || '',
        empresa: contact.empresa || '',
        cargo: contact.cargo || '',
        observacoes: contact.observacoes || '',
        favorito: contact.favorito || false,
        telefones: contact.telefones?.length ? contact.telefones : [''],
        emails: contact.emails?.length ? contact.emails : [''],
        endereco_principal: contact.endereco_principal || '',
      });
    } else {
      setForm({
        nome: '',
        categoria_nome: '',
        categoria_cor: '',
        empresa: '',
        cargo: '',
        observacoes: '',
        favorito: false,
        telefones: [''],
        emails: [''],
        endereco_principal: '',
      });
    }
  }, [contact]);

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'telefones' | 'emails', index: number, value: string) => {
    const newArray = [...form[field]];
    newArray[index] = value;
    setForm(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'telefones' | 'emails') => {
    setForm(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field: 'telefones' | 'emails', index: number) => {
    const newArray = form[field].filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, [field]: newArray.length ? newArray : [''] }));
  };

  const handleCategoryChange = (value: string) => {
    const category = categories.find(cat => cat.value === value);
    setForm(prev => ({
      ...prev,
      categoria_nome: value,
      categoria_cor: category?.color || ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanedForm = {
      ...form,
      telefones: form.telefones.filter(phone => phone.trim() !== ''),
      emails: form.emails.filter(email => email.trim() !== ''),
    };

    onSave(cleanedForm);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">
            {contact ? 'Editar Contato' : 'Novo Contato'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome" className="text-slate-300">Nome *</Label>
                <Input
                  id="nome"
                  value={form.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="categoria" className="text-slate-300">Categoria *</Label>
                <Select value={form.categoria_nome} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <Badge className={category.color}>{category.label}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="empresa" className="text-slate-300">Empresa</Label>
                <Input
                  id="empresa"
                  value={form.empresa}
                  onChange={(e) => handleChange('empresa', e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="cargo" className="text-slate-300">Cargo</Label>
                <Input
                  id="cargo"
                  value={form.cargo}
                  onChange={(e) => handleChange('cargo', e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Telefones</Label>
              <div className="space-y-2">
                {form.telefones.map((phone, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={phone}
                      onChange={(e) => handleArrayChange('telefones', index, e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                    {form.telefones.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeArrayItem('telefones', index)}
                        className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('telefones')}
                  className="text-cyan-400 border-cyan-400 hover:bg-cyan-400 hover:text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Telefone
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-slate-300">E-mails</Label>
              <div className="space-y-2">
                {form.emails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => handleArrayChange('emails', index, e.target.value)}
                      placeholder="email@exemplo.com"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                    {form.emails.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeArrayItem('emails', index)}
                        className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('emails')}
                  className="text-cyan-400 border-cyan-400 hover:bg-cyan-400 hover:text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar E-mail
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="endereco" className="text-slate-300">Endereço Principal</Label>
              <Textarea
                id="endereco"
                value={form.endereco_principal}
                onChange={(e) => handleChange('endereco_principal', e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="observacoes" className="text-slate-300">Observações</Label>
              <Textarea
                id="observacoes"
                value={form.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="favorito"
                checked={form.favorito}
                onChange={(e) => handleChange('favorito', e.target.checked)}
                className="rounded border-slate-700"
              />
              <Label htmlFor="favorito" className="text-slate-300">Marcar como favorito</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                {contact ? 'Atualizar' : 'Criar'} Contato
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
