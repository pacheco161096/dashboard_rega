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

// Respuesta de Strapi que incluye data y meta
export interface StrapiResponse<T> {
    data: T;
    meta?: {
        pagination?: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}