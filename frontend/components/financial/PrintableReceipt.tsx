import { useQuery } from "@tanstack/react-query";
import { useBackend } from "../../hooks/useBackend";

interface PrintableReceiptProps {
  receipt: any;
}

// Função para converter número em texto por extenso
function numeroPorExtenso(n: number): string {
  if (n === null || n === undefined) return '';
  let num = n.toFixed(2).toString().replace('.', ',');
  let [reais, centavos] = num.split(',');

  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const dezenas = [
    '', 'dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'
  ];
  const dez_a_dezenove = [
    'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'
  ];
  const centenas = [
    '', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos',
    'seiscentos', 'setecentos', 'oitocentos', 'novecentos'
  ];

  function getExtenso(numero: number): string {
    if (numero == 0) return '';
    if (numero < 10) return unidades[numero];
    if (numero < 20) return dez_a_dezenove[numero - 10];
    if (numero < 100) {
      return dezenas[Math.floor(numero / 10)] + (numero % 10 !== 0 ? ' e ' + unidades[numero % 10] : '');
    }
    if (numero == 100) return 'cem';
    if (numero < 1000) {
      return centenas[Math.floor(numero / 100)] + (numero % 100 !== 0 ? ' e ' + getExtenso(numero % 100) : '');
    }
    if (numero < 1000000) {
      const mil = Math.floor(numero / 1000);
      const resto = numero % 1000;
      return (mil > 1 ? getExtenso(mil) + ' mil' : 'mil') + (resto !== 0 ? ' e ' + getExtenso(resto) : '');
    }
    return numero.toString();
  }

  let extenso = getExtenso(parseInt(reais)) || 'zero';
  extenso += parseInt(reais) === 1 ? ' real' : ' reais';
  if (parseInt(centavos) > 0) {
    extenso += ' e ' + getExtenso(parseInt(centavos));
    extenso += parseInt(centavos) === 1 ? ' centavo' : ' centavos';
  }
  return extenso.charAt(0).toUpperCase() + extenso.slice(1);
}

export default function PrintableReceipt({ receipt }: PrintableReceiptProps) {
  const backend = useBackend();
  const { data: companyConfigResponse } = useQuery({
    queryKey: ["companyConfig"],
    queryFn: () => backend.financial.getCompanyConfig()
  });
  const companyConfig = companyConfigResponse?.config;

  if (!receipt) return null;

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
            {config.email && <div className="text-sm">{config.email}</div>}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-700">RECIBO</div>
            <div className="text-sm">Nº {receipt.numero}</div>
            <div className="text-sm">
              Emitido em {new Date(receipt.data_emissao).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-lg mb-4">
            Recebi de <strong>{receipt.cliente_nome}</strong>
            {receipt.cliente_cpf_cnpj && `, CPF/CNPJ: ${receipt.cliente_cpf_cnpj}`}
            {receipt.cliente_endereco && `, residente/estabelecido em ${receipt.cliente_endereco}`}
          </div>
          
          <div className="text-lg mb-4">
            A quantia de <strong>R$ {receipt.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>
          
          <div className="text-lg mb-4">
            ({numeroPorExtenso(receipt.valor)})
          </div>
          
          <div className="text-lg mb-4">
            Referente a: <strong>{receipt.descricao}</strong>
          </div>
          
          {receipt.observacoes && (
            <div className="text-sm mb-4">
              Observações: {receipt.observacoes}
            </div>
          )}
        </div>

        <div className="flex justify-between items-end mt-12">
          <div className="text-sm">
            {config.nome}
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
