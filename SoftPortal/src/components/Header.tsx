import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import clock from '../assets/RedClock.svg'
import language from '../assets/Language.svg'
import user from '../assets/user-regular-full.svg'
import '../styles/Header.css'

interface HeaderProps {
  onManageRolesClick?: () => void
  onOpenRequestsClick?: () => void
  onOpenReportsClick?: () => void
  onOpenMyRequestsClick?: () => void
}

export default function Header({ onManageRolesClick, onOpenRequestsClick, onOpenReportsClick, onOpenMyRequestsClick }: HeaderProps) {
  const navigate = useNavigate()
  const { user: currentUser, logout, isAdmin, isAdminOrRh } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="header-principal">
        <div className="contenedor-principal">
        <button type="button" className="header-brand" onClick={() => navigate('/dashboard')}>
          <h1 className="header-title">SoftPortal</h1>
        </button>
            <div className='contenedor-de-contenedores'>
                <div className='contenedor-img'>
                    <img src={language} alt="Language" width={40}/>
                </div>
                <div className='contenedor-img'>
                    <img src={clock} alt="clock" width={40}/>
                </div>
          <button type="button" className='contenedor-img user-info' onClick={() => navigate('/dashboard')}>
                    <img src={user} alt="user" width={40} title={currentUser?.nombre_usuario}/>
                    <span className='usuario-nombre'>{currentUser?.nombre_usuario || 'Usuario'}</span>
          </button>
                {/* Mostrar Mis Solicitudes siempre; usar callback si se provee */}
                <button
                  onClick={() => {
                    if (onOpenMyRequestsClick) {
                      onOpenMyRequestsClick()
                      return
                    }
                    navigate('/mis-solicitudes')
                  }}
                  className='nav-button'
                  title='Mis solicitudes'
                >
                  Mis Solicitudes
                </button>
                {/* Para Admin/RH mostrar botones y navegar por defecto si no hay handlers */}
                {isAdminOrRh && (
                  <>
                    <button
                      onClick={() => {
                        if (onOpenRequestsClick) {
                          onOpenRequestsClick()
                          return
                        }
                        navigate('/gestion-solicitudes')
                      }}
                      className='nav-button'
                      title='Gestion de solicitudes'
                    >
                      Solicitudes
                    </button>

                    {/* Reportes eliminado; funcionalidad dentro de Análisis */}
                  </>
                )}
                {isAdminOrRh && (
                  <button
                    onClick={() => navigate('/analisis-solicitudes')}
                    className='nav-button'
                    title='Análisis de solicitudes'
                  >
                    Análisis
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => {
                      if (onManageRolesClick) {
                        onManageRolesClick()
                        return
                      }
                      navigate('/gestion-roles')
                    }}
                    className='admin-button'
                    title='Gestionar roles'
                  >
                    Gestionar Roles
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  className='logout-button'
                  title='Cerrar sesión'
                >
                  Cerrar Sesión
                </button>
            </div>
        </div>
    </header>
    );
}