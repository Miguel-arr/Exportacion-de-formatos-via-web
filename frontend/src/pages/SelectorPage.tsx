/**
 * Página de Selector de Formularios.
 * Muestra las opciones disponibles de documentos a generar.
 */

interface SelectorPageProps {
  displayName: string;
  onSeleccionarAlturas: () => void;
  onSeleccionarAsistencia: () => void;
  onLogout: () => void;
}

export default function SelectorPage({
  displayName,
  onSeleccionarAlturas,
  onSeleccionarAsistencia,
  onLogout,
}: SelectorPageProps) {
  return (
    <div id="screen-selector">
      <div className="user-bar">
        <span>
          Bienvenido, <strong>{displayName}</strong>
        </span>
        <button onClick={onLogout}>Cerrar sesión</button>
      </div>

      <div className="card-header" style={{ marginBottom: '20px' }}>
        <h1>Selecciona un Formulario</h1>
        <p>Elige el tipo de documento que deseas generar</p>
      </div>

      <div className="selector-container">
        <button type="button" className="selector-btn" onClick={onSeleccionarAlturas}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ margin: '0 auto 8px', display: 'block' }}
          >
            <path d="M12 2v20M2 12h20" />
          </svg>
          Permiso de Alturas
        </button>

        <button type="button" className="selector-btn" onClick={onSeleccionarAsistencia}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ margin: '0 auto 8px', display: 'block' }}
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
          </svg>
          Asistencia
        </button>
      </div>
    </div>
  );
}
