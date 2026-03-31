import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import clock from '../assets/RedClock.svg'
import language from '../assets/Language.svg'
import user from '../assets/user-regular-full.svg'
import '../styles/Header.css'

interface HeaderProps {
  onManageRolesClick?: () => void
}

export default function Header({ onManageRolesClick }: HeaderProps) {
  const navigate = useNavigate()
  const { user: currentUser, logout, isAdmin } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="header-principal">
        <div className="contenedor-principal">
            <div>
                <h1 className="header-title">SoftPortal</h1>
            </div>
            <div className='contenedor-de-contenedores'>
                <div className='contenedor-img'>
                    <img src={language} alt="Language" width={40}/>
                </div>
                <div className='contenedor-img'>
                    <img src={clock} alt="clock" width={40}/>
                </div>
                <div className='contenedor-img user-info'>
                    <img src={user} alt="user" width={40} title={currentUser?.nombre_usuario}/>
                    <span className='usuario-nombre'>{currentUser?.nombre_usuario || 'Usuario'}</span>
                </div>
                {isAdmin && onManageRolesClick && (
                  <button
                    onClick={onManageRolesClick}
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