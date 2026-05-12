import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import '../styles/MyRequests.css';

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
  respuestaRh?: string;
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

export default function MyRequests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<SolicitudItem[]>([]);
  const [filterDia, setFilterDia] = useState('');
  const [filterMes, setFilterMes] = useState('');
  const [filterAnio, setFilterAnio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalSolicitud, setModalSolicitud] = useState<SolicitudItem | null>(null);

  const loadMyRequests = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/solicitudes/usuario/${user.id}`);
      if (!response.ok) {
        throw new Error('No se pudieron cargar tus solicitudes.');
      }

      const data = (await response.json()) as SolicitudItem[];
      setSolicitudes(data);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Error al cargar solicitudes';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadMyRequests();
  }, [loadMyRequests]);

  const resumen = useMemo(() => {
    return solicitudes.reduce(
      (acc, item) => {
        const estado = (item.estadoNombre || '').toLowerCase();
        if (estado.includes('aprob')) {
          acc.aprobadas += 1;
        } else if (estado.includes('rechaz')) {
          acc.rechazadas += 1;
        } else {
          acc.pendientes += 1;
        }
        return acc;
      },
      { aprobadas: 0, rechazadas: 0, pendientes: 0 },
    );
  }, [solicitudes]);

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

  return (
    <>
      <Header
        onOpenMyRequestsClick={() => navigate('/mis-solicitudes')}
        onOpenRequestsClick={() => navigate('/solicitudes-gestion')}
        onOpenReportsClick={() => navigate('/reportes-solicitudes')}
      />

      <main className="my-requests-main">
        <section className="my-requests-header">
          <h1>Mis Solicitudes</h1>
          <p>Consulta el estatus actual de cada solicitud enviada a Recursos Humanos.</p>
        </section>

        <section className="my-requests-filters">
          <div className="filter-field">
            <label htmlFor="filterDia">Dia</label>
            <input id="filterDia" type="number" min={1} max={31} value={filterDia} onChange={(event) => setFilterDia(event.target.value)} placeholder="Opcional" />
          </div>
          <div className="filter-field">
            <label htmlFor="filterMes">Mes</label>
            <input id="filterMes" type="number" min={1} max={12} value={filterMes} onChange={(event) => setFilterMes(event.target.value)} placeholder="Opcional" />
          </div>
          <div className="filter-field">
            <label htmlFor="filterAnio">Año</label>
            <input id="filterAnio" type="number" min={2000} max={2100} value={filterAnio} onChange={(event) => setFilterAnio(event.target.value)} placeholder="Opcional" />
          </div>
          <div className="filter-actions">
            <button type="button" onClick={() => { setFilterDia(''); setFilterMes(''); setFilterAnio(''); }}>
              Limpiar filtros
            </button>
          </div>
        </section>

        <section className="my-requests-summary">
          <article>
            <h2>Pendientes</h2>
            <strong>{resumen.pendientes}</strong>
          </article>
          <article>
            <h2>Aprobadas</h2>
            <strong>{resumen.aprobadas}</strong>
          </article>
          <article>
            <h2>Rechazadas</h2>
            <strong>{resumen.rechazadas}</strong>
          </article>
        </section>

        {error && <div className="my-requests-message error">{error}</div>}

        <section className="my-requests-table-wrap">
          {isLoading ? (
            <p>Cargando solicitudes...</p>
          ) : (
            <table className="my-requests-table">
              <thead>
                <tr>
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
                  <tr key={item.idSolicitud} onClick={() => { setModalSolicitud(item); setShowModal(true); }} style={{ cursor: 'pointer' }}>
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
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty-row">
                      Aun no tienes solicitudes registradas para este filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          {!isLoading && filteredRequests.length !== solicitudes.length && (
            <p className="my-requests-filter-note">Mostrando {filteredRequests.length} de {solicitudes.length} solicitudes.</p>
          )}
        </section>
      </main>
      {showModal && modalSolicitud && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <section className='modal-card-section'>
                <h3>Solicitud </h3>
              <section className='modal-info'>

                <p><strong>Tipo:</strong> {modalSolicitud.tipoNombre}</p>
                <p><strong>Estado:</strong> {modalSolicitud.estadoNombre}</p>
                <p><strong>Fecha inicio:</strong> {formatDate(modalSolicitud.fechaInicio)}</p>
                <p><strong>Fecha fin:</strong> {formatDate(modalSolicitud.fechaFin)}</p>
                <p><strong>Motivo del colaborador:</strong> {modalSolicitud.motivo || '-'}</p>
              </section>
              <hr />
              <section className='modal-info-bottom'>
                <h4>Respuesta de Recursos Humanos:</h4>
                <div className="modal-response">
                  {modalSolicitud.respuestaRh && modalSolicitud.respuestaRh.trim() !== '' ? (
                    <p>{modalSolicitud.respuestaRh}</p>
                  ) : (
                    <p className="pending-text">Pendiente</p>
                  )}
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => { setShowModal(false); setModalSolicitud(null); }}>Cerrar</button>
                </div>
              </section>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
