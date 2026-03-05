/**
 * Componente raíz de la aplicación.
 *
 * Maneja la navegación entre pantallas y el estado de autenticación.
 *
 * Flujo de autenticación (según lineamientos técnicos del PDF):
 * 1. Al cargar, verifica si hay una sesión activa consultando /api/auth/me
 *    (el navegador envía automáticamente la cookie HttpOnly si existe)
 * 2. Si hay sesión activa, muestra directamente el selector de formularios
 * 3. Si no hay sesión, muestra el login
 * 4. Al hacer login, el backend setea la cookie HttpOnly
 * 5. Al hacer logout, el backend elimina la cookie HttpOnly
 */

import { useState, useEffect } from 'react';
import { verificarSesion, logout } from './services/api';
import LoginPage from './pages/LoginPage';
import SelectorPage from './pages/SelectorPage';
import AlturasPage from './pages/AlturasPage';
import AsistenciaPage from './pages/AsistenciaPage';

type Pantalla = 'login' | 'selector' | 'alturas' | 'asistencia';

interface Usuario {
  username: string;
  displayName: string;
}

export default function App() {
  const [pantalla, setPantalla] = useState<Pantalla>('login');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [verificando, setVerificando] = useState(true);

  // Al montar, verificar si hay una sesión activa via cookie HttpOnly
  useEffect(() => {
    verificarSesion().then(data => {
      if (data) {
        setUsuario({ username: data.username, displayName: data.displayName });
        setPantalla('selector');
      }
      setVerificando(false);
    });
  }, []);

  const handleLoginSuccess = (username: string, displayName: string) => {
    setUsuario({ username, displayName });
    setPantalla('selector');
  };

  const handleLogout = async () => {
    await logout();
    setUsuario(null);
    setPantalla('login');
  };

  const handleSesionExpirada = () => {
    setUsuario(null);
    setPantalla('login');
  };

  if (verificando) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <span className="spinner" style={{ width: '24px', height: '24px', borderWidth: '3px' }} />
        <p style={{ marginTop: '12px', color: 'var(--muted)' }}>Verificando sesión...</p>
      </div>
    );
  }

  return (
    <div className="card">
      {pantalla === 'login' && (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}

      {pantalla === 'selector' && usuario && (
        <SelectorPage
          displayName={usuario.displayName}
          onSeleccionarAlturas={() => setPantalla('alturas')}
          onSeleccionarAsistencia={() => setPantalla('asistencia')}
          onLogout={handleLogout}
        />
      )}

      {pantalla === 'alturas' && usuario && (
        <AlturasPage
          displayName={usuario.displayName}
          onVolver={() => setPantalla('selector')}
          onSesionExpirada={handleSesionExpirada}
        />
      )}

      {pantalla === 'asistencia' && usuario && (
        <AsistenciaPage
          displayName={usuario.displayName}
          onVolver={() => setPantalla('selector')}
          onSesionExpirada={handleSesionExpirada}
        />
      )}
    </div>
  );
}
