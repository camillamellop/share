import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";

const openWeatherApiKey = secret("OpenWeatherApiKey");

export interface CurrentWeatherRequest {
  lat: number;
  lon: number;
}

export interface CurrentWeatherResponse {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
}

// Retrieves current weather for a given location.
export const getCurrentWeather = api<CurrentWeatherRequest, CurrentWeatherResponse>(
  { expose: true, method: "GET", path: "/weather/current" },
  async ({ lat, lon }) => {
    const apiKey = openWeatherApiKey();
    if (!apiKey) {
      // Return mock data if API key is not set
      return {
        location: "São Paulo",
        temperature: 22,
        condition: "Nublado",
        icon: "04d",
      };
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`
      );
      const data = await response.json();

      return {
        location: data.name,
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].description,
        icon: data.weather[0].icon,
      };
    } catch (error) {
      console.error("Error fetching weather data:", error);
      // Return mock data on error
      return {
        location: "Local Desconhecido",
        temperature: 20,
        condition: "N/A",
        icon: "01d",
      };
    }
  }
);
