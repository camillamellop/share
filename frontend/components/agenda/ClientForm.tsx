import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const clientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  document: z.string().min(1, "Documento é obrigatório."),
  email: z.string().email("Email inválido.").optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
  active: z.boolean(),
});

type ClientFormData = z.infer<typeof clientSchema>;

export default function ClientForm({ client, onClose, onSave }: ClientFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      document: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      company: '',
      notes: '',
      active: true,
    }
  });

  useEffect(() => {
    if (client) {
      reset({
        name: client.name || '',
        document: client.document || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        city: client.city || '',
        state: client.state || '',
        zip_code: client.zip_code || '',
        company: client.company || '',
        notes: client.notes || '',
        active: client.active !== false,
      });
    } else {
      reset();
    }
  }, [client, reset]);

  const onSubmit = (data: ClientFormData) => {
    onSave({ ...data, id: client?.id });
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-slate-300">Nome *</Label>
                <Input id="name" {...register("name")} className="bg-slate-800 border-slate-700 text-white" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              
              <div>
                <Label htmlFor="document" className="text-slate-300">CPF/CNPJ *</Label>
                <Input id="document" {...register("document")} className="bg-slate-800 border-slate-700 text-white" />
                {errors.document && <p className="text-red-500 text-xs mt-1">{errors.document.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-slate-300">E-mail</Label>
                <Input id="email" type="email" {...register("email")} className="bg-slate-800 border-slate-700 text-white" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-slate-300">Telefone</Label>
                <Input id="phone" {...register("phone")} className="bg-slate-800 border-slate-700 text-white" />
              </div>
            </div>

            <div>
              <Label htmlFor="company" className="text-slate-300">Empresa</Label>
              <Input id="company" {...register("company")} className="bg-slate-800 border-slate-700 text-white" />
            </div>

            <div>
              <Label htmlFor="address" className="text-slate-300">Endereço</Label>
              <Input id="address" {...register("address")} className="bg-slate-800 border-slate-700 text-white" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city" className="text-slate-300">Cidade</Label>
                <Input id="city" {...register("city")} className="bg-slate-800 border-slate-700 text-white" />
              </div>
              <div>
                <Label htmlFor="state" className="text-slate-300">Estado</Label>
                <Input id="state" {...register("state")} className="bg-slate-800 border-slate-700 text-white" />
              </div>
              <div>
                <Label htmlFor="zip_code" className="text-slate-300">CEP</Label>
                <Input id="zip_code" {...register("zip_code")} className="bg-slate-800 border-slate-700 text-white" />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-slate-300">Observações</Label>
              <Textarea id="notes" {...register("notes")} className="bg-slate-800 border-slate-700 text-white" />
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="active" {...register("active")} className="rounded border-slate-700" />
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
