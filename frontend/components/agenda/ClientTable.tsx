import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Mail, Phone } from "lucide-react";

interface ClientTableProps {
  clients: any[];
  loading: boolean;
  onEdit: (client: any) => void;
  onDelete: (clientId: string) => void;
}

export default function ClientTable({ clients, loading, onEdit, onDelete }: ClientTableProps) {
  if (loading) {
    return (
      <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-slate-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (clients.length === 0) {
    return (
      <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
        <CardContent className="p-6 text-center">
          <p className="text-slate-400">Nenhum cliente encontrado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Clientes Cadastrados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-semibold">{client.name}</h3>
                    <Badge variant={client.active ? "default" : "secondary"}>
                      {client.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">CPF/CNPJ: <span className="text-slate-300">{client.document}</span></p>
                      {client.company && (
                        <p className="text-slate-400">Empresa: <span className="text-slate-300">{client.company}</span></p>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {client.email && (
                        <div className="flex items-center text-slate-300">
                          <Mail className="w-4 h-4 mr-2 text-blue-400" />
                          {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center text-slate-300">
                          <Phone className="w-4 h-4 mr-2 text-green-400" />
                          {client.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {client.address && (
                    <p className="text-slate-400 text-sm mt-2">
                      Endereço: <span className="text-slate-300">{client.address}</span>
                    </p>
                  )}
                  
                  {client.notes && (
                    <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-md p-2 mt-2">
                      <p className="text-xs text-yellow-400">{client.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(client)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(client.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
