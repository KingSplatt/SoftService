import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import '../styles/RequestsReports.css';

interface ReporteResumen {
  total: number;
  aprobadas: number;
  rechazadas: number;
  pendientes: number;
}

const API_BASE_URL = 'http://localhost:8080/api';

function currentYear(): number {
  return new Date().getFullYear();
}

export default function RequestsReports() {
  const navigate = useNavigate();
  const { user, isAdminOrRh } = useAuth();
  const [dia, setDia] = useState<string>('');
  const [mes, setMes] = useState<string>('');
  const [anio, setAnio] = useState<string>(String(currentYear()));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reporte, setReporte] = useState<ReporteResumen>({ total: 0, aprobadas: 0, rechazadas: 0, pendientes: 0 });

  const loadReporte = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ actorUserId: String(user.id) });
      if (anio.trim()) {
        params.set('anio', anio.trim());
      }
      if (mes.trim()) {
        params.set('mes', mes.trim());
      }
      if (dia.trim()) {
        params.set('dia', dia.trim());
      }

      const response = await fetch(`${API_BASE_URL}/solicitudes/reportes?${params.toString()}`);
      if (!response.ok) {
        throw new Error('No se pudo obtener el reporte de solicitudes.');
      }

      const data = (await response.json()) as ReporteResumen;
      setReporte(data);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Error al cargar reporte';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [anio, dia, mes, user?.id]);

  useEffect(() => {
    if (!isAdminOrRh) {
      navigate('/dashboard');
      return;
    }

    void loadReporte();
  }, [isAdminOrRh, loadReporte, navigate]);

  const chartRows = useMemo(() => {
    const max = Math.max(reporte.aprobadas, reporte.rechazadas, reporte.pendientes, 1);

    return [
      { key: 'aprobadas', label: 'Aprobadas', value: reporte.aprobadas, className: 'approved', width: `${Math.round((reporte.aprobadas / max) * 100)}%` },
      { key: 'rechazadas', label: 'Rechazadas', value: reporte.rechazadas, className: 'rejected', width: `${Math.round((reporte.rechazadas / max) * 100)}%` },
      { key: 'pendientes', label: 'Pendientes', value: reporte.pendientes, className: 'pending', width: `${Math.round((reporte.pendientes / max) * 100)}%` },
    ];
  }, [reporte.aprobadas, reporte.pendientes, reporte.rechazadas]);

  return (
    <>
      <Header
        onManageRolesClick={() => navigate('/gestion-roles')}
        onOpenMyRequestsClick={() => navigate('/mis-solicitudes')}
        onOpenRequestsClick={() => navigate('/solicitudes-gestion')}
        onOpenReportsClick={() => navigate('/reportes-solicitudes')}
      />

      <main className="reports-main">
        <section className="reports-intro">
          <h1>Reportes de Solicitudes</h1>
          <p>Visualiza solicitudes aprobadas, rechazadas y pendientes filtrando por dia, mes y año.</p>
        </section>

        <section className="reports-filters">
          <div className="filter-field">
            <label htmlFor="anio">Año</label>
            <input id="anio" type="number" min={2000} max={2100} value={anio} onChange={(event) => setAnio(event.target.value)} />
          </div>
          <div className="filter-field">
            <label htmlFor="mes">Mes</label>
            <input id="mes" type="number" min={1} max={12} value={mes} onChange={(event) => setMes(event.target.value)} placeholder="Opcional" />
          </div>
          <div className="filter-field">
            <label htmlFor="dia">Día</label>
            <input id="dia" type="number" min={1} max={31} value={dia} onChange={(event) => setDia(event.target.value)} placeholder="Opcional" />
          </div>
          <div className="filter-actions">
            <button type="button" onClick={() => void loadReporte()} disabled={isLoading}>
              Aplicar filtros
            </button>
            <button
              type="button"
              onClick={() => {
                setDia('');
                setMes('');
                setAnio(String(currentYear()));
              }}
            >
              Limpiar
            </button>
          </div>
        </section>

        {error && <div className="reports-message error">{error}</div>}

        <section className="reports-cards">
          <article>
            <h2>Total</h2>
            <strong>{reporte.total}</strong>
          </article>
          <article>
            <h2>Aprobadas</h2>
            <strong>{reporte.aprobadas}</strong>
          </article>
          <article>
            <h2>Rechazadas</h2>
            <strong>{reporte.rechazadas}</strong>
          </article>
          <article>
            <h2>Pendientes</h2>
            <strong>{reporte.pendientes}</strong>
          </article>
        </section>

        <section className="reports-chart-card">
          <h2>Grafica por estado</h2>
          <div className="bar-chart">
            {chartRows.map((row) => (
              <div key={row.key} className="chart-row">
                <span className="row-label">{row.label}</span>
                <div className="row-bar-base">
                  <div className={`row-bar ${row.className}`} style={{ width: row.width }}></div>
                </div>
                <span className="row-value">{row.value}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
