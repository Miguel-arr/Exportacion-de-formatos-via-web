/**
 * Página del formulario Registro de Asistencia.
 *
 * Mismo motor agnóstico que AlturasPage, diferente plantilla y llaves.
 * Las llaves del JSON deben coincidir con los {{placeholders}} en ASISTENCIA.xlsx.
 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { generarDocumento, descargarBlob } from '../services/api';
import type { GenerarDocumentoRequest, DatosAsistencia } from '../types/api';

interface AsistenciaPageProps {
  displayName: string;
  onVolver: () => void;
  onSesionExpirada: () => void;
}

export default function AsistenciaPage({ displayName, onVolver, onSesionExpirada }: AsistenciaPageProps) {
  const hoy = new Date().toISOString().split('T')[0];

  const [fecha, setFecha] = useState(hoy);
  const [horaEntrada, setHoraEntrada] = useState('');
  const [horaSalida, setHoraSalida] = useState('');
  const [trabajador, setTrabajador] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [alerta, setAlerta] = useState<{ tipo: 'error' | 'success'; mensaje: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAlerta(null);
    setLoading(true);

    try {
      // Construir el objeto de datos con tipos TypeScript estrictos
      // Las llaves deben coincidir con los {{placeholders}} en ASISTENCIA.xlsx
      const datos: DatosAsistencia = {
        fecha,
        hora_entrada:      horaEntrada,
        hora_salida:       horaSalida,
        nombre_trabajador: trabajador,
        departamento,
        observaciones,
      };

      // Contrato del motor agnóstico (punto 3 del PDF)
      const req: GenerarDocumentoRequest = {
        plantilla: 'ASISTENCIA.xlsx',
        hoja:      'Asistencia',
        datos:     datos as unknown as Record<string, import('../types/api').DatoValor>,
      };

      const blob = await generarDocumento(req);
      descargarBlob(blob, 'Asistencia_Generada.xlsx');
      setAlerta({ tipo: 'success', mensaje: 'Documento generado y descargado correctamente.' });
    } catch (err) {
      if (err instanceof Error && err.message === 'SESION_EXPIRADA') {
        setAlerta({ tipo: 'error', mensaje: 'Sesión expirada. Redirigiendo al login...' });
        setTimeout(onSesionExpirada, 2000);
      } else {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        setAlerta({ tipo: 'error', mensaje: `Error al conectar con el servidor. Detalle: ${msg}` });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="screen-asistencia">
      <div className="user-bar">
        <span>
          Bienvenido, <strong>{displayName}</strong>
        </span>
        <button onClick={onVolver}>Volver</button>
      </div>

      <div className="card-header" style={{ marginBottom: '20px' }}>
        <h1>
          Registro de Asistencia <span className="badge">Excel</span>
        </h1>
        <p>Completa los campos y descarga el documento generado</p>
      </div>

      {alerta && <div className={`alert ${alerta.tipo}`}>{alerta.mensaje}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="row">
          <div className="form-group">
            <label>Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Hora de entrada</label>
            <input
              type="time"
              value={horaEntrada}
              onChange={e => setHoraEntrada(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="row">
          <div className="form-group">
            <label>Hora de salida</label>
            <input
              type="time"
              value={horaSalida}
              onChange={e => setHoraSalida(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Nombre del trabajador</label>
            <input
              type="text"
              value={trabajador}
              onChange={e => setTrabajador(e.target.value)}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Departamento</label>
          <input
            type="text"
            value={departamento}
            onChange={e => setDepartamento(e.target.value)}
            placeholder="Ej: Mantenimiento"
            required
          />
        </div>

        <div className="form-group">
          <label>Observaciones</label>
          <textarea
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            placeholder="Notas adicionales (opcional)"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" />
              Generando...
            </>
          ) : (
            'Generar y descargar Excel'
          )}
        </button>
      </form>
    </div>
  );
}
