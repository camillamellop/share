import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Save, Loader2 } from "lucide-react";
import { useBackend } from "../../hooks/useBackend";
import PageHeader from "../PageHeader";

// Simple debounce hook
function useDebounce(callback: (...args: any[]) => void, delay: number) {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return useCallback((...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
    setTimeoutId(newTimeoutId);
  }, [callback, delay, timeoutId]);
}

export default function NotepadPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const backend = useBackend();
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { data: noteData, isLoading } = useQuery({
    queryKey: ["notepad"],
    queryFn: () => backend.notes.get()
  });

  const saveNoteMutation = useMutation({
    mutationFn: (data: { content: string }) => backend.notes.save(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notepad"] });
      setIsSaving(false);
      toast({
        title: "Salvo",
        description: "Suas anotações foram salvas.",
      });
    },
    onError: (error) => {
      console.error("Error saving note:", error);
      setIsSaving(false);
      toast({
        title: "Erro",
        description: "Não foi possível salvar suas anotações.",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (noteData?.note) {
      setContent(noteData.note.content);
    }
  }, [noteData]);

  const debouncedSave = useDebounce(() => {
    setIsSaving(true);
    saveNoteMutation.mutate({ content });
  }, 2000); // Auto-save after 2 seconds of inactivity

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    debouncedSave();
  };

  const handleManualSave = () => {
    setIsSaving(true);
    saveNoteMutation.mutate({ content });
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Bloco de Notas"
        description="Este é seu espaço para anotações rápidas. O conteúdo é salvo automaticamente."
        backPath="/"
      >
        <div className="flex items-center gap-2">
          {isSaving && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          <Button onClick={handleManualSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </PageHeader>

      <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
        <CardContent className="p-4">
          {isLoading ? (
            <div className="animate-pulse h-96 bg-slate-700 rounded-lg"></div>
          ) : (
            <Textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Comece a digitar suas anotações aqui..."
              className="w-full h-[60vh] bg-slate-800 border-slate-700 text-white p-4 text-base"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
