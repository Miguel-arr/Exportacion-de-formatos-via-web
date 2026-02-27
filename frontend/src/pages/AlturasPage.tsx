/**
 * Página del formulario Permiso de Trabajo en Alturas.
 *
 * Implementa los lineamientos técnicos del PDF:
 * - Motor agnóstico: las llaves del JSON coinciden con {{placeholders}} en ALTURAS.xlsx
 * - Firma digital con react-signature-canvas (punto 6 del PDF)
 * - El trazo se captura y se envía como Base64 (PNG) al backend
 * - El backend inyecta la imagen en el Excel usando AddPicture()
 */

import { useState, useRef } from 'react';
import type { FormEvent } from 'react';
import SignaturePad, { type SignaturePadHandle } from '../components/SignaturePad';
import { generarDocumento, descargarBlob } from '../services/api';
import type { GenerarDocumentoRequest, DatosAlturas } from '../types/api';

interface AlturasPageProps {
  displayName: string;
  onVolver: () => void;
  onSesionExpirada: () => void;
}

export default function AlturasPage({ displayName, onVolver, onSesionExpirada }: AlturasPageProps) {
  const hoy = new Date().toISOString().split('T')[0];

  const [fecha, setFecha] = useState(hoy);
  const [hora, setHora] = useState('');
  const [area, setArea] = useState('');
  const [altura, setAltura] = useState('');
  const [loading, setLoading] = useState(false);
  const [alerta, setAlerta] = useState<{ tipo: 'error' | 'success'; mensaje: string } | null>(null);

  const sigPadRef = useRef<SignaturePadHandle>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAlerta(null);
    setLoading(true);

    try {
      // Construir el objeto de datos con tipos TypeScript estrictos
      // Las llaves deben coincidir con los {{placeholders}} en ALTURAS.xlsx
      const datos: DatosAlturas = {
        fecha_permiso: fecha,
        hora_inicio:   hora,
        area_trabajo:  area,
        altura_maxima: altura,
      };

      // Agregar firma si fue dibujada (punto 6 del PDF: react-signature-canvas)
      const firmaBase64 = sigPadRef.current?.getFirmaBase64();
      if (firmaBase64) {
        datos.firma_responsable = { firma_base64: firmaBase64 };
      }

      // Contrato del motor agnóstico (punto 3 del PDF)
      const req: GenerarDocumentoRequest = {
        plantilla: 'ALTURAS.xlsx',
        hoja:      'Permiso de trabajo',
        datos:     datos as unknown as Record<string, import('../types/api').DatoValor>,
      };

      const blob = await generarDocumento(req);
      descargarBlob(blob, 'Permiso_Alturas_Generado.xlsx');
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
    <div id="screen-alturas">
      <div className="user-bar">
        <span>
          Bienvenido, <strong>{displayName}</strong>
        </span>
        <button onClick={onVolver}>Volver</button>
      </div>

      <div className="card-header" style={{ marginBottom: '20px' }}>
        <h1>
          Permiso de Trabajo en Alturas <span className="badge">Excel</span>
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
            <label>Hora de inicio</label>
            <input
              type="time"
              value={hora}
              onChange={e => setHora(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Área / Ubicación</label>
          <input
            type="text"
            value={area}
            onChange={e => setArea(e.target.value)}
            placeholder="Ej: Torre A, Piso 3"
            required
          />
        </div>

        <div className="form-group">
          <label>Altura máxima (metros)</label>
          <input
            type="number"
            value={altura}
            onChange={e => setAltura(e.target.value)}
            placeholder="Ej: 15"
            min="0"
            required
          />
        </div>

        {/* Firma Digital con Lápiz Electrónico - react-signature-canvas (punto 6 del PDF) */}
        <SignaturePad ref={sigPadRef} label="Firma del responsable" />

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
