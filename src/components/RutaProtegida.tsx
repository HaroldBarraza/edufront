import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthstore";
import { Rol } from "../types/auth.types";

interface RutaProtegidaProps{
    roles?: Rol[]
}

export function RutaProtegida({roles} : RutaProtegidaProps){
    const usuario = useAuthStore((s) => s.usuario)
    const verificacion = useAuthStore((s) => s.verificandoSesion)
    const location = useLocation()

    if(verificacion){
        return <p className="p-6">Verificando Sesion</p>
    }
    if(!usuario){
        return <Navigate to="/login" replace state={{from: location}}/>
    }
    if(roles && !roles.includes(usuario.rol)){
        return <Navigate to= '/sin-acceso' replace/>
    }
    return <Outlet/>
}