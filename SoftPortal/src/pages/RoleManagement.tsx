import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import '../styles/RoleManagement.css';

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

export default function RoleManagement() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [usuariosResponse, rolesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/usuarios`),
        fetch(`${API_BASE_URL}/roles`),
      ]);

      if (!usuariosResponse.ok || !rolesResponse.ok) {
        throw new Error('No se pudieron cargar usuarios y roles.');
      }

      const usuariosData = (await usuariosResponse.json()) as UsuarioItem[];
      const rolesData = (await rolesResponse.json()) as RoleItem[];

      setUsuarios(usuariosData);
      setRoles(rolesData);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Error al cargar datos';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }

    void loadData();
  }, [isAdmin, loadData, navigate]);

  const updateRole = async (targetUserId: number, newRoleId: number) => {
    if (!user?.id) {
      return;
    }

    setError(null);
    setSuccess(null);

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
        throw new Error('No se pudo actualizar el rol del usuario.');
      }

      const selectedRole = roles.find((role) => role.idRol === newRoleId);
      setUsuarios((prev) =>
        prev.map((item) =>
          item.idUsuario === targetUserId
            ? { ...item, idRol: newRoleId, rolNombre: selectedRole?.nombre || item.rolNombre }
            : item,
        ),
      );
      setSuccess('Rol actualizado correctamente.');
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Error al actualizar rol';
      setError(message);
    }
  };

  return (
    <>
      <Header
        onManageRolesClick={() => navigate('/gestion-roles')}
        onOpenMyRequestsClick={() => navigate('/mis-solicitudes')}
        onOpenRequestsClick={() => navigate('/solicitudes-gestion')}
        onOpenReportsClick={() => navigate('/reportes-solicitudes')}
      />

      <main className="roles-main">
        <section className="roles-header-card">
          <h1>Gestionar Roles</h1>
          <p>Panel exclusivo de administrador para asignar o cambiar roles de usuarios.</p>
        </section>

        {error && <div className="roles-message error">{error}</div>}
        {success && <div className="roles-message success">{success}</div>}

        <section className="roles-table-card">
          {isLoading ? (
            <p>Cargando usuarios y roles...</p>
          ) : (
            <div className="roles-table-wrap">
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
                          onChange={(event) => void updateRole(usuario.idUsuario, Number(event.target.value))}
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
      </main>
    </>
  );
}
