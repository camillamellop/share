// Mock data for sunset times. In a real app, this would come from a more reliable source.
const sunsetTimes: { [key: string]: string } = {
  'SBCY': '17:45', // Cuiabá
  'SIJF': '17:30', // Ilhéus (not an official ICAO, using as example)
  'SBVH': '17:30', // Vilhena
  'SWJN': '17:45', // Juína
  'SBSI': '17:45', // Sinop
  'SBNV': '17:45', // Navegantes (example from image)
  'SSQM': '18:00', // Sorriso (example from image)
  'SDLI': '18:00', // Londrina
  'SWLV': '17:45', // Lucas do Rio Verde
  'SDIO': '18:15', // Foz do Iguaçu
  'SBSP': '18:00', // São Paulo
  'SBRJ': '17:45', // Rio de Janeiro
};

const NIGHT_START_DEFAULT = 18 * 60; // 18:00 in minutes
const NIGHT_END_DEFAULT = 6 * 60;   // 06:00 in minutes
const SUNSET_TOLERANCE = 30; // minutes

/**
 * Converts a time string "HH:MM" to minutes from midnight.
 * @param timeStr The time string.
 * @returns Total minutes from midnight.
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Converts a decimal hour value to a string "HH:MM".
 * @param decimalHours The decimal hour value.
 * @returns The formatted time string.
 */
export function decimalToTime(decimalHours: number): string {
  const totalMinutes = Math.round(decimalHours * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Converts a decimal hour value to a fixed-point string.
 * @param decimalHours The decimal hour value.
 * @returns The formatted string (e.g., 2.5).
 */
export function timeToDecimal(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
}

/**
 * Calculates total, day, and night flight time based on departure and arrival times.
 * @param departureTime "HH:MM"
 * @param arrivalTime "HH:MM"
 * @param departureAirport ICAO code
 * @param arrivalAirport ICAO code
 * @returns Object with total, day, and night time in decimal hours.
 */
export function calculateFlightTimes(departureTime: string, arrivalTime: string, departureAirport: string, arrivalAirport: string) {
  const depMinutes = timeToMinutes(departureTime);
  let arrMinutes = timeToMinutes(arrivalTime);

  // Handle overnight flights
  if (arrMinutes < depMinutes) {
    arrMinutes += 24 * 60;
  }

  const totalMinutes = arrMinutes - depMinutes;
  if (totalMinutes <= 0) {
    return { total: 0, day: 0, night: 0 };
  }

  // Determine sunset time for the route (average of departure and arrival)
  const depSunset = timeToMinutes(sunsetTimes[departureAirport] || '18:00');
  const arrSunset = timeToMinutes(sunsetTimes[arrivalAirport] || '18:00');
  const avgSunset = Math.round((depSunset + arrSunset) / 2);

  const nightStart = avgSunset - SUNSET_TOLERANCE;
  const nightEnd = NIGHT_END_DEFAULT; // 06:00

  let nightMinutes = 0;

  // Iterate through each minute of the flight
  for (let minute = depMinutes; minute < arrMinutes; minute++) {
    const currentMinuteOfDay = minute % (24 * 60);
    if (currentMinuteOfDay >= nightStart || currentMinuteOfDay < nightEnd) {
      nightMinutes++;
    }
  }

  const totalHours = totalMinutes / 60;
  const nightHours = nightMinutes / 60;
  const dayHours = totalHours - nightHours;

  return {
    total: totalHours,
    day: dayHours,
    night: nightHours,
  };
}
