import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Login.css';

export default function Register() {
	const [nombreUsuario, setNombreUsuario] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [localError, setLocalError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const navigate = useNavigate();
	const { register, isLoading, error, clearError } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLocalError(null);
		setSuccessMessage(null);
		clearError();

		if (!nombreUsuario.trim() || !email.trim() || !password || !confirmPassword) {
			setLocalError('Por favor completa todos los campos');
			return;
		}

		if (!email.includes('@')) {
			setLocalError('Por favor ingresa un email valido');
			return;
		}

		if (password.length < 3) {
			setLocalError('La contrasena debe tener al menos 3 caracteres');
			return;
		}

		if (password !== confirmPassword) {
			setLocalError('Las contrasenas no coinciden');
			return;
		}

		try {
			await register({
				nombreUsuario: nombreUsuario.trim(),
				email: email.trim().toLowerCase(),
				password,
			});

			setSuccessMessage('Registro exitoso. Ahora inicia sesion.');
			setTimeout(() => navigate('/login'), 1200);
		} catch {
			setLocalError(error || 'No se pudo registrar el usuario');
		}
	};

	return (
		<div className="login-container">
			<div className="login-card">
				<div className="login-header">
					<h1>Crear Cuenta</h1>
					<p>Registra tu usuario para acceder a SoftPortal</p>
				</div>

				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label htmlFor="nombreUsuario">Nombre de usuario</label>
						<input
							id="nombreUsuario"
							type="text"
							placeholder="Tu nombre"
							value={nombreUsuario}
							onChange={(e) => {
								setNombreUsuario(e.target.value);
								setLocalError(null);
								clearError();
							}}
							disabled={isLoading}
							autoComplete="name"
						/>
					</div>

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
								clearError();
							}}
							disabled={isLoading}
							autoComplete="email"
						/>
					</div>

					<div className="form-group">
						<label htmlFor="password">Contrasena</label>
						<input
							id="password"
							type="password"
							placeholder="••••••••"
							value={password}
							onChange={(e) => {
								setPassword(e.target.value);
								setLocalError(null);
								clearError();
							}}
							disabled={isLoading}
							autoComplete="new-password"
						/>
					</div>

					<div className="form-group">
						<label htmlFor="confirmPassword">Confirmar contrasena</label>
						<input
							id="confirmPassword"
							type="password"
							placeholder="••••••••"
							value={confirmPassword}
							onChange={(e) => {
								setConfirmPassword(e.target.value);
								setLocalError(null);
								clearError();
							}}
							disabled={isLoading}
							autoComplete="new-password"
						/>
					</div>

					{(localError || error) && <div className="error-message">{localError || error}</div>}
					{successMessage && <div className="success-message">{successMessage}</div>}

					<button type="submit" className="login-button" disabled={isLoading}>
						{isLoading ? (
							<>
								<span className="loading-spinner"></span> Registrando...
							</>
						) : (
							'Crear Cuenta'
						)}
					</button>
				</form>

				<div className="form-footer">
					<p>
						¿Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
