import { memo } from 'react';
import { Clock, Users } from 'lucide-react';
import { Button } from './ui/button';
import type { Grupo } from '../types/academinco.types';

interface GrupoCardProps {
  grupo: Grupo;
  yaInscrito: boolean;
  matriculando: boolean;
  onMatricular: (grupoId: number) => void;
}

function horaDe(f: string): string {
  if (/^\d{2}:\d{2}/.test(f)) return f.slice(0, 5);
  return new Date(f).toISOString().slice(11, 16);
}

export const GrupoCard = memo(function GrupoCard({
  grupo,
  yaInscrito,
  matriculando,
  onMatricular,
}: GrupoCardProps) {
  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-3">
        <h3 className="text-lg font-bold text-slate-950">{grupo.materia.nombre}</h3>
        <p className="text-sm text-slate-500">
          Grupo {grupo.codigo} · {grupo.docente.usuario.nombre}{' '}
          {grupo.docente.usuario.appaterno}
        </p>
      </header>

      <ul className="mb-4 space-y-1 text-sm text-slate-600">
        {(grupo.horarios ?? []).map((h) => (
          <li key={h.id_horario} className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span className="capitalize">{h.dia_semana.toLowerCase()}</span>
            <span className="text-slate-400">·</span>
            <span>{horaDe(h.hora_inicio)} – {horaDe(h.hora_fin)}</span>
          </li>
        ))}
      </ul>

      <p className="mb-3 flex items-center gap-1.5 text-xs text-slate-500">
        <Users className="h-3.5 w-3.5" />
        Cupo: {grupo.cupo_maximo}
      </p>

      <div className="mt-auto">
        {yaInscrito ? (
          <Button variant="secondary" disabled className="w-full">
            Ya inscrito
          </Button>
        ) : (
          <Button
            onClick={() => onMatricular(grupo.id_grupo)}
            disabled={matriculando}
            className="w-full"
          >
            {matriculando ? 'Matriculando…' : 'Matricularme'}
          </Button>
        )}
      </div>
    </article>
  );
});