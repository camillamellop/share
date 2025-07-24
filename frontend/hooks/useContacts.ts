import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "./useBackend";
import { useToast } from "@/components/ui/use-toast";
import type { CreateContactRequest, UpdateContactRequest } from "~backend/agenda/contacts";

export function useContacts() {
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => backend.agenda.getContacts(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateContactRequest) => backend.agenda.createContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({ title: "Sucesso", description: "Contato criado com sucesso!" });
    },
    onError: (err: any) => {
      console.error("Error creating contact:", err);
      toast({ title: "Erro", description: err.message || "Erro ao criar contato.", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateContactRequest) => backend.agenda.updateContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({ title: "Sucesso", description: "Contato atualizado com sucesso!" });
    },
    onError: (err: any) => {
      console.error("Error updating contact:", err);
      toast({ title: "Erro", description: err.message || "Erro ao atualizar contato.", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => backend.agenda.deleteContact({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({ title: "Sucesso", description: "Contato excluído com sucesso!" });
    },
    onError: (err: any) => {
      console.error("Error deleting contact:", err);
      toast({ title: "Erro", description: err.message || "Erro ao excluir contato.", variant: "destructive" });
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (id: string) => backend.agenda.toggleFavorite({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
    onError: (err: any) => {
      console.error("Error toggling favorite:", err);
      toast({ title: "Erro", description: err.message || "Erro ao alterar favorito.", variant: "destructive" });
    }
  });

  return {
    contacts: data?.contacts || [],
    isLoading,
    isError,
    error,
    createContact: createMutation.mutate,
    updateContact: updateMutation.mutate,
    deleteContact: deleteMutation.mutate,
    toggleFavorite: toggleFavoriteMutation.mutate,
  };
}
