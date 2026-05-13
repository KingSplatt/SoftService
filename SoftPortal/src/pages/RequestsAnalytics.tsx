import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import '../styles/RequestsAnalytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface EstadisticasMesilDto {
  year: number;
  month: number;
  cantidad: number;
  monthName: string;
}

interface PrediccionSolicitudesDto {
  historicoUltimos12Meses: EstadisticasMesilDto[];
  prediccionProximos3Meses: EstadisticasMesilDto[];
  promedioMensual: number;
  tendencia: string;
}

const API_BASE_URL = 'http://localhost:8080/api';

export default function RequestsAnalytics() {
  const navigate = useNavigate();
  const { user, isAdminOrRh } = useAuth();
  const [diaFiltro, setDiaFiltro] = useState<string>('');
  const [mesFiltro, setMesFiltro] = useState<string>('');
  const [anioFiltro, setAnioFiltro] = useState<string>(String(new Date().getFullYear()));
  const [isLoadingReporte, setIsLoadingReporte] = useState(false);
  const [estadisticas, setEstadisticas] = useState<EstadisticasMesilDto[]>([]);
  const [prediccion, setPrediccion] = useState<PrediccionSolicitudesDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumenReporte, setResumenReporte] = useState<{aprobadas?: number; pendientes?: number; rechazadas?: number} | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'aprobado' | 'pendiente' | 'rechazado'>('all');
  const [dailyLabels, setDailyLabels] = useState<string[]>([]);
  const [dailyData, setDailyData] = useState<number[]>([]);
  const [viewingDaily, setViewingDaily] = useState(false);

  const normalizeEstadoStr = (s?: string) => (s || '').toString().trim().toLowerCase();

  const fetchAndAggregateDaily = async (status: 'all' | 'aprobado' | 'pendiente' | 'rechazado') => {
    if (!user) return;
    setIsLoadingReporte(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/solicitudes`);
      if (!resp.ok) return;
      const list = await resp.json();

      let start: Date;
      let end: Date;
      if (anioFiltro && mesFiltro) {
        const y = parseInt(anioFiltro, 10);
        const m = parseInt(mesFiltro, 10);
        start = new Date(y, m - 1, 1);
        end = new Date(y, m, 0);
      } else {
        end = new Date();
        start = new Date();
        start.setDate(end.getDate() - 29);
      }

      const counts: Record<string, number> = {};
      const keys: string[] = [];
      const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      while (cur <= end) {
        const key = cur.toISOString().slice(0, 10);
        counts[key] = 0;
        keys.push(key);
        cur.setDate(cur.getDate() + 1);
      }

      list.forEach((s: any) => {
        const estadoNorm = normalizeEstadoStr(s.estadoNombre);
        if (status !== 'all' && estadoNorm !== status) return;
        if (!s.fechaSolicitud) return;
        const d = new Date(s.fechaSolicitud);
        const key = d.toISOString().slice(0, 10);
        if (key in counts) counts[key] = (counts[key] || 0) + 1;
      });

      const finalLabels = keys.map(k => {
        const d = new Date(k + 'T00:00:00');
        return `${d.getDate()} ${d.toLocaleString(undefined, { month: 'short' })}`;
      });
      const finalData = keys.map(k => counts[k] || 0);

      setDailyLabels(finalLabels);
      setDailyData(finalData);
      setViewingDaily(true);
    } catch (e) {
      console.warn('Error agregando datos diarios', e);
    } finally {
      setIsLoadingReporte(false);
    }
  };

  const handleReportClick = (status: 'all' | 'aprobado' | 'pendiente' | 'rechazado') => {
    setSelectedStatus(status);
    void fetchAndAggregateDaily(status);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [estadisticasRes, prediccionRes] = await Promise.all([
        fetch(`${API_BASE_URL}/solicitudes/estadisticas/por-mes`),
        fetch(`${API_BASE_URL}/solicitudes/estadisticas/prediccion`),
      ]);

      if (!estadisticasRes.ok || !prediccionRes.ok) {
        throw new Error('Error al cargar datos');
      }

      const estadisticasData = await estadisticasRes.json();
      const prediccionData = await prediccionRes.json();

      setEstadisticas(estadisticasData);
      setPrediccion(prediccionData);
      setViewingDaily(false);

      // Si es Admin/RH, obtener resumen de reportes para mostrar barra de estados
      if (isAdminOrRh && user) {
        try {
          const q = new URLSearchParams({ actorUserId: String(user.id) });
          const resumenRes = await fetch(`${API_BASE_URL}/solicitudes/reportes?${q.toString()}`);
          if (resumenRes.ok) {
            const resumenJson = await resumenRes.json();
            setResumenReporte(resumenJson);
          }
        } catch (e) {
          // no bloquear la carga principal por error en el resumen
          console.warn('No se pudo cargar resumen de reportes', e);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };
  

  const getTendenciaColor = (tendencia: string): string => {
    const normalized = (tendencia || '').toString().trim().toUpperCase();
    switch (normalized) {
      case 'CRECIMIENTO':
        return '#ef4444'; // rojo
      case 'DECRECIMIENTO':
        return '#10b981'; // verde
      case 'ESTABLE':
        return '#3b82f6'; // azul
      default:
        return '#3b82f6'; // azul (default)
    }
  };

  const getTendenciaLabel = (tendencia: string): string => {
    const normalized = (tendencia || '').toString().trim().toUpperCase();
    switch (normalized) {
      case 'CRECIMIENTO':
        return '📈 CRECIMIENTO';
      case 'DECRECIMIENTO':
        return '📉 DECRECIMIENTO';
      case 'ESTABLE':
        return '➡️ ESTABLE';
      default:
        return '➡️ ESTABLE';
    }
  };

  if (isLoading) {
    return (
      <div className="analytics-container">
        <Header />
        <div className="loading">Cargando datos...</div>
      </div>
    );
  }

  const loadReporte = async (useFilters = true) => {
    if (!user) return;
    setIsLoadingReporte(true);
    try {
      const params = new URLSearchParams({ actorUserId: String(user.id) });
      if (useFilters) {
        if (anioFiltro && anioFiltro.trim()) params.set('anio', anioFiltro.trim());
        if (mesFiltro && mesFiltro.trim()) params.set('mes', mesFiltro.trim());
        if (diaFiltro && diaFiltro.trim()) params.set('dia', diaFiltro.trim());
      }
      const resp = await fetch(`${API_BASE_URL}/solicitudes/reportes?${params.toString()}`);
      if (resp.ok) {
        const json = await resp.json();
        setResumenReporte(json);
      }
    } catch (e) {
      console.warn('Error cargando reporte filtrado', e);
    } finally {
      setIsLoadingReporte(false);
    }
  };

  const chartLabels = estadisticas.map(
    (e) => `${e.monthName} ${e.year}`
  );
  const historicoData = estadisticas.map((e) => e.cantidad);
  const prediccionData =
    prediccion?.prediccionProximos3Meses.map((p) => p.cantidad) || [];
  const prediccionLabels =
    prediccion?.prediccionProximos3Meses.map(
      (p) => `${p.monthName} ${p.year}`
    ) || [];

  const allLabels = [...chartLabels, ...prediccionLabels];
  const allHistoricoData = [
    ...historicoData,
    ...Array(prediccionLabels.length).fill(null),
  ];
  const allPrediccionData = [
    ...Array(chartLabels.length).fill(null),
    ...prediccionData,
  ];

  const chartData = {
    labels: allLabels,
    datasets: [
      {
        label: 'Solicitudes Reales',
        data: allHistoricoData,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Predicción',
        data: allPrediccionData,
        borderColor: '#f59e0b',
        borderDash: [5, 5],
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const dailyChartData = {
    labels: dailyLabels,
    datasets: [
      {
        label: 'Solicitudes (por día)',
        data: dailyData,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.2,
        fill: true,
        pointRadius: 4,
      },
    ],
  };

  const displayChartData = viewingDaily ? dailyChartData : chartData;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Análisis de Solicitudes de Permiso',
        font: {
          size: 18,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="analytics-container">
      <Header />
      <div className="analytics-content">
        <h1>Análisis de Solicitudes</h1>

        {isAdminOrRh && (
          <div className="report-bar-container">
            <div className="report-bar">
              <button className={`report-item completed ${selectedStatus === 'all' ? 'active' : ''}`} onClick={() => handleReportClick('all')}>
                Todas: {resumenReporte?.aprobadas != null || resumenReporte?.pendientes != null || resumenReporte?.rechazadas != null ? ((resumenReporte?.aprobadas ?? 0) + (resumenReporte?.pendientes ?? 0) + (resumenReporte?.rechazadas ?? 0)) : 0}
              </button>
              <button className={`report-item completed ${selectedStatus === 'aprobado' ? 'active' : ''}`} onClick={() => handleReportClick('aprobado')}>
                Completadas: {resumenReporte?.aprobadas ?? 0}
              </button>
              <button className={`report-item pending ${selectedStatus === 'pendiente' ? 'active' : ''}`} onClick={() => handleReportClick('pendiente')}>
                Pendientes: {resumenReporte?.pendientes ?? 0}
              </button>
              <button className={`report-item rejected ${selectedStatus === 'rechazado' ? 'active' : ''}`} onClick={() => handleReportClick('rechazado')}>
                Rechazadas: {resumenReporte?.rechazadas ?? 0}
              </button>
            </div>

            <div className="reports-filters-analytics report-bar-filters">
              <div className="filter-field">
                <label htmlFor="anio">Año</label>
                <input id="anio" type="number" min={2000} max={2100} value={anioFiltro} onChange={(e) => setAnioFiltro(e.target.value)} />
              </div>
              <div className="filter-field">
                <label htmlFor="mes">Mes</label>
                <input id="mes" type="number" min={1} max={12} value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)} placeholder="Opcional" />
              </div>
              <div className="filter-field">
                <label htmlFor="dia">Día</label>
                <input id="dia" type="number" min={1} max={31} value={diaFiltro} onChange={(e) => setDiaFiltro(e.target.value)} placeholder="Opcional" />
              </div>
              <div className="filter-actions">
                <button type="button" onClick={() => void loadReporte(true)} disabled={isLoadingReporte}>
                  {isLoadingReporte ? 'Cargando...' : 'Aplicar filtros'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDiaFiltro('');
                    setMesFiltro('');
                    setAnioFiltro(String(new Date().getFullYear()));
                    void loadReporte(false);
                  }}
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="analytics-grid">
          <div className="card stats-card">
            <h3>Estadísticas Generales</h3>
            {prediccion && (
              <>
                <div className="stat-item">
                  <span className="label">Promedio Mensual:</span>
                  <span className="value">
                    {Math.round(prediccion.promedioMensual)} solicitudes
                  </span>
                </div>
                <div className="stat-item">
                  <span className="label">Total Últimos 12 Meses:</span>
                  <span className="value">
                    {prediccion.historicoUltimos12Meses.reduce(
                      (sum, e) => sum + e.cantidad,
                      0
                    )}{' '}
                    solicitudes
                  </span>
                </div>
                <div className="stat-item">
                  <span className="label">Tendencia Actual:</span>
                  <span
                    className="value trend"
                    style={{
                      color: getTendenciaColor(prediccion.tendencia),
                    }}
                  >
                    {getTendenciaLabel(prediccion.tendencia)}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="card chart-card">
            <h3>Gráfica de Solicitudes</h3>
              <Line data={displayChartData} options={chartOptions} />
          </div>

          <div className="card prediction-card">
            <h3>Predicción Próximos 3 Meses</h3>
            {prediccion && (
              <div className="prediction-list">
                {prediccion.prediccionProximos3Meses.map((p, idx) => (
                  <div key={idx} className="prediction-item">
                    <span className="month-name">
                      {p.monthName} {p.year}
                    </span>
                    <span className="quantity">{p.cantidad}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card historical-card">
            <h3>Últimos 6 Meses</h3>
            {estadisticas.length > 0 && (
              <div className="historical-list">
                {estadisticas
                  .slice(-6)
                  .reverse()
                  .map((e, idx) => (
                    <div key={idx} className="historical-item">
                      <span className="month-name">
                        {e.monthName} {e.year}
                      </span>
                      <div className="bar-chart">
                        <div
                          className="bar"
                          style={{
                            width: `${(e.cantidad / Math.max(...estadisticas.map((s) => s.cantidad), 1)) * 100}%`,
                          }}
                        >
                          {e.cantidad}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <button className="btn-refresh" onClick={loadData} disabled={isLoading}>
          {isLoading ? 'Actualizando...' : 'Actualizar Datos'}
        </button>
      </div>
    </div>
  );
}
