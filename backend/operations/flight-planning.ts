import { api, APIError } from "encore.dev/api";
import { db } from "./encore.service";
import { secret } from "encore.dev/config";
import { getAuthData } from "~encore/auth";

const openWeatherApiKey = secret("OpenWeatherApiKey");

export interface FlightPlan {
  id: string;
  flight_number: string;
  aircraft: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: Date;
  arrival_time: Date;
  route: string;
  altitude: number;
  ete_minutes: number;
  fuel_burn_liters: number;
  weight_balance: WeightBalance;
  weather_data: WeatherData;
  checklist_completed: boolean;
  status: "draft" | "filed" | "approved" | "active" | "completed";
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface WeightBalance {
  empty_weight: number;
  payload: number;
  fuel_weight: number;
  total_weight: number;
  cg_position: number;
  within_limits: boolean;
}

export interface WeatherData {
  departure_weather: AirportWeather;
  arrival_weather: AirportWeather;
  route_weather: RouteWeather[];
  last_updated: Date;
}

export interface AirportWeather {
  airport_code: string;
  temperature: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number;
  visibility: number;
  conditions: string;
  clouds: string;
}

export interface RouteWeather {
  waypoint: string;
  altitude: number;
  temperature: number;
  wind_speed: number;
  wind_direction: number;
  turbulence: string;
}

export interface FavoriteRoute {
  id: string;
  name: string;
  departure_airport: string;
  arrival_airport: string;
  route: string;
  altitude: number;
  estimated_time: number;
  distance: number;
  created_by: string;
  created_at: Date;
}

export interface CreateFlightPlanRequest {
  flight_number: string;
  aircraft: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: Date;
  route?: string;
  altitude?: number;
  payload?: number;
  speed_kts: number;
}

export interface UpdateFlightPlanRequest {
  id: string;
  flight_number?: string;
  aircraft?: string;
  departure_airport?: string;
  arrival_airport?: string;
  departure_time?: Date;
  arrival_time?: Date;
  route?: string;
  altitude?: number;
  ete_minutes?: number;
  fuel_burn_liters?: number;
  weight_balance?: WeightBalance;
  checklist_completed?: boolean;
  status?: "draft" | "filed" | "approved" | "active" | "completed";
}

export interface CreateFavoriteRouteRequest {
  name: string;
  departure_airport: string;
  arrival_airport: string;
  route: string;
  altitude: number;
  estimated_time: number;
  distance: number;
}

export interface FlightPlansResponse {
  flight_plans: FlightPlan[];
}

export interface FavoriteRoutesResponse {
  routes: FavoriteRoute[];
}

export interface WeatherResponse {
  weather: WeatherData;
}

export interface FlightParametersRequest {
  departure_icao: string;
  arrival_icao: string;
  aircraft_registration: string;
  speed_kts: number;
}

export interface FlightParametersResponse {
  distance_nm: number;
  ete_minutes: number;
  fuel_burn_liters: number;
}

// Helper function to parse DMS coordinates to decimal degrees
function parseCoordinates(coordStr: string): { lat: number; lon: number } {
  const parts = coordStr.match(/(\d+)°(\d+)'(\d+)"([NS])\s+(\d+)°(\d+)'(\d+)"([WE])/);
  if (!parts) return { lat: 0, lon: 0 };
  
  let lat = parseInt(parts[1]) + parseInt(parts[2])/60 + parseInt(parts[3])/3600;
  if (parts[4] === 'S') lat = -lat;
  
  let lon = parseInt(parts[5]) + parseInt(parts[6])/60 + parseInt(parts[7])/3600;
  if (parts[8] === 'W') lon = -lon;
  
  return { lat, lon };
}

// Creates a new flight plan.
export const createFlightPlan = api<CreateFlightPlanRequest, FlightPlan>(
  { auth: true, expose: true, method: "POST", path: "/flight-plans" },
  async (req) => {
    const auth = getAuthData()!;
    const id = `plan_${Date.now()}`;
    const now = new Date();

    // Calculate flight parameters
    const params = await computeFlightParameters(req.departure_airport, req.arrival_airport, req.aircraft, req.speed_kts);
    
    // Calculate estimated arrival time
    const arrivalTime = new Date(req.departure_time);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + params.ete_minutes);

    // Get weather data
    const weatherData = await fetchWeatherForRoute(req.departure_airport, req.arrival_airport);

    // Initialize weight and balance (mock data)
    const weightBalance: WeightBalance = {
      empty_weight: 1500, // kg
      payload: req.payload || 400, // kg
      fuel_weight: params.fuel_burn_liters * 0.8, // kg (fuel density ~0.8 kg/L)
      total_weight: 0,
      cg_position: 0,
      within_limits: true
    };
    weightBalance.total_weight = weightBalance.empty_weight + weightBalance.payload + weightBalance.fuel_weight;
    weightBalance.cg_position = 2.5; // meters from datum
    weightBalance.within_limits = weightBalance.total_weight <= 2500; // max weight

    const flightPlan = await db.queryRow<FlightPlan>`
      INSERT INTO flight_plans (
        id, flight_number, aircraft, departure_airport, arrival_airport,
        departure_time, arrival_time, route, altitude, ete_minutes, fuel_burn_liters,
        weight_balance, weather_data, checklist_completed, status,
        created_by, created_at, updated_at
      )
      VALUES (
        ${id}, ${req.flight_number}, ${req.aircraft}, ${req.departure_airport},
        ${req.arrival_airport}, ${req.departure_time}, ${arrivalTime},
        ${req.route || ''}, ${req.altitude || 10000}, ${params.ete_minutes}, ${params.fuel_burn_liters},
        ${weightBalance}, ${weatherData},
        false, 'draft', ${auth.userID}, ${now}, ${now}
      )
      RETURNING *
    `;

    return flightPlan!;
  }
);

// Updates an existing flight plan.
export const updateFlightPlan = api<UpdateFlightPlanRequest, FlightPlan>(
  { auth: true, expose: true, method: "PUT", path: "/flight-plans/:id" },
  async (req) => {
    const now = new Date();

    const flightPlan = await db.queryRow<FlightPlan>`
      UPDATE flight_plans 
      SET flight_number = COALESCE(${req.flight_number}, flight_number),
          aircraft = COALESCE(${req.aircraft}, aircraft),
          departure_airport = COALESCE(${req.departure_airport}, departure_airport),
          arrival_airport = COALESCE(${req.arrival_airport}, arrival_airport),
          departure_time = COALESCE(${req.departure_time}, departure_time),
          arrival_time = COALESCE(${req.arrival_time}, arrival_time),
          route = COALESCE(${req.route}, route),
          altitude = COALESCE(${req.altitude}, altitude),
          ete_minutes = COALESCE(${req.ete_minutes}, ete_minutes),
          fuel_burn_liters = COALESCE(${req.fuel_burn_liters}, fuel_burn_liters),
          weight_balance = COALESCE(${req.weight_balance}, weight_balance),
          checklist_completed = COALESCE(${req.checklist_completed}, checklist_completed),
          status = COALESCE(${req.status}, status),
          updated_at = ${now}
      WHERE id = ${req.id}
      RETURNING *
    `;

    if (!flightPlan) {
      throw APIError.notFound("Flight plan not found");
    }

    return flightPlan;
  }
);

// Retrieves all flight plans.
export const getFlightPlans = api<void, FlightPlansResponse>(
  { auth: true, expose: true, method: "GET", path: "/flight-plans" },
  async () => {
    const plans = await db.queryAll<FlightPlan>`
      SELECT * FROM flight_plans ORDER BY created_at DESC
    `;
    return { flight_plans: plans };
  }
);

// Deletes a flight plan.
export const deleteFlightPlan = api<{ id: string }, void>(
  { auth: true, expose: true, method: "DELETE", path: "/flight-plans/:id" },
  async (req) => {
    await db.exec`DELETE FROM flight_plans WHERE id = ${req.id}`;
  }
);

// Creates a favorite route.
export const createFavoriteRoute = api<CreateFavoriteRouteRequest, FavoriteRoute>(
  { auth: true, expose: true, method: "POST", path: "/favorite-routes" },
  async (req) => {
    const auth = getAuthData()!;
    const id = `route_${Date.now()}`;
    const now = new Date();

    const route = await db.queryRow<FavoriteRoute>`
      INSERT INTO favorite_routes (
        id, name, departure_airport, arrival_airport, route,
        altitude, estimated_time, distance, created_by, created_at
      )
      VALUES (
        ${id}, ${req.name}, ${req.departure_airport}, ${req.arrival_airport},
        ${req.route}, ${req.altitude}, ${req.estimated_time}, ${req.distance},
        ${auth.userID}, ${now}
      )
      RETURNING *
    `;

    return route!;
  }
);

// Retrieves all favorite routes.
export const getFavoriteRoutes = api<void, FavoriteRoutesResponse>(
  { auth: true, expose: true, method: "GET", path: "/favorite-routes" },
  async () => {
    const routes = await db.queryAll<FavoriteRoute>`
      SELECT * FROM favorite_routes ORDER BY name ASC
    `;
    return { routes };
  }
);

// Deletes a favorite route.
export const deleteFavoriteRoute = api<{ id: string }, void>(
  { auth: true, expose: true, method: "DELETE", path: "/favorite-routes/:id" },
  async (req) => {
    await db.exec`DELETE FROM favorite_routes WHERE id = ${req.id}`;
  }
);

// Gets weather data for a route.
export const getWeatherForRoute = api<{ departure: string; arrival: string }, WeatherResponse>(
  { auth: true, expose: true, method: "GET", path: "/weather/route" },
  async (req) => {
    const weatherData = await fetchWeatherForRoute(req.departure, req.arrival);
    return { weather: weatherData };
  }
);

// Calculates distance and fuel requirements.
export const calculateFlightParameters = api<FlightParametersRequest, FlightParametersResponse>(
  { auth: true, expose: true, method: "POST", path: "/flight-parameters/calculate" },
  async (req) => {
    const result = await computeFlightParameters(req.departure_icao, req.arrival_icao, req.aircraft_registration, req.speed_kts);
    return result;
  }
);

// Helper function to get weather data from OpenWeatherMap API
async function fetchWeatherForRoute(departure: string, arrival: string): Promise<WeatherData> {
  const apiKey = openWeatherApiKey();
  
  try {
    const depAd = await db.queryRow<{ coordinates: string }>`SELECT coordinates FROM aerodromes WHERE icao = ${departure}`;
    const arrAd = await db.queryRow<{ coordinates: string }>`SELECT coordinates FROM aerodromes WHERE icao = ${arrival}`;

    if (!depAd || !arrAd) {
      throw APIError.notFound("Departure or arrival aerodrome not found in database.");
    }

    const depCoords = parseCoordinates(depAd.coordinates);
    const arrCoords = parseCoordinates(arrAd.coordinates);

    // Fetch weather for departure airport
    const depWeatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${depCoords.lat}&lon=${depCoords.lon}&appid=${apiKey}&units=metric`
    );
    const depWeatherData = await depWeatherResponse.json();

    // Fetch weather for arrival airport
    const arrWeatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${arrCoords.lat}&lon=${arrCoords.lon}&appid=${apiKey}&units=metric`
    );
    const arrWeatherData = await arrWeatherResponse.json();

    const departureWeather: AirportWeather = {
      airport_code: departure,
      temperature: depWeatherData.main?.temp || 20,
      humidity: depWeatherData.main?.humidity || 60,
      pressure: depWeatherData.main?.pressure || 1013,
      wind_speed: depWeatherData.wind?.speed || 5,
      wind_direction: depWeatherData.wind?.deg || 180,
      visibility: depWeatherData.visibility ? depWeatherData.visibility / 1000 : 10,
      conditions: depWeatherData.weather?.[0]?.description || 'Clear',
      clouds: depWeatherData.clouds?.all ? `${depWeatherData.clouds.all}%` : '0%'
    };

    const arrivalWeather: AirportWeather = {
      airport_code: arrival,
      temperature: arrWeatherData.main?.temp || 22,
      humidity: arrWeatherData.main?.humidity || 65,
      pressure: arrWeatherData.main?.pressure || 1015,
      wind_speed: arrWeatherData.wind?.speed || 7,
      wind_direction: arrWeatherData.wind?.deg || 200,
      visibility: arrWeatherData.visibility ? arrWeatherData.visibility / 1000 : 10,
      conditions: arrWeatherData.weather?.[0]?.description || 'Clear',
      clouds: arrWeatherData.clouds?.all ? `${arrWeatherData.clouds.all}%` : '0%'
    };

    // Mock route weather data
    const routeWeather: RouteWeather[] = [
      {
        waypoint: 'WAYPOINT1',
        altitude: 10000,
        temperature: 5,
        wind_speed: 25,
        wind_direction: 270,
        turbulence: 'Light'
      },
      {
        waypoint: 'WAYPOINT2',
        altitude: 15000,
        temperature: -10,
        wind_speed: 35,
        wind_direction: 280,
        turbulence: 'Moderate'
      }
    ];

    return {
      departure_weather: departureWeather,
      arrival_weather: arrivalWeather,
      route_weather: routeWeather,
      last_updated: new Date()
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    
    // Return mock data if API fails
    return {
      departure_weather: {
        airport_code: departure,
        temperature: 20,
        humidity: 60,
        pressure: 1013,
        wind_speed: 5,
        wind_direction: 180,
        visibility: 10,
        conditions: 'Clear',
        clouds: '0%'
      },
      arrival_weather: {
        airport_code: arrival,
        temperature: 22,
        humidity: 65,
        pressure: 1015,
        wind_speed: 7,
        wind_direction: 200,
        visibility: 10,
        conditions: 'Clear',
        clouds: '0%'
      },
      route_weather: [],
      last_updated: new Date()
    };
  }
}

// Helper function to calculate distance and fuel requirements
async function computeFlightParameters(departure_icao: string, arrival_icao: string, aircraft_registration: string, speed_kts: number): Promise<FlightParametersResponse> {
  const depAd = await db.queryRow<{ coordinates: string }>`SELECT coordinates FROM aerodromes WHERE icao = ${departure_icao}`;
  const arrAd = await db.queryRow<{ coordinates: string }>`SELECT coordinates FROM aerodromes WHERE icao = ${arrival_icao}`;

  if (!depAd || !arrAd) {
    throw APIError.notFound("Departure or arrival aerodrome not found in database.");
  }

  const aircraft = await db.queryRow<{ consumption_per_hour: number }>`
    SELECT consumption_per_hour FROM aircrafts WHERE registration = ${aircraft_registration}
  `;

  if (!aircraft) {
    throw APIError.notFound("Aircraft not found in database.");
  }

  const depCoords = parseCoordinates(depAd.coordinates);
  const arrCoords = parseCoordinates(arrAd.coordinates);

  // Calculate distance using Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (arrCoords.lat - depCoords.lat) * Math.PI / 180;
  const dLon = (arrCoords.lon - depCoords.lon) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(depCoords.lat * Math.PI / 180) * Math.cos(arrCoords.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance_km = R * c; // Distance in km
  const distance_nm = distance_km * 0.539957;

  if (speed_kts <= 0) {
    throw APIError.invalidArgument("Speed must be greater than zero.");
  }

  // Calculate estimated time
  const ete_hours = distance_nm / speed_kts;
  const ete_minutes = Math.round(ete_hours * 60);

  // Calculate fuel required
  const fuel_burn_liters = Math.round(ete_hours * (aircraft.consumption_per_hour || 100)); // fallback consumption

  return {
    distance_nm: Math.round(distance_nm),
    ete_minutes: ete_minutes,
    fuel_burn_liters: fuel_burn_liters
  };
}
