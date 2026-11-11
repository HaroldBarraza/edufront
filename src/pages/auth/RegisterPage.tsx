
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, CheckCircle2, GraduationCap } from 'lucide-react';
import { authService } from '../../service/auth.service';
import { registroSchema, type RegistroForm } from '../../schema/auth.schema';

const CAMPOS: Array<{
  name: keyof RegistroForm;
  label: string;
  placeholder: string;
  type: 'text' | 'email' | 'password';
}> = [
  { name: 'email', label: 'Correo electrónico', placeholder: 'tu@sgaf.com', type: 'email' },
  { name: 'password', label: 'Contraseña', placeholder: 'Mínimo 6 caracteres', type: 'password' },
  { name: 'nombre', label: 'Nombre', placeholder: 'Ej. Juan', type: 'text' },
  { name: 'appaterno', label: 'Apellido paterno', placeholder: 'Ej. Pérez', type: 'text' },
  { name: 'apmaterno', label: 'Apellido materno', placeholder: 'Ej. Gómez', type: 'text' },
  { name: 'telefono', label: 'Teléfono', placeholder: '+51987654321', type: 'text' },
];

export function RegistroPage() {
  const [exito, setExito] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegistroForm>({ resolver: zodResolver(registroSchema) });

  const onSubmit = async (data: RegistroForm) => {
    try {
      await authService.registrarPostulante(data);
      reset();
      setExito(
        'Tu cuenta fue creada como postulante. Revisa tu correo, paga la matrícula en recepción y espera la aprobación.',
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const rawMsg = err.response?.data?.message;
        const msg =
          typeof rawMsg === 'string'
            ? rawMsg
            : typeof rawMsg?.message === 'string'
              ? rawMsg.message
              : null;

        if (status === 409) {
          setError('email', { message: 'Este email ya está registrado.' });
          return;
        }
        if (status === 400 && msg) {
          setError('root', { message: msg });
          return;
        }
      }
      setError('root', { message: 'No se pudo completar el registro.' });
    }
  };

  // ─── Pantalla de éxito ───
  if (exito) {
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
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <div className="panel" style={{ padding: '40px 32px', textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 20px',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                background: '#e8f4f0',
                color: '#32705b',
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h2
              style={{
                fontFamily: 'Libre Caslon Display, Georgia, serif',
                fontSize: '26px',
                fontWeight: 400,
                color: 'var(--ink)',
                margin: 0,
                marginBottom: '12px',
              }}
            >
              ¡Registro exitoso!
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.6, margin: '0 0 24px' }}>
              {exito}
            </p>

            <div
              style={{
                borderRadius: '10px',
                border: '1px solid var(--line)',
                background: '#f8f9fb',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'left',
                fontSize: '12px',
                color: 'var(--muted)',
              }}
            >
              <p style={{ margin: 0, marginBottom: '8px', fontWeight: 600, color: 'var(--ink)' }}>
                Próximos pasos:
              </p>
              <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.8 }}>
                <li>Acércate a recepción para pagar la matrícula</li>
                <li>Un recepcionista verificará y aprobará tu cuenta</li>
                <li>Podrás iniciar sesión con tu email y contraseña</li>
              </ol>
            </div>

            <Link to="/login" className="primary-button" style={{ justifyContent: 'center', width: '100%' }}>
              Ir a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Formulario ───
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
      <div style={{ width: '100%', maxWidth: '560px' }}>
        {/* Logo + volver */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '28px',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--muted)',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>

          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              background: 'var(--navy-950)',
              color: 'white',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <GraduationCap size={18} />
            SGAF
          </Link>
        </div>

        {/* Card principal */}
        <div className="panel" style={{ padding: '32px' }}>
          <h2
            style={{
              fontFamily: 'Libre Caslon Display, Georgia, serif',
              fontSize: '28px',
              fontWeight: 400,
              color: 'var(--ink)',
              margin: 0,
              marginBottom: '6px',
            }}
          >
            Registro de postulante
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.6, margin: '0 0 20px' }}>
            Al registrarte deberás pagar la matrícula en recepción. Tu cuenta
            quedará <strong style={{ color: 'var(--ink)' }}>pendiente de aprobación</strong>{' '}
            hasta que se verifique el pago.
          </p>

          {/* Aviso informativo */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid #ead9b8',
              borderLeft: '3px solid var(--gold-500)',
              background: '#fffbf2',
              fontSize: '12px',
              color: '#7a5d1e',
              lineHeight: 1.5,
              marginBottom: '24px',
            }}
          >
            <strong>Importante:</strong> el registro no te da acceso inmediato al sistema.
            Debes pagar la matrícula y esperar a que un recepcionista apruebe tu cuenta.
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: '16px' }}>
            {/* Grid de 2 columnas en desktop, 1 en móvil */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
              }}
            >
              {CAMPOS.map((campo) => (
                <div key={campo.name}>
                  <label className="form-label" htmlFor={campo.name}>
                    {campo.label}
                  </label>
                  <input
                    id={campo.name}
                    type={campo.type}
                    className="form-input"
                    placeholder={campo.placeholder}
                    autoComplete={
                      campo.type === 'password'
                        ? 'new-password'
                        : campo.type === 'email'
                          ? 'email'
                          : 'off'
                    }
                    {...register(campo.name)}
                  />
                  {errors[campo.name] && (
                    <p className="form-error">{errors[campo.name]?.message}</p>
                  )}
                </div>
              ))}
            </div>

            {errors.root && <div className="form-alert error">{errors.root.message}</div>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="primary-button"
              style={{ width: '100%', justifyContent: 'center', minHeight: '44px', marginTop: '4px' }}
            >
              {isSubmitting ? 'Registrando…' : 'Registrarme como postulante'}
            </button>
          </form>

          <p
            style={{
              marginTop: '24px',
              textAlign: 'center',
              fontSize: '12px',
              color: 'var(--muted)',
            }}
          >
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: 'var(--blue-700)', fontWeight: 700 }}>
              Iniciar sesión
            </Link>
          </p>
        </div>

        <p
          style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '10px',
            color: 'var(--muted)',
            letterSpacing: '.08em',
          }}
        >
          SGAF · Sistema de Gestión Académica y Financiera
        </p>
      </div>
    </div>
  );
}