import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, Plus, Edit, Trash2 } from "lucide-react";
import AnnouncementModal from "./AnnouncementModal";
import backend from "~backend/client";
import type { Announcement, CreateAnnouncementRequest } from "~backend/communications/announcements";
import PageHeader from "../PageHeader";

export default function CommunicationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const { data: announcementsData, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => backend.communications.list()
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAnnouncementRequest) => backend.communications.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast({ title: "Sucesso", description: "Comunicado publicado com sucesso!" });
    },
    onError: (error) => {
      console.error("Error creating announcement:", error);
      toast({ title: "Erro", description: "Erro ao publicar comunicado.", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => backend.communications.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast({ title: "Sucesso", description: "Comunicado atualizado com sucesso!" });
    },
    onError: (error) => {
      console.error("Error updating announcement:", error);
      toast({ title: "Erro", description: "Erro ao atualizar comunicado.", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => backend.communications.del({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast({ title: "Sucesso", description: "Comunicado excluído com sucesso!" });
    },
    onError: (error) => {
      console.error("Error deleting announcement:", error);
      toast({ title: "Erro", description: "Erro ao excluir comunicado.", variant: "destructive" });
    }
  });

  const handleSave = (data: any) => {
    if (editingAnnouncement) {
      updateMutation.mutate({ ...data, id: editingAnnouncement.id });
    } else {
      createMutation.mutate({ ...data, author: "Admin" }); // Mock author
    }
    setIsModalOpen(false);
    setEditingAnnouncement(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este comunicado?')) {
      deleteMutation.mutate(id);
    }
  };

  const openEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingAnnouncement(null);
    setIsModalOpen(true);
  };

  const announcements = announcementsData?.announcements || [];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Comunicações"
        description="Painel de comunicados e avisos importantes da empresa."
        backPath="/"
      >
        <Button onClick={openAddModal} className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Comunicado
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-700 rounded-lg" />)}
        </div>
      ) : announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map(ann => (
            <Card key={ann.id} className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-white">{ann.title}</CardTitle>
                  <p className="text-xs text-slate-400">
                    Publicado por {ann.author} em {new Date(ann.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(ann)}><Edit className="w-4 h-4 text-slate-400" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(ann.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 whitespace-pre-wrap">{ann.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">Nenhum comunicado publicado.</p>
        </div>
      )}

      {isModalOpen && (
        <AnnouncementModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          announcement={editingAnnouncement}
        />
      )}
    </div>
  );
}
