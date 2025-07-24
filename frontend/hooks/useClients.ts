import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "./useBackend";
import { useToast } from "@/components/ui/use-toast";
import type { CreateClientRequest, UpdateClientRequest } from "~backend/agenda/validators";

export function useClients() {
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["clients"],
    queryFn: () => backend.agenda.getClients(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateClientRequest) => backend.agenda.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Sucesso", description: "Cliente criado com sucesso!" });
    },
    onError: (err: any) => {
      console.error("Error creating client:", err);
      toast({ title: "Erro", description: err.message || "Erro ao criar cliente.", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateClientRequest) => backend.agenda.updateClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Sucesso", description: "Cliente atualizado com sucesso!" });
    },
    onError: (err: any) => {
      console.error("Error updating client:", err);
      toast({ title: "Erro", description: err.message || "Erro ao atualizar cliente.", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => backend.agenda.deleteClient({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Sucesso", description: "Cliente excluído com sucesso!" });
    },
    onError: (err: any) => {
      console.error("Error deleting client:", err);
      toast({ title: "Erro", description: err.message || "Erro ao excluir cliente.", variant: "destructive" });
    }
  });

  return {
    clients: data?.clients || [],
    isLoading,
    isError,
    error,
    createClient: createMutation.mutate,
    updateClient: updateMutation.mutate,
    deleteClient: deleteMutation.mutate,
  };
}
