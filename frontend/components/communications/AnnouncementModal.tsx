import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, MessageSquare } from "lucide-react";

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  announcement?: any;
}

export default function AnnouncementModal({ isOpen, onClose, onSave, announcement }: AnnouncementModalProps) {
  const [form, setForm] = useState({ title: '', content: '' });

  useEffect(() => {
    if (announcement) {
      setForm({ title: announcement.title, content: announcement.content });
    } else {
      setForm({ title: '', content: '' });
    }
  }, [announcement]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <span>{announcement ? 'Editar' : 'Novo'} Comunicado</span>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-slate-300">Título *</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="content" className="text-slate-300">Conteúdo *</Label>
              <Textarea
                id="content"
                name="content"
                value={form.content}
                onChange={handleChange}
                required
                rows={10}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">Publicar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
