export interface UsuarioData {
    usuario?: string;
    email?: string;
    contrasena?: string;
    nombre?: string;
    rol?: string;
}

export interface UsuarioRequest {
    data: UsuarioData;
}
export interface UsuarioResponse {
    id: number;
    attributes: {
        usuario: string;
        email: string;
        contrasena: string;
        createdAt: string;
        updatedAt: string;
        publishedAt: string;
        nombre: string;
        rol: string;
    };
}