import { useQuery } from "@tanstack/react-query";
import { useBackend } from "../../hooks/useBackend";
import type { TravelExpense } from "~backend/financial/travel-reports";

interface PrintableTravelReportProps {
  report: any;
}

export default function PrintableTravelReport({ report }: PrintableTravelReportProps) {
  const backend = useBackend();
  const { data: companyConfigResponse } = useQuery({
    queryKey: ["companyConfig"],
    queryFn: () => backend.financial.getCompanyConfig()
  });
  const companyConfig = companyConfigResponse?.config;

  if (!report) return null;

  // Default company config if not available
  const defaultConfig = {
    nome: 'Share Brasil Serviços Aeroportuários EIRELI',
    cnpj: '00.000.000/0000-00',
    endereco: 'Endereço da Empresa',
    telefone: '(00) 0000-0000',
    email: 'contato@sharebrasil.com',
    logotipo_url: '/sharebrasil-logo.png'
  };

  const config = companyConfig || defaultConfig;

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            {config.logotipo_url && (
              <img src={config.logotipo_url} alt="Logo" className="h-16 mb-4" />
            )}
            <div className="font-bold text-lg">{config.nome}</div>
            {config.cnpj && <div className="text-sm">CNPJ: {config.cnpj}</div>}
            {config.endereco && <div className="text-sm">{config.endereco}</div>}
            {config.telefone && <div className="text-sm">{config.telefone}</div>}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-700">RELATÓRIO DE VIAGEM</div>
            <div className="text-sm">Nº {report.numero_relatorio}</div>
            <div className="text-sm">
              Emitido em {new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="font-bold">Cotista:</div>
            <div>{report.cotista}</div>
          </div>
          <div>
            <div className="font-bold">Aeronave:</div>
            <div>{report.aeronave}</div>
          </div>
          <div>
            <div className="font-bold">Tripulante:</div>
            <div>{report.tripulante}</div>
          </div>
          <div>
            <div className="font-bold">Destino:</div>
            <div>{report.destino}</div>
          </div>
          <div>
            <div className="font-bold">Data Início:</div>
            <div>{new Date(report.data_inicio).toLocaleDateString('pt-BR')}</div>
          </div>
          <div>
            <div className="font-bold">Data Fim:</div>
            <div>{new Date(report.data_fim).toLocaleDateString('pt-BR')}</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="font-bold text-lg mb-4">Despesas:</div>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Categoria</th>
                <th className="border border-gray-300 p-2 text-left">Descrição</th>
                <th className="border border-gray-300 p-2 text-right">Valor</th>
                <th className="border border-gray-300 p-2 text-left">Pago por</th>
              </tr>
            </thead>
            <tbody>
              {report.despesas.map((despesa: TravelExpense, index: number) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">{despesa.categoria}</td>
                  <td className="border border-gray-300 p-2">{despesa.descricao}</td>
                  <td className="border border-gray-300 p-2 text-right">
                    R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border border-gray-300 p-2">{despesa.pago_por}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-300 p-2" colSpan={2}>TOTAL</td>
                <td className="border border-gray-300 p-2 text-right">
                  R$ {report.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="border border-gray-300 p-2"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {report.observacoes && (
          <div className="mb-6">
            <div className="font-bold">Observações:</div>
            <div>{report.observacoes}</div>
          </div>
        )}

        <div className="flex justify-between items-end mt-12">
          <div className="text-sm">
            Emitente: {config.nome}
          </div>
          <div className="text-center">
            <div className="border-t border-black w-64 mb-2"></div>
            <div className="text-sm">Assinatura</div>
          </div>
        </div>
      </div>
    </div>
  );
}
