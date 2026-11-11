import { useEffect, lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { useAuthStore } from "./stores/useAuthstore";
import { RutaProtegida } from "./components/RutaProtegida";
import { AppShell } from "./components/layout/AppShell";

import { InicioPage } from "./pages/HomePage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegistroPage } from "./pages/auth/RegisterPage";
import { SinAcceso } from "./pages/NoAuthorizado";
import { NoEcontrado } from "./pages/NotFound";
import { CuentaSuspendidaPage } from "./pages/cuenta-suspendida";
import { MiPerfilPage } from "./pages/estudiante/miperfilpage";
import { ErrorBoundary } from "./components/ErrorBoundary";

const DashboardAdmin = lazy(() =>
  import("./pages/admin/DashboardAdmin").then((m) => ({
    default: m.DashboardAdmin,
  })),
);
const PeriodosPage = lazy(() =>
  import("./pages/admin/Periodospages").then((m) => ({
    default: m.PeriodoPage,
  })),
);
const MateriasPage = lazy(() =>
  import("./pages/admin/MateriasPage").then((m) => ({
    default: m.MateriasPage,
  })),
);
const GruposPage = lazy(() =>
  import("./pages/admin/GruposPages").then((m) => ({ default: m.GruposPage })),
);
const HorariosPage = lazy(() =>
  import("./pages/admin/HorariosPage").then((m) => ({
    default: m.HorariosPage,
  })),
);

const DashboardRecepcion = lazy(() =>
  import("./pages/recepcion/dashboardRecepcion").then((m) => ({
    default: m.DashboardRecepcion,
  })),
);
const PostulantesPendientes = lazy(() =>
  import("./pages/recepcion/PostulantesPendientes").then((m) => ({
    default: m.PostulantesPendientes,
  })),
);
const ValidarPagosPage = lazy(() =>
  import("./pages/recepcion/ValidarPagonspage").then((m) => ({
    default: m.ValidarPagosPage,
  })),
);

const DashboardProfesor = lazy(() =>
  import("./pages/profesor/DashboardProfesor").then((m) => ({
    default: m.DashboardProfesor,
  })),
);
const MisAsignacionesPage = lazy(() =>
  import("./pages/profesor/MisAsignacionesPage").then((m) => ({
    default: m.MisAsignacionesPage,
  })),
);
const NuevaAsignacionPage = lazy(() =>
  import("./pages/profesor/NuevaAsignacionesPage").then((m) => ({
    default: m.NuevaAsignacionPage,
  })),
);
const AsignacionDetallePage = lazy(() =>
  import("./pages/profesor/AsignacionDetallePage").then((m) => ({
    default: m.AsignacionDetallePage,
  })),
);

const DashboardEstudiante = lazy(() =>
  import("./pages/estudiante/DashboardEstudiante").then((m) => ({
    default: m.DashboardEstudiante,
  })),
);
const MisTareasPage = lazy(() =>
  import("./pages/estudiante/MisTareasPage").then((m) => ({
    default: m.MisTareasPage,
  })),
);
const TareaDetallePage = lazy(() =>
  import("./pages/estudiante/TareaDetallePage").then((m) => ({
    default: m.TareaDetallePage,
  })),
);
const GruposDisponiblesPage = lazy(() =>
  import("./pages/estudiante/GruposDisponibles.Pages").then((m) => ({
    default: m.GruposDisponiblesPage,
  })),
);
const MiHorarioPage = lazy(() =>
  import("./pages/estudiante/HorarioPage").then((m) => ({
    default: m.MiHorarioPage,
  })),
);
const MisPagosPage = lazy(() =>
  import("./pages/estudiante/mispagospage").then((m) => ({
    default: m.MisPagosPage,
  })),
);

function CargandoPagina() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="text-sm text-slate-500">Cargando…</p>
      </div>
    </div>
  );
}

export default function App() {
  const verificarSesion = useAuthStore((s) => s.verificarSesion);

  useEffect(() => {
    void verificarSesion();
  }, [verificarSesion]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<CargandoPagina />}>
        <Routes>
          <Route path="/" element={<InicioPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />
          <Route path="/sin-acceso" element={<SinAcceso />} />
          <Route path="/cuenta-suspendida" element={<CuentaSuspendidaPage />} />

          <Route element={<RutaProtegida roles={["ADMINISTRADOR"]} />}>
            <Route
              path="/admin"
              element={
                <AppShell>
                  <DashboardAdmin />
                </AppShell>
              }
            />
            <Route
              path="/admin/periodos"
              element={
                <AppShell>
                  <PeriodosPage />
                </AppShell>
              }
            />
            <Route
              path="/admin/materias"
              element={
                <AppShell>
                  <MateriasPage />
                </AppShell>
              }
            />
            <Route
              path="/admin/grupos"
              element={
                <AppShell>
                  <GruposPage />
                </AppShell>
              }
            />
            <Route
              path="/admin/horarios"
              element={
                <AppShell>
                  <HorariosPage />
                </AppShell>
              }
            />
            <Route
              path="/admin/perfil"
              element={
                <AppShell>
                  <MiPerfilPage />
                </AppShell>
              }
            />
          </Route>

          <Route element={<RutaProtegida roles={["RECEPCIONISTA"]} />}>
            <Route
              path="/recepcion"
              element={
                <AppShell>
                  <DashboardRecepcion />
                </AppShell>
              }
            />
            <Route
              path="/recepcion/postulantes"
              element={
                <AppShell>
                  <PostulantesPendientes />
                </AppShell>
              }
            />
            <Route
              path="/recepcion/pagos"
              element={
                <AppShell>
                  <ValidarPagosPage />
                </AppShell>
              }
            />
            <Route
              path="/recepcion/perfil"
              element={
                <AppShell>
                  <MiPerfilPage />
                </AppShell>
              }
            />
          </Route>

          <Route element={<RutaProtegida roles={["PROFESOR"]} />}>
            <Route
              path="/profesor"
              element={
                <AppShell>
                  <DashboardProfesor />
                </AppShell>
              }
            />
            <Route
              path="/profesor/asignaciones"
              element={
                <AppShell>
                  <MisAsignacionesPage />
                </AppShell>
              }
            />
            <Route
              path="/profesor/asignaciones/nueva"
              element={
                <AppShell>
                  <NuevaAsignacionPage />
                </AppShell>
              }
            />
            <Route
              path="/profesor/asignaciones/:id"
              element={
                <AppShell>
                  <AsignacionDetallePage />
                </AppShell>
              }
            />
            <Route
              path="/profesor/perfil"
              element={
                <AppShell>
                  <MiPerfilPage />
                </AppShell>
              }
            />
          </Route>

          <Route element={<RutaProtegida roles={["ESTUDIANTE"]} />}>
            <Route
              path="/estudiante"
              element={
                <AppShell>
                  <DashboardEstudiante />
                </AppShell>
              }
            />
            <Route
              path="/estudiante/asignaciones"
              element={
                <AppShell>
                  <MisTareasPage />
                </AppShell>
              }
            />
            <Route
              path="/estudiante/asignaciones/:id"
              element={
                <AppShell>
                  <TareaDetallePage />
                </AppShell>
              }
            />
            <Route
              path="/estudiante/grupos"
              element={
                <AppShell>
                  <GruposDisponiblesPage />
                </AppShell>
              }
            />
            <Route
              path="/estudiante/horario"
              element={
                <AppShell>
                  <MiHorarioPage />
                </AppShell>
              }
            />
            <Route
              path="/estudiante/pagos"
              element={
                <AppShell>
                  <MisPagosPage />
                </AppShell>
              }
            />
            <Route
              path="/estudiante/perfil"
              element={
                <AppShell>
                  <MiPerfilPage />
                </AppShell>
              }
            />
          </Route>

          <Route path="*" element={<NoEcontrado />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
