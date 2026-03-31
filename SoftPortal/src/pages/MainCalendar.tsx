import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import '../styles/MainCalendar.css';

interface UsuarioItem {
  idUsuario: number;
  nombreUsuario: string;
  email: string;
  idRol: number;
  rolNombre: string;
}

interface RoleItem {
  idRol: number;
  nombre: string;
}

const API_BASE_URL = 'http://localhost:8080/api';

export default function MainCalendar() {
  const { user, isAdmin } = useAuth();
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  const roleMap = useMemo(() => {
    const map = new Map<number, string>();
    roles.forEach((role) => map.set(role.idRol, role.nombre));
    return map;
  }, [roles]);

  const loadAdminData = useCallback(async () => {
    if (!isAdmin) {
      return;
    }

    setIsAdminLoading(true);
    setAdminError(null);

    try {
      const [usuariosResponse, rolesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/usuarios`),
        fetch(`${API_BASE_URL}/roles`),
      ]);

      if (!usuariosResponse.ok || !rolesResponse.ok) {
        throw new Error('No se pudieron cargar usuarios y roles');
      }

      const usuariosData = (await usuariosResponse.json()) as UsuarioItem[];
      const rolesData = (await rolesResponse.json()) as RoleItem[];

      setUsuarios(usuariosData);
      setRoles(rolesData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error de carga';
      setAdminError(message);
    } finally {
      setIsAdminLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (showRoleManager) {
      void loadAdminData();
    }
  }, [showRoleManager, loadAdminData]);

  const handleRoleChange = async (targetUserId: number, newRoleId: number) => {
    if (!user) {
      return;
    }

    setAdminError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${targetUserId}/rol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idRol: newRoleId,
          adminUserId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('No se pudo actualizar el rol');
      }

      setUsuarios((prev) =>
        prev.map((u) =>
          u.idUsuario === targetUserId
            ? { ...u, idRol: newRoleId, rolNombre: roleMap.get(newRoleId) || u.rolNombre }
            : u,
        ),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar rol';
      setAdminError(message);
    }
  };

  return (
    <>
      <Header onManageRolesClick={() => setShowRoleManager((prev) => !prev)} />

      <main className="dashboard-main">
        <section className="welcome-card">
          <h1>Bienvenido a SoftPortal</h1>
          <p>
            Esta es tu pagina exclusiva, <strong>{user?.nombre_usuario || 'usuario'}</strong>.
          </p>
        </section>

        {isAdmin && showRoleManager && (
          <section className="roles-card">
            <h2>Gestionar roles</h2>
            <p>Solo los administradores pueden ver y editar esta seccion.</p>

            {adminError && <div className="roles-error">{adminError}</div>}

            {isAdminLoading ? (
              <p>Cargando usuarios y roles...</p>
            ) : (
              <div className="roles-table-wrapper">
                <table className="roles-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol actual</th>
                      <th>Asignar rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((usuario) => (
                      <tr key={usuario.idUsuario}>
                        <td>{usuario.nombreUsuario}</td>
                        <td>{usuario.email}</td>
                        <td>{usuario.rolNombre}</td>
                        <td>
                          <select
                            value={usuario.idRol}
                            onChange={(e) => void handleRoleChange(usuario.idUsuario, Number(e.target.value))}
                          >
                            {roles.map((role) => (
                              <option key={role.idRol} value={role.idRol}>
                                {role.nombre}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}