import { useQuery } from "@tanstack/react-query";
import { useBackend } from "../../hooks/useBackend";

interface PrintableBillingProps {
  document: any;
}

const QRCODE_URL = '/qrcode-cobranca.png';
const ASSINATURA_URL = '/assinatura.png';

export default function PrintableBilling({ document }: PrintableBillingProps) {
  const backend = useBackend();
  const { data: companyConfigResponse } = useQuery({
    queryKey: ["companyConfig"],
    queryFn: () => backend.financial.getCompanyConfig()
  });
  const companyConfig = companyConfigResponse?.config;

  if (!document) return null;

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
        <div className="flex items-center gap-4 mb-2">
          {config.logotipo_url && (
            <img src={config.logotipo_url} alt="Logo" className="h-12" />
          )}
          <div className="flex-1 text-center">
            <div className="font-bold text-sm">DOCUMENTO DE COBRANÇA</div>
            <div className="text-xs">Emitido por: {config.nome}</div>
          </div>
        </div>

        <div className="mt-6 mb-4">
          <div className="mb-2">Prezados Senhores,</div>
          <div className="mb-2">
            Vimos por meio desta notificação formal comunicar a existência de um débito pendente
            em nome de <b>{document.devedor}</b>, junto à nossa empresa, <b>{config.nome}</b>.
          </div>
          <div className="mb-2">
            O valor em aberto refere-se aos serviços prestados, conforme detalhado abaixo:
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 items-center mb-4">
          <div className="col-span-2 space-y-2">
            <div>
              <span className="font-semibold text-gray-600">Referência do Débito:</span>{' '}
              <span className="font-mono text-lg">{document.referencia}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Valor Original:</span>{' '}
              <span className="text-red-600 font-bold text-lg">
                R$ {Number(document.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Data de Vencimento:</span>{' '}
              <span className="text-red-600 font-bold text-lg">
                {new Date(document.vencimento).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
          <div className="flex justify-center">
            <img src={QRCODE_URL} alt="QR Code" className="h-32 w-32 border" />
          </div>
        </div>

        <div className="mt-8 flex flex-col items-end">
          <img src={ASSINATURA_URL} alt="Assinatura" className="h-16 mb-2" />
          <div className="text-xs text-gray-700 text-center">
            {config.nome}
            <br />
            Departamento Financeiro
          </div>
        </div>
      </div>
    </div>
  );
}
