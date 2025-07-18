import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import WorldMap from "./WorldMap";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 relative overflow-hidden">
      <WorldMap />
      
      <Sidebar isMobileOpen={isSidebarOpen} setMobileOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden lg:ml-64">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
