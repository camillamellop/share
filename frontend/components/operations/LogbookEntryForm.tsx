import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateFlightTimes } from "@/utils/flightTime";
import backend from "~backend/client";

interface LogbookEntryFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
}

export default function LogbookEntryForm({ onSave, onCancel }: LogbookEntryFormProps) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    from_airport: '',
    to_airport: '',
    time_activated: '',
    time_departure: '',
    time_arrival: '',
    time_shutdown: '',
    ifr_hours: 0,
    landings: 1,
    fuel_added: 0,
    fuel_on_arrival: 0,
    pic_name: '',
    pic_hours: 0,
    sic_name: '',
    sic_hours: 0,
  });

  const [times, setTimes] = useState({
    flight_time_total: 0,
    flight_time_day: 0,
    flight_time_night: 0,
  });

  const { data: pilotsData } = useQuery({
    queryKey: ["pilots"],
    queryFn: () => backend.operations.getPilots()
  });

  const { data: aerodromesData } = useQuery({
    queryKey: ["aerodromes"],
    queryFn: () => backend.operations.getAerodromes()
  });

  const pilots = pilotsData?.pilots || [];
  const aerodromes = aerodromesData?.aerodromes || [];

  useEffect(() => {
    if (form.time_departure && form.time_arrival) {
      const { total, day, night } = calculateFlightTimes(
        form.time_departure,
        form.time_arrival,
        form.from_airport,
        form.to_airport
      );
      setTimes({
        flight_time_total: total,
        flight_time_day: day,
        flight_time_night: night,
      });
      setForm(prev => ({ ...prev, pic_hours: total, sic_hours: 0 }));
    }
  }, [form.time_departure, form.time_arrival, form.from_airport, form.to_airport]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    const finalValue = value === 'none' ? '' : value;
    setForm(prev => ({ ...prev, [field]: finalValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      ...times,
      date: new Date(form.date),
      ifr_hours: parseFloat(form.ifr_hours.toString()),
      landings: parseInt(form.landings.toString()),
      fuel_added: parseInt(form.fuel_added.toString()),
      fuel_on_arrival: parseInt(form.fuel_on_arrival.toString()),
      pic_hours: parseFloat(form.pic_hours.toString()),
      sic_hours: parseFloat(form.sic_hours.toString()),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <div className="grid grid-cols-1 gap-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2 text-xs items-end">
          <div><Input name="date" type="date" value={form.date} onChange={handleChange} className="bg-slate-700 border-slate-600 text-white" /></div>
          
          <div>
            <Select value={form.from_airport} onValueChange={(value) => handleSelectChange('from_airport', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-9">
                <SelectValue placeholder="DE" />
              </SelectTrigger>
              <SelectContent>
                {aerodromes.map(ad => (
                  <SelectItem key={ad.id} value={ad.icao}>{ad.icao} - {ad.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={form.to_airport} onValueChange={(value) => handleSelectChange('to_airport', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-9">
                <SelectValue placeholder="PARA" />
              </SelectTrigger>
              <SelectContent>
                {aerodromes.map(ad => (
                  <SelectItem key={ad.id} value={ad.icao}>{ad.icao} - {ad.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div><Input name="time_activated" type="time" value={form.time_activated} onChange={handleChange} className="bg-slate-700 border-slate-600 text-white" /></div>
          <div><Input name="time_departure" type="time" value={form.time_departure} onChange={handleChange} className="bg-slate-700 border-slate-600 text-white" /></div>
          <div><Input name="time_arrival" type="time" value={form.time_arrival} onChange={handleChange} className="bg-slate-700 border-slate-600 text-white" /></div>
          <div><Input name="time_shutdown" type="time" value={form.time_shutdown} onChange={handleChange} className="bg-slate-700 border-slate-600 text-white" /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-8 gap-2 text-xs items-end">
          <div><Input value={times.flight_time_total.toFixed(1)} readOnly className="bg-slate-700 border-slate-600 text-white" /></div>
          <div><Input value={times.flight_time_day.toFixed(1)} readOnly className="bg-slate-700 border-slate-600 text-white" /></div>
          <div><Input value={times.flight_time_night.toFixed(1)} readOnly className="bg-slate-700 border-slate-600 text-white" /></div>
          <div><Input value={times.flight_time_total.toFixed(1)} readOnly className="bg-slate-700 border-slate-600 text-white" /></div>
          <div><Input name="ifr_hours" type="number" step="0.1" value={form.ifr_hours} onChange={handleChange} className="bg-slate-700 border-slate-600 text-white" /></div>
          <div><Input name="landings" type="number" value={form.landings} onChange={handleChange} className="bg-slate-700 border-slate-600 text-white" /></div>
          <div><Input name="fuel_added" type="number" value={form.fuel_added} onChange={handleChange} className="bg-slate-700 border-slate-600 text-white" /></div>
          <div><Input name="fuel_on_arrival" type="number" value={form.fuel_on_arrival} onChange={handleChange} className="bg-slate-700 border-slate-600 text-white" /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-xs items-end">
          <div><Input value={(0).toFixed(1)} readOnly className="bg-slate-700 border-slate-600 text-white" /></div>
          
          <div>
            <Select value={form.pic_name} onValueChange={(value) => handleSelectChange('pic_name', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-9">
                <SelectValue placeholder="PIC" />
              </SelectTrigger>
              <SelectContent>
                {pilots.map(pilot => (
                  <SelectItem key={pilot.id} value={pilot.name}>{pilot.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div><Input name="pic_hours" type="number" step="0.1" value={form.pic_hours} onChange={handleChange} className="bg-slate-700 border-slate-600 text-white" /></div>
          
          <div>
            <Select value={form.sic_name || 'none'} onValueChange={(value) => handleSelectChange('sic_name', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-9">
                <SelectValue placeholder="SIC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {pilots.map(pilot => (
                  <SelectItem key={pilot.id} value={pilot.name}>{pilot.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div><Input name="sic_hours" type="number" step="0.1" value={form.sic_hours} onChange={handleChange} className="bg-slate-700 border-slate-600 text-white" /></div>
          
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">Salvar</Button>
            <Button type="button" size="sm" variant="outline" onClick={onCancel}>Cancelar</Button>
          </div>
        </div>
      </div>
    </form>
  );
}
