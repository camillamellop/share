import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Loader2, Plane, User, FileText, DollarSign } from 'lucide-react';
import backend from '~backend/client';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'Agendamento':
    case 'Plano de Voo':
      return <Plane className="w-4 h-4 text-cyan-400" />;
    case 'Tripulante':
    case 'Contato':
    case 'Cliente':
      return <User className="w-4 h-4 text-green-400" />;
    case 'Recibo':
    case 'Relatório':
    case 'Documento':
      return <FileText className="w-4 h-4 text-yellow-400" />;
    case 'Cobrança':
      return <DollarSign className="w-4 h-4 text-purple-400" />;
    default:
      return <Search className="w-4 h-4 text-slate-400" />;
  }
};

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['globalSearch', debouncedQuery],
    queryFn: () => backend.search.globalSearch({ query: debouncedQuery }),
    enabled: debouncedQuery.length > 2,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const showResults = isFocused && query.length > 2;

  return (
    <div className="relative" ref={searchRef}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
      <input
        type="text"
        placeholder="Buscar..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        className="bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-64"
      />
      {showResults && (
        <div className="absolute top-full mt-2 w-96 bg-slate-900 border border-slate-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="p-4 flex items-center justify-center text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Buscando...
            </div>
          )}
          {!isLoading && data?.results && data.results.length > 0 && (
            <ul>
              {data.results.map((result) => (
                <li key={result.id}>
                  <Link
                    to={result.path}
                    onClick={() => setIsFocused(false)}
                    className="flex items-center gap-3 p-3 hover:bg-slate-800 transition-colors"
                  >
                    <div className="p-2 bg-slate-800 rounded-md">
                      {getIconForType(result.type)}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{result.title}</p>
                      <p className="text-slate-400 text-xs">{result.description}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {!isLoading && (!data?.results || data.results.length === 0) && (
            <div className="p-4 text-center text-slate-400">
              Nenhum resultado encontrado para "{query}".
            </div>
          )}
        </div>
      )}
    </div>
  );
}
