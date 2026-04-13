"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/toast"
import { Trash2, UserPlus, X, Camera, KeyRound } from "lucide-react"

type User = {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  image: string | null
  avatarUrl: string | null
  role: string
  createdAt: string
  _count: { appointments: number }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newUser, setNewUser] = useState({ name: "", email: "", phone: "", password: "", role: "CLIENT" })
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [resetUser, setResetUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [resetting, setResetting] = useState(false)
  const { data: session } = useSession()
  const { toast } = useToast()
  const myId = (session?.user as any)?.id

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const res = await fetch("/api/users")
    const data = await res.json()
    setUsers(data)
    setLoading(false)
  }

  const changeRole = async (userId: string, newRole: string) => {
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    })

    if (res.ok) {
      const labels: Record<string, string> = {
        ADMIN: "Usuario promovido a Administrador",
        BARBER: "Usuario promovido a Profesional",
        CLIENT: "Rol cambiado a Cliente",
      }
      toast(labels[newRole] || "Rol actualizado")
      fetchUsers()
    } else {
      const data = await res.json()
      toast(data.error || "Error al cambiar rol", "error")
    }
  }

  const handleResetPassword = async () => {
    if (!resetUser || newPassword.length < 6) return
    setResetting(true)
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: resetUser.id, password: newPassword }),
    })
    setResetting(false)
    if (res.ok) {
      toast("Contraseña actualizada")
      setResetUser(null)
      setNewPassword("")
    } else {
      const data = await res.json()
      toast(data.error || "Error al actualizar", "error")
    }
  }

  const createUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) return
    setCreating(true)
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    })
    setCreating(false)
    if (res.ok) {
      toast("Usuario creado")
      setShowCreate(false)
      setNewUser({ name: "", email: "", phone: "", password: "", role: "CLIENT" })
      fetchUsers()
    } else {
      const data = await res.json()
      toast(data.error || "Error al crear usuario", "error")
    }
  }

  const handleUserAvatarUpload = async (userId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) { toast("La foto debe ser menor a 3MB", "error"); return }
    setUploadingId(userId)
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result as string
      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, barberId: userId }),
      })
      if (res.ok) {
        const { url } = await res.json()
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, avatarUrl: url } : u))
        toast("Foto actualizada")
      }
      setUploadingId(null)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const deleteUser = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    const res = await fetch(`/api/users?id=${confirmDelete.id}`, { method: "DELETE" })
    setDeleting(false)
    setConfirmDelete(null)
    if (res.ok) {
      toast("Usuario eliminado")
      fetchUsers()
    } else {
      const data = await res.json()
      toast(data.error || "Error al eliminar", "error")
    }
  }

  return (
    <div>
      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <Trash2 size={20} className="text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Eliminar usuario</h3>
            <p className="text-sm text-white/40 mb-1">
              ¿Seguro que quieres eliminar a <span className="text-white font-medium">{confirmDelete.name || confirmDelete.email || "este usuario"}</span>?
            </p>
            <p className="text-xs text-red-400/80 mb-6">
              Se eliminarán también todas sus citas ({confirmDelete._count.appointments}). Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:bg-white/5 transition"
              >
                Cancelar
              </button>
              <button
                onClick={deleteUser}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {resetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0a1520] border border-[#0e2530] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">Cambiar contraseña</h3>
                <p className="text-xs text-white/40 mt-0.5">{resetUser.name || resetUser.email}</p>
              </div>
              <button onClick={() => { setResetUser(null); setNewPassword("") }} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition">
                <X size={18} />
              </button>
            </div>
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1.5">Nueva contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoFocus
                className="w-full p-3 bg-[#080f16] border border-[#0e2530] rounded-xl text-white placeholder-white/25 focus:border-[#00bcd4] focus:outline-none text-sm"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setResetUser(null); setNewPassword("") }} className="flex-1 px-4 py-2.5 rounded-xl border border-[#0e2530] text-sm text-white/50 hover:bg-white/5 transition">
                Cancelar
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resetting || newPassword.length < 6}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#00bcd4] text-white text-sm font-semibold hover:bg-[#0097a7] transition disabled:opacity-50"
              >
                {resetting ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create user modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0a1520] border border-[#0e2530] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Crear usuario</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1.5">Nombre *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Nombre completo"
                  className="w-full p-3 bg-[#080f16] border border-[#0e2530] rounded-xl text-white placeholder-white/25 focus:border-[#00bcd4] focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1.5">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  className="w-full p-3 bg-[#080f16] border border-[#0e2530] rounded-xl text-white placeholder-white/25 focus:border-[#00bcd4] focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1.5">Teléfono</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="+57 300 123 4567"
                  className="w-full p-3 bg-[#080f16] border border-[#0e2530] rounded-xl text-white placeholder-white/25 focus:border-[#00bcd4] focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1.5">Contraseña *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full p-3 bg-[#080f16] border border-[#0e2530] rounded-xl text-white placeholder-white/25 focus:border-[#00bcd4] focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-1.5">Rol</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full p-3 bg-[#080f16] border border-[#0e2530] rounded-xl text-white focus:border-[#00bcd4] focus:outline-none text-sm"
                >
                  <option value="CLIENT">Cliente</option>
                  <option value="BARBER">Profesional</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#0e2530] text-sm text-white/50 hover:bg-white/5 transition"
              >
                Cancelar
              </button>
              <button
                onClick={createUser}
                disabled={creating || !newUser.name || !newUser.email || !newUser.password}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#00bcd4] text-white text-sm font-semibold hover:bg-[#0097a7] transition disabled:opacity-50"
              >
                {creating ? "Creando..." : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuarios</h1>
          <p className="text-sm text-white/40 mt-1">Administra los roles de los usuarios</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00bcd4] text-white text-sm font-semibold hover:bg-[#0097a7] transition"
        >
          <UserPlus size={16} />
          Crear usuario
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#0a1520] rounded-xl p-4 border border-[#0e2530] animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#0e2530] rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-36 bg-[#0e2530] rounded mb-2" />
                  <div className="h-3 w-48 bg-[#0e2530] rounded" />
                </div>
                <div className="h-8 w-24 bg-[#0e2530] rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-[#0a1520] rounded-xl border border-[#0e2530]">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-white/30">No hay usuarios registrados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-[#0a1520] rounded-xl p-4 border border-[#0e2530]"
            >
              <div className="flex items-center gap-3">
                {/* Avatar — click to upload (admin only) */}
                <label className="relative flex-shrink-0 cursor-pointer group/avatar">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingId === user.id}
                    onChange={(e) => handleUserAvatarUpload(user.id, e)}
                  />
                  {user.avatarUrl || user.image ? (
                    <img
                      src={user.avatarUrl || user.image || ""}
                      alt={user.name || ""}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-[#00bcd4]/20 rounded-full flex items-center justify-center text-lg font-bold text-[#00bcd4]">
                      {(user.name || user.email || "?")[0].toUpperCase()}
                    </div>
                  )}
                  {uploadingId === user.id ? (
                    <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition">
                      <Camera size={14} className="text-white" />
                    </div>
                  )}
                </label>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white truncate">
                      {user.name || "Sin nombre"}
                    </p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        user.role === "ADMIN"
                          ? "bg-purple-900/30 text-purple-400"
                          : user.role === "BARBER"
                          ? "bg-[#00bcd4]/20 text-[#00bcd4]"
                          : "bg-blue-900/30 text-blue-400"
                      }`}
                    >
                      {user.role === "ADMIN" ? "Admin" : user.role === "BARBER" ? "Profesional" : "Cliente"}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 truncate">
                    {user.email || "Sin email"}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    {user.phone && (
                      <p className="text-xs text-white/30">{user.phone}</p>
                    )}
                    <p className="text-xs text-white/30">
                      {user._count.appointments} citas
                    </p>
                    <p className="text-xs text-white/20">
                      Registro: {new Date(user.createdAt).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  {user.role === "CLIENT" && (
                    <button
                      onClick={() => changeRole(user.id, "BARBER")}
                      className="px-3 py-2 text-xs font-medium rounded-lg bg-[#00bcd4] text-white hover:bg-[#c0392b] transition"
                    >
                      Hacer Profesional
                    </button>
                  )}
                  {user.role === "BARBER" && (
                    <button
                      onClick={() => changeRole(user.id, "CLIENT")}
                      className="px-3 py-2 text-xs font-medium rounded-lg bg-[#0e2530] text-white/50 hover:bg-[#4d2c2c] transition"
                    >
                      Quitar
                    </button>
                  )}
                  <button
                    onClick={() => { setResetUser(user); setNewPassword("") }}
                    className="p-2 rounded-lg text-white/20 hover:text-[#00bcd4] hover:bg-[#00bcd4]/10 transition"
                    title="Cambiar contraseña"
                  >
                    <KeyRound size={15} />
                  </button>
                  {user.id !== myId && (
                    <button
                      onClick={() => setConfirmDelete(user)}
                      className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-900/20 transition"
                      title="Eliminar usuario"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
