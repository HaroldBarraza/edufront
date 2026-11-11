interface PageHeaderProps {
  kicker: string;
  titulo: string;
  descripcion?: string;
  accion?: React.ReactNode;
}

export function PageHeader({ kicker, titulo, descripcion, accion }: PageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-medium text-primary">{kicker}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          {titulo}
        </h1>
        {descripcion && (
          <p className="mt-1 text-sm text-slate-500">{descripcion}</p>
        )}
      </div>
      {accion && <div className="shrink-0">{accion}</div>}
    </div>
  );
}