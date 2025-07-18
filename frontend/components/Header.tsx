import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Thermometer, Loader2, Menu } from "lucide-react";
import backend from "~backend/client";
import GlobalSearch from "./GlobalSearch";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback location (e.g., São Paulo)
          setLocation({ lat: -23.5505, lon: -46.6333 });
        }
      );
    } else {
      // Fallback for browsers that don't support geolocation
      setLocation({ lat: -23.5505, lon: -46.6333 });
    }
  }, []);

  const { data: weatherData, isLoading } = useQuery({
    queryKey: ["currentWeather", location],
    queryFn: () => backend.dashboard.getCurrentWeather({ lat: location!.lat, lon: location!.lon }),
    enabled: !!location,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return (
    <header className="bg-slate-900/90 backdrop-blur-sm border-b border-slate-800 p-4 relative z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={onMenuClick}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <h1 className="text-lg md:text-2xl font-bold text-white truncate">
            Bem-vindo ao Portal Share Brasil
          </h1>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="hidden md:block">
            <GlobalSearch />
          </div>
          
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="hidden sm:flex items-center space-x-2 p-2 text-slate-300">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            ) : weatherData ? (
              <>
                <Thermometer className="w-5 h-5 text-cyan-400" />
                <div className="text-sm">
                  <span>{weatherData.temperature}°C</span>
                  <span className="text-slate-400 hidden lg:inline"> em </span>
                  <span className="font-semibold hidden lg:inline">{weatherData.location}</span>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
      <div className="mt-2 md:hidden">
        <GlobalSearch />
      </div>
    </header>
  );
}
