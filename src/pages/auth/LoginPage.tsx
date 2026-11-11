import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore, CuentaNoHabilidtadaError } from '../../stores/useAuthstore';
import { Logo } from '../../components/layout/Logo';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
type LoginForm = z.infer<typeof loginSchema>;

const MENSAJE_ESTADO: Record<string, string> = {
  PENDIENTE_APROBACION: 'Tu cuenta aún no está aprobada. Recepción debe verificar tu pago de matrícula.',
  SUSPENDIDO_MORA: 'Tu cuenta está suspendida por mora. Regulariza tus pagos para ingresar.',
  INACTIVO: 'Tu cuenta está inactiva. Contacta a administración.',
};

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const rolHome = useAuthStore((s) => s.rolHome);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const expired = searchParams.get('expired') === '1';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
      const home = rolHome();
      navigate(home ?? '/', { replace: true });
    } catch (err) {
      if (err instanceof CuentaNoHabilidtadaError) {
        setError('root', { message: MENSAJE_ESTADO[err.estado] ?? `Estado: ${err.estado}` });
        return;
      }
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('root', { message: 'Email o contraseña incorrectos.' });
        return;
      }
      setError('root', { message: 'Error inesperado, intenta de nuevo.' });
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--canvas)',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <div style={{ padding: '16px 20px', background: 'var(--navy-950)', borderRadius: '14px' }}>
            <Logo />
          </div>
        </div>

        <div className="panel" style={{ padding: '32px' }}>
          <h2
            style={{
              fontFamily: 'Libre Caslon Display, Georgia, serif',
              fontSize: '26px',
              fontWeight: 400,
              color: 'var(--ink)',
              margin: 0,
              marginBottom: '6px',
            }}
          >
            Iniciar sesión
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '0 0 24px' }}>
            Accede a tu portal SGAF
          </p>

          {expired && (
            <div className="form-alert warning">
              Tu sesión expiró. Vuelve a iniciar sesión.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                {...register('email')}
                className="form-input"
                placeholder="tu@sgaf.com"
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div>
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                {...register('password')}
                className="form-input"
                placeholder="••••••••"
              />
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            {errors.root && <div className="form-alert error">{errors.root.message}</div>}

            <button type="submit" disabled={isSubmitting} className="primary-button" style={{ width: '100%', justifyContent: 'center', minHeight: '44px' }}>
              {isSubmitting ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>

          <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--muted)' }}>
            ¿Aún no tienes cuenta?{' '}
            <Link to="/registro" style={{ color: 'var(--blue-700)', fontWeight: 700 }}>
              Regístrate como postulante
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '10px', color: 'var(--muted)', letterSpacing: '.08em' }}>
          SGAF · Sistema de Gestión Académica y Financiera
        </p>
      </div>
    </div>
  );
}