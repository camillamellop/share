import { api } from "encore.dev/api";

export interface Flight {
  id: string;
  flightNumber: string;
  aircraft: string;
  departure: {
    airport: string;
    city: string;
    time: Date;
  };
  arrival: {
    airport: string;
    city: string;
    time: Date;
  };
  status: "scheduled" | "boarding" | "departed" | "arrived" | "cancelled" | "delayed";
  gate?: string;
  crew: string[];
}

export interface FlightsResponse {
  flights: Flight[];
}

// Retrieves scheduled flights for today.
export const getScheduledFlights = api<void, FlightsResponse>(
  { expose: true, method: "GET", path: "/flights/scheduled" },
  async () => {
    const today = new Date();
    
    return {
      flights: [
        {
          id: "1",
          flightNumber: "AV1234",
          aircraft: "Boeing 737-800",
          departure: {
            airport: "GRU",
            city: "São Paulo",
            time: new Date(today.setHours(14, 30, 0, 0))
          },
          arrival: {
            airport: "SDU",
            city: "Rio de Janeiro",
            time: new Date(today.setHours(15, 45, 0, 0))
          },
          status: "scheduled",
          gate: "A12",
          crew: ["Carlos Silva", "Ana Santos", "Pedro Costa"]
        },
        {
          id: "2",
          flightNumber: "AV5678",
          aircraft: "Airbus A320",
          departure: {
            airport: "SDU",
            city: "Rio de Janeiro",
            time: new Date(today.setHours(18, 15, 0, 0))
          },
          arrival: {
            airport: "GRU",
            city: "São Paulo",
            time: new Date(today.setHours(19, 30, 0, 0))
          },
          status: "scheduled",
          gate: "B8",
          crew: ["Carlos Silva", "Maria Oliveira", "João Ferreira"]
        },
        {
          id: "3",
          flightNumber: "AV9012",
          aircraft: "Boeing 737-800",
          departure: {
            airport: "GRU",
            city: "São Paulo",
            time: new Date(today.setHours(21, 0, 0, 0))
          },
          arrival: {
            airport: "BSB",
            city: "Brasília",
            time: new Date(today.setHours(22, 30, 0, 0))
          },
          status: "scheduled",
          gate: "C15",
          crew: ["Roberto Lima", "Carla Mendes", "Lucas Rocha"]
        }
      ]
    };
  }
);
