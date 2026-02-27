/**
 * Componente de Firma Digital con Lápiz Electrónico.
 *
 * Implementa el punto 6 de los lineamientos técnicos del PDF:
 * "El formulario debe integrar un espacio de firma mediante la librería react-signature-canvas."
 *
 * - Frontend: Captura el trazo y genera un string en formato Base64 (PNG).
 * - El string Base64 se envía al backend como { firma_base64: "data:image/png;base64,..." }
 * - Backend: Identifica el campo de firma, decodifica el Base64 e inyecta la imagen
 *   en el Excel usando worksheet.AddPicture().
 */

import { useRef, forwardRef, useImperativeHandle } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export interface SignaturePadHandle {
  /** Retorna el string Base64 (PNG) de la firma, o null si está vacío */
  getFirmaBase64: () => string | null;
  /** Limpia el canvas */
  limpiar: () => void;
  /** Verifica si el canvas está vacío */
  isEmpty: () => boolean;
}

interface SignaturePadProps {
  label?: string;
}

const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  ({ label = 'Firma del responsable' }, ref) => {
    const sigCanvasRef = useRef<SignatureCanvas>(null);

    useImperativeHandle(ref, () => ({
      getFirmaBase64: () => {
        if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
          return null;
        }
        // Genera el string Base64 en formato PNG
        // react-signature-canvas retorna "data:image/png;base64,..."
        return sigCanvasRef.current.toDataURL('image/png');
      },
      limpiar: () => {
        sigCanvasRef.current?.clear();
      },
      isEmpty: () => {
        return sigCanvasRef.current?.isEmpty() ?? true;
      },
    }));

    return (
      <div className="form-group">
        <label>{label}</label>
        <div className="firma-container">
          <SignatureCanvas
            ref={sigCanvasRef}
            penColor="#1e3a5f"
            canvasProps={{
              className: 'firma-canvas',
              width: 480,
              height: 120,
            }}
          />
          <div className="firma-toolbar">
            <button
              type="button"
              className="btn-limpiar"
              onClick={() => sigCanvasRef.current?.clear()}
            >
              Limpiar
            </button>
          </div>
        </div>
        <p className="firma-hint">
          Dibuja tu firma con el mouse o dedo en el área de arriba.
        </p>
      </div>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;
