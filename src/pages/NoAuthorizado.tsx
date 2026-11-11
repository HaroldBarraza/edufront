import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/button';

export function SinAcceso() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f8fc] p-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-red-500">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-950">Sin acceso</h1>
        <p className="mt-2 text-slate-600">
          Tu rol no tiene permisos para ver esta sección.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button variant="outline">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}