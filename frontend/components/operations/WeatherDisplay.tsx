import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Cloud, Wind, Eye, Thermometer, Droplets, Gauge } from "lucide-react";

interface WeatherDisplayProps {
  planId: string;
  plan?: any;
  onClose: () => void;
}

export default function WeatherDisplay({ planId, plan, onClose }: WeatherDisplayProps) {
  if (!plan || !plan.weather_data) return null;

  const { departure_weather, arrival_weather, route_weather, last_updated } = plan.weather_data;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-blue-400" />
            <span>Dados Meteorológicos - {plan.flight_number}</span>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-slate-400 mb-4">
            Última atualização: {new Date(last_updated).toLocaleString('pt-BR')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Departure Weather */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Partida - {departure_weather.airport_code}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-4 h-4 text-red-400" />
                    <div>
                      <div className="text-slate-400 text-xs">Temperatura</div>
                      <div className="text-white font-semibold">{departure_weather.temperature}°C</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-slate-400 text-xs">Umidade</div>
                      <div className="text-white font-semibold">{departure_weather.humidity}%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Wind className="w-4 h-4 text-green-400" />
                    <div>
                      <div className="text-slate-400 text-xs">Vento</div>
                      <div className="text-white font-semibold">
                        {departure_weather.wind_speed} kt / {departure_weather.wind_direction}°
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Gauge className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="text-slate-400 text-xs">Pressão</div>
                      <div className="text-white font-semibold">{departure_weather.pressure} hPa</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-yellow-400" />
                    <div>
                      <div className="text-slate-400 text-xs">Visibilidade</div>
                      <div className="text-white font-semibold">{departure_weather.visibility} km</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Cloud className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-slate-400 text-xs">Nuvens</div>
                      <div className="text-white font-semibold">{departure_weather.clouds}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-700/50 p-3 rounded">
                  <div className="text-slate-400 text-xs mb-1">Condições</div>
                  <div className="text-white">{departure_weather.conditions}</div>
                </div>
              </CardContent>
            </Card>

            {/* Arrival Weather */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Chegada - {arrival_weather.airport_code}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-4 h-4 text-red-400" />
                    <div>
                      <div className="text-slate-400 text-xs">Temperatura</div>
                      <div className="text-white font-semibold">{arrival_weather.temperature}°C</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-slate-400 text-xs">Umidade</div>
                      <div className="text-white font-semibold">{arrival_weather.humidity}%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Wind className="w-4 h-4 text-green-400" />
                    <div>
                      <div className="text-slate-400 text-xs">Vento</div>
                      <div className="text-white font-semibold">
                        {arrival_weather.wind_speed} kt / {arrival_weather.wind_direction}°
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Gauge className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="text-slate-400 text-xs">Pressão</div>
                      <div className="text-white font-semibold">{arrival_weather.pressure} hPa</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-yellow-400" />
                    <div>
                      <div className="text-slate-400 text-xs">Visibilidade</div>
                      <div className="text-white font-semibold">{arrival_weather.visibility} km</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Cloud className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-slate-400 text-xs">Nuvens</div>
                      <div className="text-white font-semibold">{arrival_weather.clouds}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-700/50 p-3 rounded">
                  <div className="text-slate-400 text-xs mb-1">Condições</div>
                  <div className="text-white">{arrival_weather.conditions}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Route Weather */}
          {route_weather && route_weather.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Condições na Rota</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {route_weather.map((waypoint, index) => (
                    <div key={index} className="bg-slate-700/50 p-3 rounded">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <div className="text-slate-400 text-xs">Waypoint</div>
                          <div className="text-white font-semibold">{waypoint.waypoint}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-xs">Altitude</div>
                          <div className="text-white">{waypoint.altitude} ft</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-xs">Temperatura</div>
                          <div className="text-white">{waypoint.temperature}°C</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-xs">Vento</div>
                          <div className="text-white">{waypoint.wind_speed} kt / {waypoint.wind_direction}°</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-xs">Turbulência</div>
                          <div className="text-white">{waypoint.turbulence}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="bg-slate-800/50 p-4 rounded-lg">
            <h4 className="text-slate-300 font-semibold mb-2">Informações Importantes:</h4>
            <ul className="text-slate-400 text-sm space-y-1">
              <li>• Os dados meteorológicos são atualizados automaticamente</li>
              <li>• Verifique as condições antes da decolagem</li>
              <li>• Considere combustível adicional para condições adversas</li>
              <li>• Consulte NOTAM e informações adicionais do aeroporto</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
