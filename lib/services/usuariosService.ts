import { businessApi, handleApiError } from "@/lib/api/config";
import { UsuarioRequest, UsuarioResponse, StrapiResponse } from "@/types/usuario";

export class UsuariosService {
  static async obtenerUsuarios(): Promise<UsuarioResponse[]> {
    try {
      const response = await businessApi.get<StrapiResponse<UsuarioResponse[]>>("/usuarios");
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Obtiene usuarios con rol Técnico (campo `rol` en la API BUSINESS).
   */
  static async obtenerTecnicos(): Promise<UsuarioResponse[]> {
    try {
      const response = await businessApi.get<StrapiResponse<UsuarioResponse[]>>("/usuarios", {
        params: {
          "filters[rol][$eq]": "Tecnico",
        },
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async crearUsuario(usuario: UsuarioRequest): Promise<UsuarioResponse> {
    try {
      const response = await businessApi.post<StrapiResponse<UsuarioResponse>>(
        "/usuarios",
        usuario
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async actualizarUsuario(
    id: number,
    usuario: UsuarioRequest
  ): Promise<UsuarioResponse> {
    try {
      const response = await businessApi.put<StrapiResponse<UsuarioResponse>>(
        `/usuarios/${id}`,
        usuario
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async eliminarUsuario(id: number): Promise<void> {
    try {
      await businessApi.delete(`/usuarios/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}
