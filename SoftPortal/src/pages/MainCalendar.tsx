import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import '../styles/MainCalendar.css';

interface UsuarioItem {
  idUsuario: number;
  nombreUsuario: string;
  email: string;
  idRol: number;
  rolNombre: string;
  diasDisponibles?: number;
  fechaCreacion?: string;
}

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

interface TipoPermisoItem {
  idTipo: number;
  nombre: string;
}

interface CalendarDay {
  date: Date;
  iso: string;
  inCurrentMonth: boolean;
}

const API_BASE_URL = 'http://localhost:8080/api';
const FALLBACK_PERMISO_TYPES: TipoPermisoItem[] = [
  { idTipo: 1, nombre: 'Vacaciones' },
  { idTipo: 2, nombre: 'Incapacidad' },
  { idTipo: 3, nombre: 'Movilidad / Viaticos' },
  { idTipo: 4, nombre: 'Otro' },
];

const MONTH_FORMATTER = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' });

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseLocalDate(dateIso: string): Date {
  const [year, month, day] = dateIso.split('-').map(Number);
  if (!year || !month || !day) {
    return new Date(dateIso);
  }

  return new Date(year, month - 1, day);
}

function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

function getDaysBetween(startIso: string, endIso: string): string[] {
  const result: string[] = [];
  const start = stripTime(parseLocalDate(startIso));
  const end = stripTime(parseLocalDate(endIso));

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return result;
  }

  const cursor = new Date(start);
  while (cursor <= end) {
    result.push(toIsoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

function getServiceYearInfo(fechaCreacion?: string, referenceDate = new Date()) {
  if (!fechaCreacion) {
    return {
      serviceYear: 1,
      cycleStart: null as Date | null,
      cycleEnd: null as Date | null,
      entitlementDays: 12,
    };
  }

  const createdAt = new Date(fechaCreacion);
  if (Number.isNaN(createdAt.getTime())) {
    return {
      serviceYear: 1,
      cycleStart: null as Date | null,
      cycleEnd: null as Date | null,
      entitlementDays: 12,
    };
  }

  const today = stripTime(referenceDate);
  const anniversaryThisYear = new Date(today.getFullYear(), createdAt.getMonth(), createdAt.getDate());
  const hasHadAnniversary = today >= anniversaryThisYear;
  const serviceYear = hasHadAnniversary ? today.getFullYear() - createdAt.getFullYear() + 1 : today.getFullYear() - createdAt.getFullYear();
  const normalizedServiceYear = Math.max(1, serviceYear);
  const cycleStart = hasHadAnniversary ? anniversaryThisYear : addYears(anniversaryThisYear, -1);
  const cycleEnd = addYears(cycleStart, 1);

  return {
    serviceYear: normalizedServiceYear,
    cycleStart,
    cycleEnd,
    entitlementDays: 12 + (normalizedServiceYear - 1) * 2,
  };
}

function countDaysWithinRange(startIso: string, endIso: string, rangeStart: Date | null, rangeEnd: Date | null): number {
  if (!rangeStart || !rangeEnd) {
    return getDaysBetween(startIso, endIso).length;
  }

  const start = stripTime(parseLocalDate(startIso));
  const end = stripTime(parseLocalDate(endIso));
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const effectiveStart = start > rangeStart ? start : rangeStart;
  const effectiveEnd = end < rangeEnd ? end : rangeEnd;

  if (effectiveStart > effectiveEnd) {
    return 0;
  }

  return getDaysBetween(toIsoDate(effectiveStart), toIsoDate(effectiveEnd)).length;
}

function getCalendarDays(baseDate: Date): CalendarDay[] {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const firstWeekDay = (firstDayOfMonth.getDay() + 6) % 7;

  const days: CalendarDay[] = [];
  const gridStartDate = new Date(year, month, 1 - firstWeekDay);

  for (let index = 0; index < 42; index += 1) {
    const cellDate = new Date(gridStartDate);
    cellDate.setDate(gridStartDate.getDate() + index);
    days.push({
      date: cellDate,
      iso: toIsoDate(cellDate),
      inCurrentMonth: cellDate.getMonth() === month,
    });
  }

  return days;
}

function getRoleDescription(roleName: string): string {
  const role = roleName.toLowerCase();

  if (role.includes('admin')) {
    return 'Gestiona permisos, usuarios y validaciones criticas del portal.';
  }

  if (role.includes('rh') || role.includes('rrhh') || role.includes('human')) {
    return 'Da seguimiento al bienestar del personal y a las politicas internas.';
  }

  if (role.includes('lider') || role.includes('manager')) {
    return 'Coordina al equipo y mantiene la cobertura operativa del area.';
  }

  return 'Contribuye en operaciones y proyectos del area asignada.';
}

export default function MainCalendar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [usuariosCatalogo, setUsuariosCatalogo] = useState<UsuarioItem[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudItem[]>([]);
  const [tiposPermiso, setTiposPermiso] = useState<TipoPermisoItem[]>(FALLBACK_PERMISO_TYPES);
  const [employeeProfile, setEmployeeProfile] = useState<UsuarioItem | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<number>(1);
  const [motivo, setMotivo] = useState('');
  const [activeInfoModal, setActiveInfoModal] = useState<string | null>(null);

  const userByIdMap = useMemo(() => {
    const map = new Map<number, UsuarioItem>();
    usuariosCatalogo.forEach((item) => map.set(item.idUsuario, item));
    return map;
  }, [usuariosCatalogo]);

  const today = useMemo(() => stripTime(new Date()), []);

  const contractInfo = useMemo(
    () => getServiceYearInfo(employeeProfile?.fechaCreacion),
    [employeeProfile?.fechaCreacion],
  );

  const contractDays = employeeProfile?.fechaCreacion
    ? contractInfo.entitlementDays
    : employeeProfile?.diasDisponibles && employeeProfile.diasDisponibles > 0
      ? employeeProfile.diasDisponibles
      : 12;

  const occupiedDaysByArea = useMemo(() => {
    if (!user || !employeeProfile) {
      return new Set<string>();
    }

    const currentRoleId = employeeProfile.idRol;
    const occupied = new Set<string>();

    solicitudes.forEach((solicitud) => {
      if (solicitud.usuarioId === user.id) {
        return;
      }

      const solicitudUsuario = userByIdMap.get(solicitud.usuarioId);
      if (!solicitudUsuario || solicitudUsuario.idRol !== currentRoleId) {
        return;
      }

      const normalizedStatus = (solicitud.estadoNombre || '').trim().toLowerCase();
      if (normalizedStatus.includes('rechaz')) {
        return;
      }

      getDaysBetween(solicitud.fechaInicio, solicitud.fechaFin).forEach((day) => occupied.add(day));
    });

    return occupied;
  }, [employeeProfile, solicitudes, user, userByIdMap]);

  const myRequestStatusByDay = useMemo(() => {
    if (!user) {
      return new Map<string, 'pendiente' | 'aprobado' | 'rechazado'>();
    }

    const statusRank: Record<'pendiente' | 'aprobado' | 'rechazado', number> = {
      pendiente: 3,
      aprobado: 2,
      rechazado: 1,
    };

    const map = new Map<string, 'pendiente' | 'aprobado' | 'rechazado'>();
    solicitudes
      .filter((solicitud) => solicitud.usuarioId === user.id)
      .forEach((solicitud) => {
        const normalized = (solicitud.estadoNombre || '').trim().toLowerCase();
        const status: 'pendiente' | 'aprobado' | 'rechazado' =
          normalized.includes('aprob')
            ? 'aprobado'
            : normalized.includes('rechaz')
              ? 'rechazado'
              : 'pendiente';

        getDaysBetween(solicitud.fechaInicio, solicitud.fechaFin).forEach((day) => {
          const current = map.get(day);
          if (!current || statusRank[status] > statusRank[current]) {
            map.set(day, status);
          }
        });
      });

    return map;
  }, [solicitudes, user]);

  const spentDaysThisCycle = useMemo(() => {
    if (!user) {
      return 0;
    }

    return solicitudes
      .filter((solicitud) => solicitud.usuarioId === user.id)
      .reduce((total, solicitud) => {
        return total + countDaysWithinRange(solicitud.fechaInicio, solicitud.fechaFin, contractInfo.cycleStart, contractInfo.cycleEnd);
      }, 0);
  }, [contractInfo.cycleEnd, contractInfo.cycleStart, solicitudes, user]);

  const selectedDaysCount = selectedDates.length;

  const remainingDays = Math.max(0, contractDays - spentDaysThisCycle - selectedDaysCount);

  const calendarDays = useMemo(() => getCalendarDays(viewDate), [viewDate]);

  const monthLabel = useMemo(() => {
    const label = MONTH_FORMATTER.format(viewDate);
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [viewDate]);

  const roleName = employeeProfile?.rolNombre || user?.rol_nombre || 'Colaborador';

  const roleDescription = useMemo(() => getRoleDescription(roleName), [roleName]);

  const selectedTypeName =
    tiposPermiso.find((tipo) => tipo.idTipo === selectedTypeId)?.nombre || 'Solicitud';

  const infoCards = useMemo(
    () => [
      {
        id: 'vacaciones',
        title: 'Vacaciones',
        detail: `Te quedan ${remainingDays} dias disponibles este ciclo. Ya consumiste ${spentDaysThisCycle} y hay ${selectedDaysCount} en seleccion pendiente.`,
      },
      {
        id: 'incapacidad',
        title: 'Incapacidad',
        detail: `Registra incapacidades medicas con evidencia y fechas exactas. Disponibilidad actual: ${remainingDays} dias.`,
      },
      {
        id: 'movilidad',
        title: 'Movilidad / Viaticos',
        detail: `Solicita movilidad por trabajo externo o gastos autorizados. Disponibilidad actual: ${remainingDays} dias.`,
      },
      {
        id: 'actualizar',
        title: 'Actualizar informacion',
        detail: `Mantiene tu perfil al dia para una gestion correcta de permisos. Este ciclo corresponde al ${contractInfo.serviceYear}º año de servicio.`,
      },
    ],
    [contractInfo.serviceYear, remainingDays, selectedDaysCount, spentDaysThisCycle],
  );

  const activeCard = infoCards.find((card) => card.id === activeInfoModal);

  const loadDashboardData = useCallback(async () => {
    if (!user) {
      return;
    }

    setIsDashboardLoading(true);
    setDashboardError(null);

    try {
      const [profileResponse, solicitudesResponse, tiposResponse, usersResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/usuarios/${user.id}`),
        fetch(`${API_BASE_URL}/solicitudes`),
        fetch(`${API_BASE_URL}/tipos-permiso`),
        fetch(`${API_BASE_URL}/usuarios`),
      ]);

      if (!profileResponse.ok || !solicitudesResponse.ok || !usersResponse.ok) {
        throw new Error('No se pudo cargar la informacion del panel de permisos.');
      }

      const profileData = (await profileResponse.json()) as UsuarioItem;
      const solicitudesData = (await solicitudesResponse.json()) as SolicitudItem[];
      const usersData = (await usersResponse.json()) as UsuarioItem[];

      setEmployeeProfile(profileData);
      setSolicitudes(solicitudesData);
      setUsuariosCatalogo(usersData);

      if (tiposResponse.ok) {
        const tiposData = (await tiposResponse.json()) as TipoPermisoItem[];
        if (tiposData.length > 0) {
          setTiposPermiso(tiposData);
          setSelectedTypeId((current) => (tiposData.some((item) => item.idTipo === current) ? current : tiposData[0].idTipo));
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar el dashboard';
      setDashboardError(message);
    } finally {
      setIsDashboardLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const toggleDate = (dateIso: string, inCurrentMonth: boolean, isPast: boolean) => {
    const myStatus = myRequestStatusByDay.get(dateIso);
    const hasBlockingStatus = myStatus === 'pendiente' || myStatus === 'aprobado';

    if (!inCurrentMonth || isPast || occupiedDaysByArea.has(dateIso) || hasBlockingStatus) {
      return;
    }

    setSubmitSuccess(null);
    setSubmitError(null);

    setSelectedDates((previous) => {
      if (previous.includes(dateIso)) {
        return previous.filter((item) => item !== dateIso);
      }

      if (remainingDays <= 0) {
        setSubmitError('No tienes dias disponibles para seleccionar en este ciclo.');
        return previous;
      }

      if (previous.length >= remainingDays) {
        setSubmitError(`Solo puedes preseleccionar hasta ${remainingDays} dias con tu saldo actual.`);
        return previous;
      }

      return [...previous, dateIso].sort((a, b) => a.localeCompare(b));
    });
  };

  const submitSolicitud = async () => {
    if (!user || selectedDates.length === 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      await Promise.all(
        selectedDates.map((dateIso) =>
          fetch(`${API_BASE_URL}/solicitudes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              usuarioId: user.id,
              tipoId: selectedTypeId,
              estadoId: 1,
              fechaInicio: dateIso,
              fechaFin: dateIso,
              motivo: motivo.trim() || `Solicitud de ${selectedTypeName}`,
            }),
          }).then((response) => {
            if (!response.ok) {
              throw new Error('No se pudo registrar la solicitud.');
            }
            return response;
          }),
        ),
      );

      setSubmitSuccess('Solicitud enviada y registrada como pendiente de aprobacion por RH.');
      setSelectedDates([]);
      setMotivo('');
      setShowRequestModal(false);
      await loadDashboardData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar la solicitud.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDateLabels = useMemo(
    () =>
      selectedDates.map((dateIso) =>
        new Intl.DateTimeFormat('es-MX', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(parseLocalDate(dateIso)),
      ),
    [selectedDates],
  );

  const calendarLegend = useMemo(
    () => [
      { key: 'selected', label: 'Seleccionado', className: 'selected' },
      { key: 'occupied', label: 'Ocupado area', className: 'occupied' },
      { key: 'pending', label: 'Mi solicitud pendiente', className: 'mine-pending' },
      { key: 'approved', label: 'Mi solicitud aprobada', className: 'mine-approved' },
      { key: 'rejected', label: 'Mi solicitud rechazada', className: 'mine-rejected' },
    ],
    [],
  );

  return (
    <>
      <Header
        onManageRolesClick={() => navigate('/gestion-roles')}
        onOpenMyRequestsClick={() => navigate('/mis-solicitudes')}
        onOpenRequestsClick={() => navigate('/solicitudes-gestion')}
        onOpenReportsClick={() => navigate('/reportes-solicitudes')}
      />

      <main className="dashboard-main">
        <section className="planner-layout">
          <article className="calendar-panel">
            <header className="planner-head">
              <p className="planner-kicker">Planeacion de ausencias</p>
              <h1>{monthLabel}</h1>
              <p>
                Selecciona los dias que deseas solicitar. El sistema bloquea automaticamente los dias ya
                ocupados por colaboradores de tu misma area.
              </p>
            </header>

            <div className="calendar-toolbar">
              <button
                type="button"
                onClick={() => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              >
                Mes anterior
              </button>
              <button type="button" onClick={() => setViewDate(new Date())}>
                Hoy
              </button>
              <button
                type="button"
                onClick={() => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              >
                Mes siguiente
              </button>
            </div>

            {dashboardError && <div className="panel-error">{dashboardError}</div>}

            <div className="calendar-grid-wrap">
              <div className="weekday-row">
                {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="days-grid">
                {calendarDays.map((dayCell) => {
                  const isPast = dayCell.date < today;
                  const isSelected = selectedDates.includes(dayCell.iso);
                  const isOccupied = occupiedDaysByArea.has(dayCell.iso);
                  const myStatus = myRequestStatusByDay.get(dayCell.iso);
                  const isToday = dayCell.iso === toIsoDate(today);
                  const isMineBlocking = myStatus === 'pendiente' || myStatus === 'aprobado';

                  return (
                    <button
                      key={dayCell.iso}
                      type="button"
                      className={[
                        'day-cell',
                        dayCell.inCurrentMonth ? '' : 'outside',
                        isToday ? 'today' : '',
                        isSelected ? 'selected' : '',
                        isOccupied ? 'occupied' : '',
                        myStatus ? `mine-${myStatus}` : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => toggleDate(dayCell.iso, dayCell.inCurrentMonth, isPast)}
                      disabled={!dayCell.inCurrentMonth || isPast || isOccupied || isMineBlocking}
                      title={
                        myStatus === 'aprobado'
                          ? 'Tienes una solicitud aprobada en este dia'
                          : myStatus === 'pendiente'
                            ? 'Tienes una solicitud pendiente en este dia'
                            : myStatus === 'rechazado'
                              ? 'Solicitud rechazada anteriormente, puedes volver a solicitar'
                          : isOccupied
                            ? 'Dia ocupado por el area'
                            : `Seleccionar ${dayCell.iso}`
                      }
                    >
                      {dayCell.date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="calendar-legend">
              {calendarLegend.map((item) => (
                <span key={item.key}>
                  <i className={`dot ${item.className}`}></i> {item.label}
                </span>
              ))}
            </div>

            <div className="selection-summary">
              <p>
                Dias seleccionados: <strong>{selectedDaysCount}</strong>
              </p>
              <p>
                Dias disponibles ahora: <strong>{remainingDays}</strong> / {contractDays}
              </p>
              {selectedDateLabels.length > 0 && (
                <div className="chips-list">
                  {selectedDateLabels.map((label) => (
                    <span key={label} className="date-chip">
                      {label}
                    </span>
                  ))}
                </div>
              )}
              <button
                type="button"
                className="request-btn"
                disabled={selectedDates.length === 0}
                onClick={() => setShowRequestModal(true)}
              >
                Continuar con solicitud
              </button>
              <button type="button" className="request-btn secondary" onClick={() => navigate('/mis-solicitudes')}>
                Ver mis solicitudes y estatus
              </button>
              {submitError && <p className="inline-error">{submitError}</p>}
              {submitSuccess && <p className="inline-success">{submitSuccess}</p>}
              {isDashboardLoading && <p className="loading-text">Actualizando informacion...</p>}
            </div>
          </article>

          <aside className="employee-panel">
            <div className="employee-card">
              <h2>Informacion del empleado</h2>
              <div className="employee-field">
                <span>Rol</span>
                <strong>{roleName}</strong>
                <p>{roleDescription}</p>
              </div>
              <div className="employee-field">
                <span>Nombre</span>
                <strong>{employeeProfile?.nombreUsuario || user?.nombre_usuario || 'Sin nombre'}</strong>
              </div>
              <div className="employee-field">
                <span>Dias de vacaciones disponibles</span>
                <strong>{remainingDays} dias</strong>
              </div>
              <div className="employee-field">
                <span>Dias usados en el ciclo actual</span>
                <strong>{spentDaysThisCycle} dias</strong>
              </div>
              <div className="employee-field">
                <span>Dias del ciclo actual</span>
                <strong>{contractDays} dias</strong>
              </div>
              <div className="employee-field">
                <span>Año de servicio</span>
                <strong>{contractInfo.serviceYear}º año</strong>
              </div>
            </div>

            <div className="info-cards-grid">
              {infoCards.map((card) => (
                <button key={card.id} type="button" className="info-card" onClick={() => setActiveInfoModal(card.id)}>
                  <h3>{card.title}</h3>
                  <p>{card.detail}</p>
                </button>
              ))}
            </div>
          </aside>
        </section>

        {showRequestModal && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-card">
              <h3>Confirmar tipo de solicitud</h3>
              <p>
                Se solicitaran <strong>{selectedDates.length}</strong> dias. Selecciona el tipo y confirma.
              </p>

              <label htmlFor="tipoSolicitud">Tipo de permiso</label>
              <select
                id="tipoSolicitud"
                value={selectedTypeId}
                onChange={(event) => setSelectedTypeId(Number(event.target.value))}
              >
                {tiposPermiso.map((tipo) => (
                  <option key={tipo.idTipo} value={tipo.idTipo}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>

              <label htmlFor="motivoSolicitud">Motivo (opcional)</label>
              <textarea
                id="motivoSolicitud"
                rows={3}
                value={motivo}
                onChange={(event) => setMotivo(event.target.value)}
                placeholder="Agrega una nota para tu lider o RH"
              />

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowRequestModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn-accept" onClick={() => void submitSolicitud()} disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Aceptar solicitud'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeCard && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-card info-modal">
              <h3>{activeCard.title}</h3>
              <p>
                Hola {employeeProfile?.nombreUsuario || user?.nombre_usuario || 'colaborador'}, esta seccion
                detalla las reglas y pasos para <strong>{activeCard.title}</strong> segun tu perfil actual.
              </p>
              <p>{activeCard.detail}</p>
              <p>
                Para mayor control del area, tus solicitudes pasan a revision y se comparan con dias ya
                ocupados del equipo.
              </p>
              <div className="modal-actions">
                <button type="button" className="btn-accept" onClick={() => setActiveInfoModal(null)}>
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}