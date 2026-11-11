import type { FeedbackMatricula } from "../libs/inscripciones.error";
interface Props {
  feedback: FeedbackMatricula;
  onCerrar?: () => void;
}
export function FeedbackMatriculaAlert({ feedback, onCerrar }: Props) {
  const colores =
    feedback.tipo === "error"
      ? "bg-red-50 border-red-300 text-red-900"
      : "bg-amber-50 border-amber-300 text-amber-900";

  return (
    <div role="alert" className={`border rounded p-4 mb-4 ${colores}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold mb-1">{feedback.titulo}</h3>
          <p className="text-sm">{feedback.mensaje}</p>
          <p className="text-xs mt-2 italic">💡 {feedback.sugerencia}</p>
        </div>
        {onCerrar && (
          <button
            onClick={onCerrar}
            className="ml-3 text-lg leading-none"
            aria-label="Cerrar alerta"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
