import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search } from "lucide-react";
import ClientTable from "./ClientTable";
import ClientForm from "./ClientForm";
import backend from "~backend/client";
import type { CreateClientRequest } from "~backend/agenda/clients";
import PageHeader from "../PageHeader";

export default function ClientsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: clientsData, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => backend.agenda.getClients()
  });

  const createClientMutation = useMutation({
    mutationFn: (data: CreateClientRequest) => backend.agenda.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: "Sucesso",
        description: "Cliente criado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error creating client:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar cliente.",
        variant: "destructive",
      });
    }
  });

  const updateClientMutation = useMutation({
    mutationFn: (data: any) => backend.agenda.updateClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error updating client:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar cliente.",
        variant: "destructive",
      });
    }
  });

  const deleteClientMutation = useMutation({
    mutationFn: (id: string) => backend.agenda.deleteClient({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error deleting client:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir cliente.",
        variant: "destructive",
      });
    }
  });

  const clients = clientsData?.clients || [];

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDelete = (clientId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteClientMutation.mutate(clientId);
    }
  };

  const handleSave = (client: any) => {
    if (client.id) {
      updateClientMutation.mutate(client);
    } else {
      const { id, ...clientData } = client;
      createClientMutation.mutate(clientData);
    }
    setShowForm(false);
    setEditingClient(null);
  };

  const openForm = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Gestão de Clientes"
        description="Cadastre e gerencie os clientes e cotistas."
        backPath="/"
      >
        <Button onClick={openForm} className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </PageHeader>

      <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-800 p-4 rounded-lg">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome, documento, e-mail ou empresa..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-800 border-slate-700 text-white"
          />
        </div>
      </div>

      <ClientTable
        clients={filteredClients}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showForm && (
        <ClientForm
          client={editingClient}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
