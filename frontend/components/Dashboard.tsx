import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import UserCard from "./UserCard";
import TasksSummary from "./TasksSummary";
import FlightsSummary from "./FlightsSummary";
import QuickActions from "./QuickActions";
import WorldMap from "./WorldMap";
import MaintenanceAlerts from "./maintenance/MaintenanceAlerts";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen bg-slate-950 relative overflow-hidden">
      {/* World Map Background */}
      <WorldMap />
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative z-10">
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            {/* Main content area */}
            <div className="lg:col-span-3 space-y-6">
              <QuickActions />
              <MaintenanceAlerts />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TasksSummary />
                <FlightsSummary />
              </div>
            </div>
            
            {/* Right sidebar */}
            <div className="space-y-6">
              <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg p-4 border border-slate-800">
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">HORÁRIO DO SISTEMA</div>
                  <div className="text-2xl font-mono text-cyan-400">
                    {currentTime.toLocaleTimeString('pt-BR')}
                  </div>
                  <div className="text-sm text-slate-400">
                    {currentTime.toLocaleDateString('pt-BR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
              
              <UserCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
