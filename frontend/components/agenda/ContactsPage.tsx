import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Search, Plus, Edit, Phone, Mail, MapPin, Star, StarOff, Trash2 } from "lucide-react";
import ContactModal from "./ContactModal";
import backend from "~backend/client";
import type { Contact, CreateContactRequest } from "~backend/agenda/contacts";
import PageHeader from "../PageHeader";

export default function ContactsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { data: contactsData, isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => backend.agenda.getContacts()
  });

  const createContactMutation = useMutation({
    mutationFn: (data: CreateContactRequest) => backend.agenda.createContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({
        title: "Sucesso",
        description: "Contato criado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error creating contact:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar contato.",
        variant: "destructive",
      });
    }
  });

  const updateContactMutation = useMutation({
    mutationFn: (data: any) => backend.agenda.updateContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({
        title: "Sucesso",
        description: "Contato atualizado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error updating contact:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar contato.",
        variant: "destructive",
      });
    }
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: string) => backend.agenda.deleteContact({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({
        title: "Sucesso",
        description: "Contato excluído com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error deleting contact:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir contato.",
        variant: "destructive",
      });
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (id: string) => backend.agenda.toggleFavorite({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
    onError: (error) => {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Erro",
        description: "Erro ao alterar favorito.",
        variant: "destructive",
      });
    }
  });

  const contacts = contactsData?.contacts || [];

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchTerm || 
      contact.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.categoria_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.telefones?.some(phone => phone.includes(searchTerm)) ||
      contact.emails?.some(email => email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = !selectedCategory || contact.categoria_nome === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSaveContact = (contactData: any) => {
    if (editingContact) {
      updateContactMutation.mutate({ ...contactData, id: editingContact.id });
    } else {
      createContactMutation.mutate(contactData);
    }
    setIsModalOpen(false);
    setEditingContact(null);
  };

  const handleDeleteContact = (contactId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este contato?')) {
      deleteContactMutation.mutate(contactId);
    }
  };

  const toggleFavorite = (contactId: string) => {
    toggleFavoriteMutation.mutate(contactId);
  };

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      hospedagem: 'bg-blue-100 text-blue-800',
      transporte: 'bg-green-100 text-green-800',
      servicos: 'bg-purple-100 text-purple-800',
      cliente: 'bg-pink-100 text-pink-800',
      fornecedor: 'bg-indigo-100 text-indigo-800',
      aeroporto: 'bg-sky-100 text-sky-800',
      combustivel: 'bg-yellow-100 text-yellow-800',
      manutencao: 'bg-orange-100 text-orange-800',
      emergencia: 'bg-red-100 text-red-800',
      outros: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.outros;
  };

  const categories = [
    'hospedagem',
    'transporte',
    'servicos',
    'cliente',
    'fornecedor',
    'aeroporto',
    'combustivel',
    'manutencao',
    'emergencia',
    'outros',
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="h-10 bg-slate-700 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Agenda de Contatos"
        description="Gerencie contatos importantes da empresa."
        backPath="/"
      >
        <Button onClick={openAddModal} className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="w-4 h-4 mr-2" /> Adicionar Contato
        </Button>
      </PageHeader>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar contatos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('')}
            className={selectedCategory === '' ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
          >
            Todos
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {filteredContacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map(contact => (
            <Card key={contact.id} className="bg-slate-900/90 backdrop-blur-sm border-slate-800 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-base font-semibold text-white">
                        {contact.nome}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleFavorite(contact.id)}
                      >
                        {contact.favorito ? (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        ) : (
                          <StarOff className="w-4 h-4 text-slate-400" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryColor(contact.categoria_nome)}>
                        {contact.categoria_nome}
                      </Badge>
                      {contact.empresa && (
                        <span className="text-sm text-slate-400">• {contact.empresa}</span>
                      )}
                    </div>
                    {contact.cargo && <p className="text-sm text-slate-500">{contact.cargo}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditModal(contact)}
                    >
                      <Edit className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteContact(contact.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {contact.telefones?.map((phone, i) => (
                  <div key={`p-${i}`} className="flex items-center text-slate-300">
                    <Phone className="w-4 h-4 mr-2 text-green-400" /> {phone}
                  </div>
                ))}
                {contact.emails?.map((email, i) => (
                  <div key={`e-${i}`} className="flex items-center text-slate-300">
                    <Mail className="w-4 h-4 mr-2 text-blue-400" /> {email}
                  </div>
                ))}
                {contact.endereco_principal && (
                  <div className="flex items-start text-slate-300">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 text-red-400 flex-shrink-0" />
                    {contact.endereco_principal}
                  </div>
                )}
                {contact.observacoes && (
                  <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-md p-2 mt-2">
                    <p className="text-xs text-yellow-400">{contact.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">Nenhum contato encontrado.</p>
          <Button onClick={openAddModal} className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="w-4 h-4 mr-2" /> Adicionar Primeiro Contato
          </Button>
        </div>
      )}

      {isModalOpen && (
        <ContactModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveContact}
          contact={editingContact}
        />
      )}
    </div>
  );
}
