import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';

export function InicioPage() {
  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-950">SGAF</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Gestión Académica
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login"><Button variant="ghost">Iniciar sesión</Button></Link>
          <Link to="/registro"><Button>Registrarme</Button></Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-slate-950">
          Sistema de Gestión<br />
          <span className="text-primary">Académica y Financiera</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Matricúlate, entrega tareas, califica y administra pagos en un solo
          lugar. Diseñado para estudiantes, profesores y administración.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Link to="/registro">
            <Button className="h-11 px-6">
              Registrarme como postulante <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" className="h-11 px-6">Ya tengo cuenta</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}