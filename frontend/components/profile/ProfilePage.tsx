import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Edit, Save, User as UserIcon, Briefcase, Banknote, FileText, ArrowLeft, Camera } from "lucide-react";
import PersonalDataForm from "./PersonalDataForm";
import ProfessionalDataForm from "./ProfessionalDataForm";
import BankDataForm from "./BankDataForm";
import DocumentsSection from "./DocumentsSection";
import backend from "~backend/client";
import type { CreateUserProfileRequest, UpdateUserProfileRequest } from "~backend/profile/user-profile";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => backend.profile.getMyProfile()
  });

  const createProfileMutation = useMutation({
    mutationFn: (data: CreateUserProfileRequest) => backend.profile.createUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast({
        title: "Sucesso",
        description: "Perfil criado com sucesso!",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Error creating profile:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar perfil.",
        variant: "destructive",
      });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateUserProfileRequest) => backend.profile.updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil.",
        variant: "destructive",
      });
    }
  });

  const [formData, setFormData] = useState({
    dados_pessoais: {
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      rg: '',
      data_nascimento: new Date(),
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      estado_civil: '',
      nacionalidade: 'Brasileira'
    },
    dados_profissionais: {
      cargo: '',
      departamento: '',
      data_admissao: new Date(),
      salario: 0,
      tipo_contrato: '',
      supervisor: '',
      licencas: [],
      certificacoes: [],
      experiencia_anos: 0
    },
    dados_bancarios: {
      banco: '',
      agencia: '',
      conta: '',
      tipo_conta: '',
      pix: ''
    }
  });

  useEffect(() => {
    if (profileResponse?.profile) {
      const profile = profileResponse.profile;
      setFormData({
        dados_pessoais: profile.dados_pessoais,
        dados_profissionais: profile.dados_profissionais,
        dados_bancarios: profile.dados_bancarios
      });
      setProfileImage(profile.foto_perfil || null);
    }
  }, [profileResponse]);

  const handleSave = () => {
    if (profileResponse?.profile) {
      // Update existing profile
      updateProfileMutation.mutate({
        id: profileResponse.profile.id,
        foto_perfil: profileImage || undefined,
        dados_pessoais: formData.dados_pessoais,
        dados_profissionais: formData.dados_profissionais,
        dados_bancarios: formData.dados_bancarios
      });
    } else {
      // Create new profile
      createProfileMutation.mutate({
        user_id: "user_1", // Mock user ID
        foto_perfil: profileImage || undefined,
        dados_pessoais: formData.dados_pessoais,
        dados_profissionais: formData.dados_profissionais,
        dados_bancarios: formData.dados_bancarios
      });
    }
  };

  const handleUpdate = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], ...data }
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-slate-700 rounded"></div>
          <div className="h-10 bg-slate-700 rounded w-1/3"></div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Meu Perfil</h1>
            <p className="text-slate-400">Gerencie suas informações pessoais e profissionais.</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
          )}
          <Button 
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className="bg-cyan-600 hover:bg-cyan-700"
            disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
          >
            {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
            {isEditing ? 'Salvar Alterações' : 'Editar Perfil'}
          </Button>
        </div>
      </div>

      <Card className="bg-slate-900/90 backdrop-blur-sm border-slate-800">
        <CardContent className="p-6 flex items-center">
          <div className="relative group">
            <img
              src={profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'}
              alt="Foto de perfil"
              className="w-20 h-20 rounded-full object-cover border-2 border-cyan-400 shadow"
            />
            {isEditing && (
              <div 
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-6 h-6 text-white" />
              </div>
            )}
            <Input
              ref={fileInputRef}
              id="profile-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <div className="ml-6">
            <h2 className="text-2xl font-bold text-white">{formData.dados_pessoais.nome}</h2>
            <p className="text-slate-400">{formData.dados_profissionais.cargo}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-slate-900/90 backdrop-blur-sm border-slate-800">
          <TabsTrigger value="personal" className="text-slate-300 data-[state=active]:text-cyan-400">
            <UserIcon className="mr-2 h-4 w-4" />Dados Pessoais
          </TabsTrigger>
          <TabsTrigger value="professional" className="text-slate-300 data-[state=active]:text-cyan-400">
            <Briefcase className="mr-2 h-4 w-4" />Dados Profissionais
          </TabsTrigger>
          <TabsTrigger value="bank" className="text-slate-300 data-[state=active]:text-cyan-400">
            <Banknote className="mr-2 h-4 w-4" />Dados Bancários
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-slate-300 data-[state=active]:text-cyan-400">
            <FileText className="mr-2 h-4 w-4" />Documentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <PersonalDataForm 
            data={formData.dados_pessoais} 
            onUpdate={(data) => handleUpdate('dados_pessoais', data)} 
            isEditing={isEditing} 
          />
        </TabsContent>
        
        <TabsContent value="professional">
          <ProfessionalDataForm 
            data={formData.dados_profissionais} 
            onUpdate={(data) => handleUpdate('dados_profissionais', data)} 
            isEditing={isEditing} 
          />
        </TabsContent>
        
        <TabsContent value="bank">
          <BankDataForm 
            data={formData.dados_bancarios} 
            onUpdate={(data) => handleUpdate('dados_bancarios', data)} 
            isEditing={isEditing} 
          />
        </TabsContent>
        
        <TabsContent value="documents">
          <DocumentsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
