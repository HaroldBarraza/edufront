export type RazonPago = "MATRICULA" | "MENSUALIDAD" | "OTRO";
export type EstadoDeuda = "PENDIENTE" | "PAGADO" | "CANCELADA" | "VENCIDO";
export type EstadoPago = "ACEPTADO" | "RECHAZADO" | "PENDIENTE";
export type MetodoPago = "TRANSFERENCIA" | "CAJA" | "PASARELA_EN_LINEA";

export interface Pago {
  id_pago: number;
  monto: string;
  metodo: MetodoPago;
  estado: EstadoPago;
  fecha_pago: string;
  referencia_pasarela: string | null;
  comprobante_url: string | null;
  fecha_verificacion: string | null;
  verificadoPorUsuario?: {
    id_usuario: number;
    nombre: string;
    appaterno: string;
    rol: string;
  } | null;
}

export interface ObligacionFinanciera {
  id_obligacion: number;
  razon: RazonPago;
  monto: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  estado: EstadoDeuda;
  periodo?: { nombre: string; year: number; numero: number } | null;
  pagos: Pago[];
  estudiante?: {
    id_estudiante: number;
    usuario: {
      id_usuario: number;
      email: string;
      nombre: string;
      appaterno: string;
      estado: string;
    };
  };
}

export interface EstudianteConObligaciones {
  id_estudiante: number;
  codigo_matricula: string;
  usuario: {
    id_usuario: number;
    email: string;
    nombre: string;
    appaterno: string;
    apmaterno: string;
    telefono: string;
    estado: string;
  };
  obligaciones: ObligacionFinanciera[];
}
