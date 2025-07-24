import { AlertTriangle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-900/20 border border-red-800/30 rounded-lg text-red-400">
      <AlertTriangle className="w-10 h-10 mb-4" />
      <h3 className="text-lg font-semibold">Ocorreu um Erro</h3>
      <p className="text-sm">{message}</p>
    </div>
  );
}
