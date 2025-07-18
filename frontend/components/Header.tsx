import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Thermometer, Loader2 } from "lucide-react";
import backend from "~backend/client";
import GlobalSearch from "./GlobalSearch";

export default function Header() {
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
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-white">
            Bem-vindo ao Portal Share Brasil
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <GlobalSearch />
          
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-2 p-2 text-slate-300">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            ) : weatherData ? (
              <>
                <Thermometer className="w-5 h-5 text-cyan-400" />
                <div className="text-sm">
                  <span>{weatherData.temperature}°C</span>
                  <span className="text-slate-400"> em </span>
                  <span className="font-semibold">{weatherData.location}</span>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
