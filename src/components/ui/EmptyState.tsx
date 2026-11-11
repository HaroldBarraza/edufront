import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  titulo: string;
  descripcion?: string;
  accion?: React.ReactNode;
}

export function EmptyState({ icon: Icon, titulo, descripcion, accion }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      {Icon && <Icon className="mx-auto mb-3 h-10 w-10 text-slate-300" />}
      <h3 className="text-base font-semibold text-slate-700">{titulo}</h3>
      {descripcion && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
          {descripcion}
        </p>
      )}
      {accion && <div className="mt-4 flex justify-center">{accion}</div>}
    </div>
  );
}