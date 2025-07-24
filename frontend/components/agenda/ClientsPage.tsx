import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import ClientTable from "./ClientTable";
import ClientForm from "./ClientForm";
import PageHeader from "../PageHeader";
import { useClients } from "../../hooks/useClients";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";

export default function ClientsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { clients, isLoading, isError, error, createClient, updateClient, deleteClient } = useClients();

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDelete = (clientId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteClient(clientId);
    }
  };

  const handleSave = (client: any) => {
    if (client.id) {
      updateClient(client);
    } else {
      const { id, ...clientData } = client;
      createClient(clientData);
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
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
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

      {isLoading && <LoadingSpinner />}
      {isError && <ErrorMessage message={error?.message || "Erro ao carregar clientes."} />}
      {!isLoading && !isError && (
        <ClientTable
          clients={filteredClients}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

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
