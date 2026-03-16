import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Login.css';

export default function Login() {
  const [email, setEmail] = useState('admin@softtek.com');
  const [password, setPassword] = useState('123');
  const [localError, setLocalError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validación básica
    if (!email || !password) {
      setLocalError('Por favor completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      setLocalError('Por favor ingresa un email válido');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>SoftPortal</h1>
          <p>Sistema de Gestión de Permisos</p>
        </div>

        <div className="demo-info">
          <strong>Demo:</strong> Usa email: <strong>admin@softtek.com</strong> y password: <strong>123</strong>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setLocalError(null);
              }}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setLocalError(null);
              }}
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {(localError || error) && (
            <div className="error-message">
              {localError || error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span> Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="form-footer">
          <p>¿No tienes cuenta? <a href="#register">Regístrate aquí</a></p>
        </div>
      </div>
    </div>
  );
}
