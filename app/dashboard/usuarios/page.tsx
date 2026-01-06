'use client'

import { useState, useEffect, useCallback, useMemo } from "react"
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PencilIcon, TrashIcon } from "@primer/octicons-react"
import { useToast } from "@/hooks/use-toast"
import { ROLES_ARRAY } from "@/lib/roles"

interface Usuario {
  id: number
  nombre: string
  username: string
  email: string
  role: {
    id: number
    name: string
  }
}

const ROLES = ROLES_ARRAY

const API_BASE_URL = 'https://monkfish-app-2et8k.ondigitalocean.app/api'

export default function Usuarios() {
  const { toast } = useToast()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  const [formData, setFormData] = useState({
    nombre: "",
    username: "",
    email: "",
    password: "",
    role: "",
  })

  // Cargar usuarios
  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/usuarios?populate=role`)
      if (response.data?.data) {
        const usuariosData = response.data.data.map((item: { id: number; attributes: { nombre?: string; usuario?: string; email?: string; role?: { data?: { id: number; attributes: { name?: string } } } } }) => ({
          id: item.id,
          nombre: item.attributes.nombre || "",
          username: item.attributes.usuario || "",
          email: item.attributes.email || "",
          role: item.attributes.role?.data ? {
            id: item.attributes.role.data.id,
            name: item.attributes.role.data.attributes.name || ""
          } : { id: 0, name: "" }
        }))
        setUsuarios(usuariosData)
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchUsuarios()
  }, [fetchUsuarios])

  // Filtrar usuarios por nombre o email
  const filteredUsuarios = useMemo(() => {
    if (!searchQuery.trim()) {
      return usuarios
    }

    const normalized = searchQuery.trim().toLowerCase()
    
    return usuarios.filter((usuario) => {
      const matchNombre = usuario.nombre?.toLowerCase().includes(normalized)
      const matchEmail = usuario.email?.toLowerCase().includes(normalized)
      
      return matchNombre || matchEmail
    })
  }, [usuarios, searchQuery])

  // Manejar cambios en el formulario
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  // Limpiar formulario
  const resetForm = useCallback(() => {
    setFormData({
      nombre: "",
      username: "",
      email: "",
      password: "",
      role: "",
    })
    setIsEditing(false)
    setSelectedUsuario(null)
  }, [])

  // Abrir modal para crear usuario (solo en pantallas pequeñas)
  const handleNewUsuario = () => {
    resetForm()
    setIsEditing(false)
    // Abrir modal solo en pantallas menores a 2xl
    // En pantallas 2xl, el form se muestra a la derecha automáticamente (no se usa modal)
    setShowFormModal(true)
  }

  // Editar usuario
  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario)
    setIsEditing(true)
    setFormData({
      nombre: usuario.nombre,
      username: usuario.username,
      email: usuario.email,
      password: "",
      role: usuario.role.id.toString(),
    })
    // Abrir modal solo en pantallas menores a 2xl
    // En pantallas 2xl, el form se llena automáticamente a la derecha (no se usa modal)
    setShowFormModal(true)
  }

  // Cerrar modal y limpiar form
  const handleCloseModal = useCallback(() => {
    setShowFormModal(false)
    resetForm()
  }, [resetForm])

  // Crear usuario
  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const payload = {
        data: {
          nombre: formData.nombre,
          usuario: formData.username,
          email: formData.email,
          contrasena: formData.password,
          role: formData.role,
        }
      }

      await axios.post(`${API_BASE_URL}/usuarios`, payload)
      
      toast({
        title: "Éxito",
        description: "Usuario creado correctamente",
      })
      
      resetForm()
      setShowFormModal(false)
      fetchUsuarios()
    } catch (error: unknown) {
      console.error("Error al crear usuario:", error)
      toast({
        title: "Error",
        description: (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "No se pudo crear el usuario",
        variant: "destructive",
      })
    }
  }, [formData, toast, resetForm, fetchUsuarios])

  // Actualizar usuario
  const handleUpdate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedUsuario) return

    try {
      const payloadData: {
        nombre: string
        usuario: string
        email: string
        contrasena?: string
        role?: string
      } = {
        nombre: formData.nombre,
        usuario: formData.username,
        email: formData.email,
      }

      // Solo incluir password si se proporcionó uno nuevo
      if (formData.password) {
        payloadData.contrasena = formData.password
      }

      // Incluir role si se seleccionó
      if (formData.role) {
        payloadData.role = formData.role
      }

      const payload = {
        data: payloadData
      }

      await axios.put(`${API_BASE_URL}/usuarios/${selectedUsuario.id}`, payload)
      
      toast({
        title: "Éxito",
        description: "Usuario actualizado correctamente",
      })
      
      resetForm()
      setShowFormModal(false)
      fetchUsuarios()
    } catch (error: unknown) {
      console.error("Error al actualizar usuario:", error)
      toast({
        title: "Error",
        description: (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "No se pudo actualizar el usuario",
        variant: "destructive",
      })
    }
  }, [formData, selectedUsuario, toast, resetForm, fetchUsuarios])

  // Eliminar usuario
  const handleDelete = async () => {
    if (!usuarioToDelete) return

    try {
      await axios.delete(`${API_BASE_URL}/usuarios/${usuarioToDelete.id}`)
      
      toast({
        title: "Éxito",
        description: "Usuario eliminado correctamente",
      })
      
      setShowDeleteModal(false)
      setUsuarioToDelete(null)
      fetchUsuarios()
    } catch (error: unknown) {
      console.error("Error al eliminar usuario:", error)
      toast({
        title: "Error",
        description: (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "No se pudo eliminar el usuario",
        variant: "destructive",
      })
    }
  }

  // Confirmar eliminación
  const confirmDelete = (usuario: Usuario) => {
    setUsuarioToDelete(usuario)
    setShowDeleteModal(true)
  }

  // Manejar búsqueda
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Componente del formulario - Las funciones están memorizadas para evitar pérdida de foco
  const renderForm = () => (
    <form onSubmit={isEditing ? handleUpdate : handleCreate} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          type="text"
          placeholder="Ingrese el nombre"
          value={formData.nombre}
          onChange={(e) => handleInputChange("nombre", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Usuario</Label>
        <Input
          id="username"
          type="text"
          placeholder="Ingrese el usuario"
          value={formData.username}
          onChange={(e) => handleInputChange("username", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Ingrese el email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Contraseña {isEditing && <span className="text-xs text-gray-500">(dejar vacío para no cambiar)</span>}
        </Label>
        <Input
          id="password"
          type="password"
          placeholder={isEditing ? "Nueva contraseña (opcional)" : "Ingrese la contraseña"}
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          required={!isEditing}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => handleInputChange("role", value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione un rol" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((rol) => (
              <SelectItem key={rol.id} value={rol.value}>
                {rol.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleCloseModal}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          {isEditing ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  )

  return (
    <div className="w-full p-6">
      {/* Header con botón y buscador */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
        {/* Botón solo visible en pantallas menores a 2xl (donde se usa el modal) */}
        <Button 
          onClick={handleNewUsuario} 
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 w-full sm:w-auto 2xl:hidden"
        >
          <i className="fa-solid fa-plus text-sm"></i>
          <span>Nuevo Usuario</span>
        </Button>
        <div className="relative w-full sm:w-auto max-w-xl">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <i className="fa-solid fa-magnifying-glass text-sm"></i>
          </div>
          <input 
            onChange={(e) => handleSearch(e.target.value)} 
            placeholder="Buscar por nombre o email..." 
            type="text" 
            value={searchQuery}
            className="block w-full h-10 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700 bg-white transition-all duration-200" 
          />
        </div>
      </div>

      {/* Layout responsive */}
      <div className="flex flex-col 2xl:flex-row gap-6 items-start">
        {/* Tabla de usuarios */}
        <div className="w-full 2xl:w-2/3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <i className="fa-regular fa-users text-5xl text-gray-300 mb-4"></i>
              <p className="text-gray-500 text-lg font-medium mb-2">
                {searchQuery ? "No se encontraron usuarios" : "No hay usuarios registrados"}
              </p>
              <p className="text-gray-400 text-sm text-center">
                {searchQuery ? "Intenta con otro término de búsqueda" : "Crea tu primer usuario usando el botón Nuevo Usuario"}
              </p>
            </div>
          ) : (
            <>
              {/* Vista de lista para mobile y tablet */}
              <div className="lg:hidden space-y-4 p-4">
                {filteredUsuarios.map((usuario) => (
                  <div
                    key={usuario.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3">
                      {/* Nombre */}
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Nombre</p>
                        <p className="text-sm font-semibold text-gray-900">{usuario.nombre}</p>
                      </div>
                      
                      {/* Usuario */}
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Usuario</p>
                        <p className="text-sm text-gray-700">{usuario.username}</p>
                      </div>
                      
                      {/* Email */}
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email</p>
                        <p className="text-sm text-gray-700 break-words">{usuario.email}</p>
                      </div>
                      
                      {/* Rol */}
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Rol</p>
                        <p className="text-sm text-gray-700">{usuario.role.name || "Sin rol"}</p>
                      </div>
                      
                      {/* Acciones */}
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Acciones</p>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1 bg-blue-600 text-white hover:bg-blue-700 border-blue-600 transition-colors h-10"
                            onClick={() => handleEdit(usuario)}
                          >
                            <PencilIcon size={16} className="mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 bg-red-600 text-white hover:bg-red-700 border-red-600 transition-colors h-10"
                            onClick={() => confirmDelete(usuario)}
                          >
                            <TrashIcon size={16} className="mr-2" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vista de tabla para desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                      <th className="w-[30%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                      <th className="w-[20%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsuarios.map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 truncate" title={usuario.nombre}>{usuario.nombre}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 truncate" title={usuario.username}>{usuario.username}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 truncate" title={usuario.email}>{usuario.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 truncate">{usuario.role.name || "Sin rol"}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-blue-600 text-white hover:bg-blue-700 border-blue-600 transition-colors"
                              onClick={() => handleEdit(usuario)}
                              title="Editar usuario"
                            >
                              <PencilIcon size={14} />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-red-600 text-white hover:bg-red-700 border-red-600 transition-colors"
                              onClick={() => confirmDelete(usuario)}
                              title="Eliminar usuario"
                            >
                              <TrashIcon size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Formulario - Solo visible en pantallas 2xl (muy grandes) */}
        <div className="hidden 2xl:block w-80 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {isEditing ? "Actualizar Usuario" : "Crear Usuario"}
          </h2>
          {renderForm()}
        </div>
      </div>

      {/* Modal del formulario - Solo visible en pantallas menores a 2xl */}
      <div className="2xl:hidden">
        <Dialog open={showFormModal} onOpenChange={(open) => {
          setShowFormModal(open)
          if (!open) {
            resetForm()
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Actualizar Usuario" : "Crear Usuario"}
              </DialogTitle>
            </DialogHeader>
            {renderForm()}
          </DialogContent>
        </Dialog>
      </div>

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">¿Eliminar usuario?</h2>
            <p className="text-gray-600 text-sm mb-4">
              ¿Estás seguro de que deseas eliminar al usuario <strong>{usuarioToDelete?.nombre}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                className="px-4 py-2"
                onClick={() => {
                  setShowDeleteModal(false)
                  setUsuarioToDelete(null)
                }}
              >
                Cancelar
              </Button>
              <Button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDelete}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
