import { AlertCircle, CheckCircle } from 'lucide-react';

interface ErrorBannerProps {
  variante?: 'error' | 'exito' | 'advertencia';
  mensaje: string;
  onCerrar?: () => void;
}

const estilos = {
  error: 'border-red-200 bg-red-50 text-red-800',
  exito: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  advertencia: 'border-amber-200 bg-amber-50 text-amber-800',
} as const;

export function ErrorBanner({ variante = 'error', mensaje, onCerrar }: ErrorBannerProps) {
  const Icon = variante === 'exito' ? CheckCircle : AlertCircle;
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border p-4 ${estilos[variante]}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <p className="flex-1 text-sm">{mensaje}</p>
      {onCerrar && (
        <button onClick={onCerrar} className="text-lg leading-none opacity-60 hover:opacity-100">
          ×
        </button>
      )}
    </div>
  );
}