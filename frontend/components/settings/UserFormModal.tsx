import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, UserCog } from "lucide-react";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  user?: any;
}

export default function UserFormModal({ isOpen, onClose, onSave, user }: UserFormModalProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'crew',
    password: '',
    is_active: true,
    // New fields for creation
    cpf: '',
    department: '',
    position: '',
    anac_license: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'crew',
        password: '', // Password is for reset only, not displayed
        is_active: user.is_active !== false,
        // These fields are not available when editing, so we clear them
        cpf: '',
        department: '',
        position: '',
        anac_license: '',
      });
    } else {
      // Reset for creation
      setForm({
        name: '',
        email: '',
        role: 'crew',
        password: '',
        is_active: true,
        cpf: '',
        department: '',
        position: '',
        anac_license: '',
      });
    }
  }, [user]);

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave: any = { ...form };
    if (!dataToSave.password) {
      delete dataToSave.password; // Don't send empty password
    }
    onSave(dataToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <UserCog className="w-5 h-5 text-cyan-400" />
            <span>{user ? 'Editar Usuário' : 'Novo Usuário'}</span>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-slate-300">Nome Completo *</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="text-slate-300">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {!user && (
              <>
                <div>
                  <Label htmlFor="cpf" className="text-slate-300">CPF *</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    value={form.cpf}
                    onChange={(e) => handleChange('cpf', e.target.value)}
                    required
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department" className="text-slate-300">Departamento *</Label>
                    <Input
                      id="department"
                      name="department"
                      value={form.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      required
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="Ex: OPERAÇÕES"
                    />
                  </div>
                  <div>
                    <Label htmlFor="position" className="text-slate-300">Cargo *</Label>
                    <Input
                      id="position"
                      name="position"
                      value={form.position}
                      onChange={(e) => handleChange('position', e.target.value)}
                      required
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="Ex: Comandante"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="role" className="text-slate-300">Perfil *</Label>
              <Select value={form.role} onValueChange={(value) => handleChange('role', value)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="operations">Operações</SelectItem>
                  <SelectItem value="crew">Tripulação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.role === 'crew' && !user && (
              <div>
                <Label htmlFor="anac_license">Licença ANAC</Label>
                <Input
                  id="anac_license"
                  name="anac_license"
                  value={form.anac_license}
                  onChange={(e) => handleChange('anac_license', e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Ex: 123456"
                />
              </div>
            )}

            <div>
              <Label htmlFor="password">{user ? 'Nova Senha (deixe em branco para não alterar)' : 'Senha (padrão se em branco)'}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="is_active" className="text-slate-300">Usuário Ativo</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
                {user ? 'Atualizar' : 'Criar'} Usuário
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
