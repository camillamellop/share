import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { decimalToTime, timeToDecimal } from "@/utils/flightTime";

interface PrintableLogbookProps {
  logbook: any;
}

export default function PrintableLogbook({ logbook }: PrintableLogbookProps) {
  const { data: companyConfigResponse } = useQuery({
    queryKey: ["companyConfig"],
    queryFn: () => backend.financial.getCompanyConfig()
  });
  const companyConfig = companyConfigResponse?.config;

  const formatHours = (hours: number) => (hours || 0).toFixed(1).replace('.', ',');

  return (
    <div className="p-8 bg-white text-black">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          {companyConfig?.logotipo_url && (
            <img src={companyConfig.logotipo_url} alt="Logo" className="h-16 mb-4" />
          )}
          {companyConfig && <div className="font-bold text-lg">{companyConfig.nome}</div>}
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-blue-700">
            DIÁRIO DE BORDO - {logbook.aircraft_registration}
          </h1>
          <p className="text-lg">
            {new Date(logbook.year, logbook.month - 1).toLocaleString('pt-BR', { month: 'long' }).toUpperCase()} {logbook.year}
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="border p-4">
          <div className="grid grid-cols-2">
            <div className="font-bold">AERONAVE:</div><div>{logbook.aircraft_registration}</div>
            <div className="font-bold">MODELO:</div><div>{logbook.aircraft_model}</div>
            <div className="font-bold">CONS. MED:</div><div>{logbook.aircraft_consumption} L/H</div>
          </div>
        </div>
        <div className="border p-4">
          <div className="grid grid-cols-2">
            <div className="font-bold">ANTER.:</div><div className="text-right">{formatHours(logbook.previous_hours)} H</div>
            <div className="font-bold">ATUAL:</div><div className="text-right">{formatHours(logbook.current_hours)} H</div>
            <div className="font-bold text-red-600">P.REV.:</div><div className="text-right text-red-600">{formatHours(logbook.revision_hours)} H</div>
            <div className="font-bold text-green-600">DISP.:</div><div className="text-right text-green-600">{formatHours(logbook.revision_hours - logbook.current_hours)} H</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-xs border-collapse border border-gray-400">
        <thead>
          <tr className="bg-gray-200">
            <th rowSpan={2} className="border border-gray-400 p-1">DATA</th>
            <th rowSpan={2} className="border border-gray-400 p-1">DE</th>
            <th rowSpan={2} className="border border-gray-400 p-1">PARA</th>
            <th colSpan={4} className="border border-gray-400 p-1">HORÁRIOS</th>
            <th colSpan={4} className="border border-gray-400 p-1">TEMPO DE VOO</th>
            <th rowSpan={2} className="border border-gray-400 p-1">IFR</th>
            <th rowSpan={2} className="border border-gray-400 p-1">POUSOS</th>
            <th colSpan={2} className="border border-gray-400 p-1">COMBUSTÍVEL</th>
            <th colSpan={3} className="border border-gray-400 p-1">CANAC</th>
            <th rowSpan={2} className="border border-gray-400 p-1">DIARIAS</th>
            <th rowSpan={2} className="border border-gray-400 p-1">EXTRAS</th>
            <th rowSpan={2} className="border border-gray-400 p-1">VOO PARA</th>
            <th rowSpan={2} className="border border-gray-400 p-1">CONFERE</th>
          </tr>
          <tr className="bg-gray-200">
            <th className="border border-gray-400 p-1">AC</th>
            <th className="border border-gray-400 p-1">DEP</th>
            <th className="border border-gray-400 p-1">POU</th>
            <th className="border border-gray-400 p-1">COR</th>
            <th className="border border-gray-400 p-1">T VOO</th>
            <th className="border border-gray-400 p-1">T DIA</th>
            <th className="border border-gray-400 p-1 bg-orange-200">T NOITE</th>
            <th className="border border-gray-400 p-1">TOTAL</th>
            <th className="border border-gray-400 p-1">ABAST</th>
            <th className="border border-gray-400 p-1 bg-orange-200">FUEL</th>
            <th className="border border-gray-400 p-1">CÉLULA</th>
            <th className="border border-gray-400 p-1">PIC</th>
            <th className="border border-gray-400 p-1">SIC</th>
          </tr>
        </thead>
        <tbody>
          {logbook.entries.map((entry: any) => (
            <tr key={entry.id}>
              <td className="border border-gray-400 p-1 text-center">{new Date(entry.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'numeric' })}</td>
              <td className="border border-gray-400 p-1 text-center">{entry.from_airport}</td>
              <td className="border border-gray-400 p-1 text-center">{entry.to_airport}</td>
              <td className="border border-gray-400 p-1 text-center">{entry.time_activated}</td>
              <td className="border border-gray-400 p-1 text-center">{entry.time_departure}</td>
              <td className="border border-gray-400 p-1 text-center">{entry.time_arrival}</td>
              <td className="border border-gray-400 p-1 text-center">{decimalToTime(timeToDecimal(entry.time_arrival) - timeToDecimal(entry.time_departure))}</td>
              <td className="border border-gray-400 p-1 text-center">{formatHours(entry.flight_time_total)}</td>
              <td className="border border-gray-400 p-1 text-center">{formatHours(entry.flight_time_day)}</td>
              <td className="border border-gray-400 p-1 text-center bg-orange-200">{formatHours(entry.flight_time_night)}</td>
              <td className="border border-gray-400 p-1 text-center">{formatHours(entry.flight_time_total)}</td>
              <td className="border border-gray-400 p-1 text-center">{entry.ifr_hours}</td>
              <td className="border border-gray-400 p-1 text-center">{entry.landings}</td>
              <td className="border border-gray-400 p-1 text-center">{entry.fuel_added}</td>
              <td className="border border-gray-400 p-1 text-center bg-orange-200">{entry.fuel_on_arrival}</td>
              <td className="border border-gray-400 p-1 text-center">{formatHours(entry.cell_hours)}</td>
              <td className="border border-gray-400 p-1 text-center">{entry.pic_anac}</td>
              <td className="border border-gray-400 p-1 text-center">{entry.sic_anac}</td>
              <td className="border border-gray-400 p-1 text-center">R$ {entry.daily_allowance.toFixed(2)}</td>
              <td className="border border-gray-400 p-1 text-center">{entry.extras}</td>
              <td className="border border-gray-400 p-1 text-center">{entry.voo_para}</td>
              <td className="border border-gray-400 p-1 text-center">{entry.confere}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
