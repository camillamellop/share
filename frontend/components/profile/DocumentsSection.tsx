import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Trash2, Download, FileText } from "lucide-react";
import { useBackend } from "../../hooks/useBackend";
import type { UploadDocumentRequest } from "~backend/profile/documents";

export default function DocumentsSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const backend = useBackend();

  const { data: documentsResponse, isLoading } = useQuery({
    queryKey: ["userDocuments"],
    queryFn: () => backend.profile.getMyDocuments()
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: (data: UploadDocumentRequest) => backend.profile.uploadDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userDocuments"] });
      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error uploading document:", error);
      toast({
        title: "Erro",
        description: "Erro ao enviar documento.",
        variant: "destructive",
      });
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (id: string) => backend.profile.deleteDocument({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userDocuments"] });
      toast({
        title: "Sucesso",
        description: "Documento excluído com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Error deleting document:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir documento.",
        variant: "destructive",
      });
    }
  });

  const downloadDocumentMutation = useMutation({
    mutationFn: (id: string) => backend.profile.downloadDocument({ id }),
    onSuccess: (data) => {
      window.open(data.url, '_blank');
    },
    onError: (error) => {
      console.error("Error downloading document:", error);
      toast({
        title: "Erro",
        description: "Erro ao baixar documento.",
        variant: "destructive",
      });
    }
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, tipo: "pessoais" | "aleatorios" | "holerites") => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1]; // Remove data:mime;base64, prefix
        
        uploadDocumentMutation.mutate({
          nome: file.name,
          tipo,
          arquivo_base64: base64,
          mime_type: file.type
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      deleteDocumentMutation.mutate(id);
    }
  };

  const handleDownload = (id: string) => {
    downloadDocumentMutation.mutate(id);
  };

  const renderFileList = (files: any[], tipo: string) => (
    <ul className="mt-2 space-y-2">
      {files.map((file) => (
        <li key={file.id} className="flex items-center justify-between border border-slate-700 px-3 py-2 rounded bg-slate-800/50">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="truncate max-w-xs text-slate-300">{file.nome}</span>
            <span className="text-xs text-slate-500">
              ({(file.tamanho / 1024).toFixed(1)} KB)
            </span>
          </div>
          <div className="flex space-x-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleDownload(file.id)}
              className="text-blue-400 hover:text-blue-300"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleDelete(file.id)}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );

  const documents = documentsResponse?.documents || [];
  const docsPessoais = documents.filter(doc => doc.tipo === 'pessoais');
  const docsAleatorios = documents.filter(doc => doc.tipo === 'aleatorios');
  const holerites = documents.filter(doc => doc.tipo === 'holerites');

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                <div className="h-10 bg-slate-700 rounded"></div>
                <div className="space-y-2">
                  <div className="h-8 bg-slate-700 rounded"></div>
                  <div className="h-8 bg-slate-700 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Documentos Pessoais */}
      <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Documentos Pessoais</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input 
            type="file" 
            multiple 
            onChange={e => handleUpload(e, 'pessoais')}
            className="bg-slate-800 border-slate-700 text-white"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          {renderFileList(docsPessoais, 'pessoais')}
        </CardContent>
      </Card>

      {/* Documentos Aleatórios */}
      <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-yellow-400" />
            <span>Documentos Aleatórios</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input 
            type="file" 
            multiple 
            onChange={e => handleUpload(e, 'aleatorios')}
            className="bg-slate-800 border-slate-700 text-white"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          {renderFileList(docsAleatorios, 'aleatorios')}
        </CardContent>
      </Card>

      {/* Holerites */}
      <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-green-400" />
            <span>Holerites</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input 
            type="file" 
            multiple 
            onChange={e => handleUpload(e, 'holerites')}
            className="bg-slate-800 border-slate-700 text-white"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          {renderFileList(holerites, 'holerites')}
        </CardContent>
      </Card>
    </div>
  );
}
