/**
 * Página de Login.
 *
 * Flujo de autenticación:
 * 1. El usuario ingresa credenciales.
 * 2. El Backend valida y devuelve un JWT.
 * 3. El Frontend almacena el token en localStorage.
 * 4. El Frontend envía el token en el header Authorization en peticiones posteriores.
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { login } from '../services/api';
import type { LoginRequest } from '../types/api';

interface LoginPageProps {
  onLoginSuccess: (username: string, displayName: string) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const req: LoginRequest = { username: username.trim(), password };
      const data = await login(req);
      onLoginSuccess(data.username, data.displayName);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error de autenticación';
      if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('failed')) {
        setError('No se pudo conectar al servidor (http://localhost:5205). Verifica que el backend esté corriendo con "dotnet run".');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="screen-login">
      <div className="card-header">
        <div className="logo">
          <svg viewBox="0 0 24 24">
            <path d="M12 2a9 9 0 0 1 9 9v1H3v-1a9 9 0 0 1 9-9zm-9 11h18v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1zm2 4h14v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1z" />
          </svg>
        </div>
        <h1>Permisos de Trabajo</h1>
        <p>Inicia sesión para continuar</p>
      </div>

      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>Usuario</label>
          <div className="input-icon">
            <span className="icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </span>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              autoComplete="username"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Contraseña</label>
          <div className="input-icon">
            <span className="icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </form>

      <hr className="divider" />
      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--muted)' }}>
        Credenciales de prueba: <strong>admin</strong> / <strong>1234</strong>
      </p>
    </div>
  );
}
