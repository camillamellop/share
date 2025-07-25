import { useState, useEffect } from "react";
import UserCard from "./UserCard";
import TasksSummary from "./TasksSummary";
import FlightsSummary from "./FlightsSummary";
import QuickActions from "./QuickActions";
import MaintenanceAlerts from "./maintenance/MaintenanceAlerts";
import OperationsMaintenanceMenu from "./OperationsMaintenanceMenu";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Main content area */}
      <div className="lg:col-span-3 space-y-6">
        <QuickActions />
        <MaintenanceAlerts />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TasksSummary />
          <div className="space-y-6">
            <FlightsSummary />
            <UserCard />
          </div>
        </div>
      </div>
      
      {/* Right sidebar */}
      <div className="lg:col-span-1 space-y-6">
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
        
        <OperationsMaintenanceMenu />
      </div>
    </div>
  );
}
