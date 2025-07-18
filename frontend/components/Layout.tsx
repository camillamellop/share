import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import WorldMap from "./WorldMap";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-slate-950 relative overflow-hidden">
      <WorldMap />
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
