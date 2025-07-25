import { useState } from "react";
import { 
  Plane, 
  Calendar, 
  FileText, 
  Users, 
  Settings, 
  BarChart3, 
  MessageSquare,
  Home,
  Briefcase,
  DollarSign,
  Receipt,
  Building2,
  ChevronDown,
  ChevronRight,
  Phone,
  UserCheck,
  User,
  Palmtree,
  CalendarCheck,
  Route,
  BookOpen,
  UserCog,
  Scale,
  ShoppingCart,
  CheckSquare,
  Bell,
  X
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isMobileOpen: boolean;
  setMobileOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isMobileOpen, setMobileOpen }: SidebarProps) {
  const { user } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    "Portal Financeiro": true,
    "Agenda": true,
    "Configurações": true,
  });

  const menuItems = [
    { icon: Home, label: "Início", active: true, path: "/" },
    { 
      icon: Calendar, 
      label: "Agenda",
      hasSubmenu: true,
      submenu: [
        { icon: Phone, label: "Contatos", path: "/agenda/contacts" },
        { icon: UserCheck, label: "Clientes/Cotistas", path: "/agenda/clients" }
      ]
    },
    { icon: BarChart3, label: "Relatórios", path: "/reports" },
    { icon: Users, label: "Tripulação" },
    { icon: Briefcase, label: "Manutenção", path: "/maintenance" },
    { icon: MessageSquare, label: "Comunicações", path: "/communications" },
    { icon: CheckSquare, label: "Tarefas", path: "/tasks" },
    { icon: FileText, label: "Documentos" },
    { 
      icon: DollarSign, 
      label: "Portal Financeiro",
      hasSubmenu: true,
      submenu: [
        { icon: Building2, label: "Config. Empresa", path: "/financial/company-config" },
        { icon: Receipt, label: "Emissão de Recibo", path: "/financial/receipts" },
        { icon: FileText, label: "Relatório de Viagem", path: "/financial/travel-reports" },
        { icon: DollarSign, label: "Cobrança", path: "/financial/billing" },
        { icon: Scale, label: "Conciliação", path: "/financial/reconciliation" },
        { icon: ShoppingCart, label: "Solicitações de Compras", path: "/financial/purchasing" }
      ]
    },
    { icon: User, label: "Meu Perfil", path: "/profile" },
    { icon: Palmtree, label: "Férias", path: "/vacation" },
    { 
      icon: Settings, 
      label: "Configurações",
      hasSubmenu: true,
      submenu: [
        { icon: Bell, label: "Notificações", path: "/settings/notifications" },
        ...(user?.role === 'admin' ? [{ icon: UserCog, label: "Gestão de Usuários", path: "/settings/users" }] : [])
      ]
    }
  ];

  const toggleSubmenu = (menuLabel: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuLabel]: !prev[menuLabel]
    }));
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold">Gestão Share Brasil</h1>
            <p className="text-slate-400 text-sm">Portal do Colaborador</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="lg:hidden text-slate-400" onClick={() => setMobileOpen(false)}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <div>
                <a
                  href={item.path || "#"}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    item.active
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                  }`}
                  onClick={(e) => {
                    if (item.hasSubmenu) {
                      e.preventDefault();
                      toggleSubmenu(item.label);
                    } else {
                      setMobileOpen(false); // Close on navigation
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {item.hasSubmenu && (
                    <div className="ml-2">
                      {expandedMenus[item.label] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </a>
                
                {item.hasSubmenu && expandedMenus[item.label] && item.submenu && (
                  <ul className="ml-8 mt-2 space-y-1">
                    {item.submenu.map((subitem, subindex) => (
                      <li key={subindex}>
                        <a
                          href={subitem.path}
                          onClick={() => setMobileOpen(false)} // Close on navigation
                          className="flex items-center space-x-2 px-2 py-1 text-xs text-slate-400 hover:text-cyan-400 hover:bg-slate-800/30 rounded transition-colors"
                        >
                          <subitem.icon className="w-3 h-3" />
                          <span>{subitem.label}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900/95 backdrop-blur-sm border-r border-slate-800 flex flex-col z-40 
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 150, 255, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 150, 255, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        ></div>
        
        <div className="relative z-10 flex flex-col h-full">
          <SidebarContent />
        </div>
      </div>
    </>
  );
}
