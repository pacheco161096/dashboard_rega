import { cmsApi } from "../api/config";
import { UsuarioRequest, UsuarioResponse } from "../../types/usuario";

export class UsuariosService {
    static async obtenerUsuarios(): Promise<UsuarioResponse[]> {
        const response = await cmsApi.get<UsuarioResponse[]>("/usuarios");
        return response.data;
    }
    static async crearUsuario(usuario: UsuarioRequest): Promise<UsuarioResponse> {
        const response = await cmsApi.post<UsuarioResponse>("/usuarios", usuario);
        return response.data;
    }
    static async actualizarUsuario(id: number, usuario: UsuarioRequest): Promise<UsuarioResponse> {
        const response = await cmsApi.put<UsuarioResponse>(`/usuarios/${id}`, usuario);
        return response.data;
    }
    static async eliminarUsuario(id: number): Promise<void> {
        await cmsApi.delete<void>(`/usuarios/${id}`);
    }
}