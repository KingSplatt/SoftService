import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import '../styles/RequestsManagement.css';

interface SolicitudItem {
  idSolicitud: number;
  usuarioId: number;
  usuarioNombre: string;
  tipoId: number;
  tipoNombre: string;
  estadoId: number;
  estadoNombre: string;
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
  fechaSolicitud: string;
}

const API_BASE_URL = 'http://localhost:8080/api';

function formatDate(dateValue: string): string {
  if (!dateValue) {
    return '-';
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed);
}

function parseDateInput(dateValue: string): Date | null {
  if (!dateValue) {
    return null;
  }

  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function RequestsManagement() {
  const navigate = useNavigate();
  const { user, isAdminOrRh } = useAuth();
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filterDia, setFilterDia] = useState('');
  const [filterMes, setFilterMes] = useState('');
  const [filterAnio, setFilterAnio] = useState('');
  const [solicitudes, setSolicitudes] = useState<SolicitudItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadSolicitudes = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ actorUserId: String(user.id) });
      if (filtroNombre.trim()) {
        params.set('nombreUsuario', filtroNombre.trim());
      }

      const response = await fetch(`${API_BASE_URL}/solicitudes/gestion?${params.toString()}`);
      if (!response.ok) {
        throw new Error('No se pudo cargar el listado de solicitudes.');
      }

      const data = (await response.json()) as SolicitudItem[];
      setSolicitudes(data);
      setSelectedIds((prev) => prev.filter((id) => data.some((item) => item.idSolicitud === id)));
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Error al cargar solicitudes';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filtroNombre, user?.id]);

  useEffect(() => {
    if (!isAdminOrRh) {
      navigate('/dashboard');
      return;
    }

    void loadSolicitudes();
  }, [isAdminOrRh, loadSolicitudes, navigate]);

  const filteredRequests = useMemo(() => {
    const dia = filterDia.trim() ? Number(filterDia) : null;
    const mes = filterMes.trim() ? Number(filterMes) : null;
    const anio = filterAnio.trim() ? Number(filterAnio) : null;

    return solicitudes.filter((item) => {
      const requestDate = parseDateInput(item.fechaSolicitud);
      if (!requestDate) {
        return true;
      }

      if (anio && requestDate.getFullYear() !== anio) {
        return false;
      }
      if (mes && requestDate.getMonth() + 1 !== mes) {
        return false;
      }
      if (dia && requestDate.getDate() !== dia) {
        return false;
      }

      return true;
    });
  }, [filterAnio, filterDia, filterMes, solicitudes]);

  const allSelected = useMemo(
    () => filteredRequests.length > 0 && filteredRequests.every((item) => selectedIds.includes(item.idSolicitud)),
    [filteredRequests, selectedIds],
  );

  const selectedTotal = selectedIds.length;

  const toggleSelection = (solicitudId: number) => {
    setSelectedIds((prev) =>
      prev.includes(solicitudId) ? prev.filter((id) => id !== solicitudId) : [...prev, solicitudId],
    );
  };

  const selectAll = () => {
    setSelectedIds(filteredRequests.map((item) => item.idSolicitud));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const applyStatus = async (estadoNombre: 'aprobado' | 'rechazado' | 'pendiente') => {
    if (!user?.id || selectedIds.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/solicitudes/gestion/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solicitudIds: selectedIds,
          actorUserId: user.id,
          estadoNombre,
        }),
      });

      if (!response.ok) {
        throw new Error('No fue posible actualizar el estado de las solicitudes.');
      }

      setSuccess(`Se actualizaron ${selectedIds.length} solicitudes a estado ${estadoNombre}.`);
      setSelectedIds([]);
      await loadSolicitudes();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Error al actualizar solicitudes';
      setError(message);
    } finally {
      setIsLoading(false);
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

      <main className="requests-main">
        <section className="requests-header-card">
          <h1>Gestion de Solicitudes</h1>
          <p>
            Recursos Humanos y Administrador pueden revisar, filtrar por usuario y actualizar multiples
            solicitudes con una sola accion.
          </p>
        </section>

        <section className="requests-date-filters">
          <div className="filter-field">
            <label htmlFor="requestDia">Dia</label>
            <input id="requestDia" type="number" min={1} max={31} value={filterDia} onChange={(event) => setFilterDia(event.target.value)} placeholder="Opcional" />
          </div>
          <div className="filter-field">
            <label htmlFor="requestMes">Mes</label>
            <input id="requestMes" type="number" min={1} max={12} value={filterMes} onChange={(event) => setFilterMes(event.target.value)} placeholder="Opcional" />
          </div>
          <div className="filter-field">
            <label htmlFor="requestAnio">Año</label>
            <input id="requestAnio" type="number" min={2000} max={2100} value={filterAnio} onChange={(event) => setFilterAnio(event.target.value)} placeholder="Opcional" />
          </div>
          <div className="filter-actions">
            <button type="button" onClick={() => { setFilterDia(''); setFilterMes(''); setFilterAnio(''); }}>
              Limpiar fechas
            </button>
          </div>
        </section>

        <section className="requests-toolbar-card">
          <div className="toolbar-search">
            <label htmlFor="searchUser">Buscar por nombre de usuario</label>
            <div className="search-controls">
              <input
                id="searchUser"
                type="text"
                value={filtroNombre}
                onChange={(event) => setFiltroNombre(event.target.value)}
                placeholder="Ej. Roberto"
              />
              <button type="button" onClick={() => void loadSolicitudes()} disabled={isLoading}>
                Buscar
              </button>
            </div>
          </div>

          <div className="toolbar-actions">
            <button type="button" onClick={allSelected ? clearSelection : selectAll} disabled={filteredRequests.length === 0}>
              {allSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
            </button>
            <button type="button" onClick={clearSelection} disabled={selectedTotal === 0}>
              Limpiar seleccion
            </button>
            <button type="button" className="accept" onClick={() => void applyStatus('aprobado')} disabled={selectedTotal === 0 || isLoading}>
              Aceptar
            </button>
            <button type="button" className="reject" onClick={() => void applyStatus('rechazado')} disabled={selectedTotal === 0 || isLoading}>
              Rechazar
            </button>
            <button type="button" className="pending" onClick={() => void applyStatus('pendiente')} disabled={selectedTotal === 0 || isLoading}>
              Pendiente
            </button>
          </div>

          <p className="toolbar-summary">Seleccionadas: {selectedTotal}</p>
        </section>

        {error && <div className="requests-message error">{error}</div>}
        {success && <div className="requests-message success">{success}</div>}

        <section className="requests-table-wrap">
          <table className="requests-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" checked={allSelected} onChange={() => (allSelected ? clearSelection() : selectAll())} />
                </th>
                <th>Usuario</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Motivo</th>
                <th>Fecha Solicitud</th>
              </tr>
            </thead>
            <tbody>
                {filteredRequests.map((item) => (
                <tr key={item.idSolicitud}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.idSolicitud)}
                      onChange={() => toggleSelection(item.idSolicitud)}
                    />
                  </td>
                  <td>{item.usuarioNombre}</td>
                  <td>{item.tipoNombre}</td>
                  <td>
                    <span className={`status-pill ${item.estadoNombre.toLowerCase()}`}>{item.estadoNombre}</span>
                  </td>
                  <td>{formatDate(item.fechaInicio)}</td>
                  <td>{formatDate(item.fechaFin)}</td>
                  <td>{item.motivo || '-'}</td>
                  <td>{formatDate(item.fechaSolicitud)}</td>
                </tr>
              ))}
              {filteredRequests.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={8} className="empty-row">
                    No hay solicitudes para el filtro actual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}
