import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import MainCalendar from './pages/MainCalendar'
import Register from './pages/Register'
import RequestsManagement from './pages/RequestsManagement'
import RequestsAnalytics from './pages/RequestsAnalytics'
import RoleManagement from './pages/RoleManagement'
import MyRequests from './pages/MyRequests'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return(
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas protegidas */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainCalendar />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/mis-solicitudes"
          element={
            <ProtectedRoute>
              <MyRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/solicitudes-gestion"
          element={
            <ProtectedRoute allowedRoles={['admin', 'rh', 'rrhh', 'recursos humanos', 'recursos_humanos']}>
              <RequestsManagement />
            </ProtectedRoute>
          }
        />

        {/* Reportes integrado dentro de Análisis; ruta /reportes-solicitudes eliminada */}

        <Route
          path="/analisis-solicitudes"
          element={
            <ProtectedRoute allowedRoles={['admin', 'rh', 'rrhh', 'recursos humanos', 'recursos_humanos']}>
              <RequestsAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gestion-roles"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RoleManagement />
            </ProtectedRoute>
          }
        />
        
        {/* Ruta por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
