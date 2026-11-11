import { Link, useSearchParams } from 'react-router-dom';
import { ShieldX, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';

const MENSAJES: Record<string, { titulo: string; descripcion: string }> = {
  suspended: {
    titulo: 'Cuenta suspendida por mora',
    descripcion:
      'Tu cuenta fue suspendida porque tienes obligaciones financieras vencidas. Mientras esté en este estado no podrás matricularte, entregar tareas ni acceder al sistema.',
  },
  inactive: {
    titulo: 'Cuenta inactiva',
    descripcion:
      'Tu cuenta está inactiva en este momento. Contacta con administración para más información.',
  },
};

export function CuentaSuspendidaPage() {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason') ?? 'suspended';
  const mensaje = MENSAJES[reason] ?? MENSAJES.suspended;

  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f8fc] p-4">
      <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-red-500">
          <ShieldX className="h-8 w-8" />
        </div>
        <h1 className="text-center text-2xl font-bold text-slate-950">
          {mensaje.titulo}
        </h1>
        <p className="mt-3 text-center text-sm text-slate-600">
          {mensaje.descripcion}
        </p>

        {reason === 'suspended' && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <p className="mb-2 flex items-center gap-2 font-semibold text-slate-900">
              <CreditCard className="h-4 w-4" />
              ¿Cómo resolverlo?
            </p>
            <ol className="list-decimal pl-5 text-slate-600">
              <li>Acércate a recepción con tu comprobante de pago</li>
              <li>Recepción verifica y registra el pago en el sistema</li>
              <li>Tu cuenta se reactiva en minutos</li>
            </ol>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-3">
          <Link to="/login">
            <Button variant="outline">Volver al inicio de sesión</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}