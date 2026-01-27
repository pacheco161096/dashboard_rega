import { cmsApi } from "../api/config";
import { UsuarioRequest, UsuarioResponse, StrapiResponse } from "../../types/usuario";

export class UsuariosService {
    static async obtenerUsuarios(): Promise<UsuarioResponse[]> {
        const response = await cmsApi.get<StrapiResponse<UsuarioResponse[]>>("/usuarios");
        return response.data.data;
    }

    /**
     * Obtiene solo los usuarios con rol de Técnico
     * Utiliza filtrado de Strapi para optimizar la consulta
     */
    static async obtenerTecnicos(): Promise<UsuarioResponse[]> {
        const response = await cmsApi.get<StrapiResponse<UsuarioResponse[]>>(
            "/usuarios?filters[rol][$eq]=Tecnico"
        );
        return response.data.data;
    }

    static async crearUsuario(usuario: UsuarioRequest): Promise<UsuarioResponse> {
        const response = await cmsApi.post<StrapiResponse<UsuarioResponse>>("/usuarios", usuario);
        return response.data.data;
    }

    static async actualizarUsuario(id: number, usuario: UsuarioRequest): Promise<UsuarioResponse> {
        const response = await cmsApi.put<StrapiResponse<UsuarioResponse>>(`/usuarios/${id}`, usuario);
        return response.data.data;
    }

    static async eliminarUsuario(id: number): Promise<void> {
        await cmsApi.delete<void>(`/usuarios/${id}`);
    }
}