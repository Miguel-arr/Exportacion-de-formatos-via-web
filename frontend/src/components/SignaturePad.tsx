/**
 * Componente de Firma Digital con Lápiz Electrónico y Carga de Imagen.
 *
 * Implementa el punto 6 de los lineamientos técnicos del PDF:
 * "El formulario debe integrar un espacio de firma mediante la librería react-signature-canvas."
 *
 * - Frontend: Captura el trazo y genera un string en formato Base64 (PNG).
 * - El string Base64 se envía al backend como { firma_base64: "data:image/png;base64,..." }
 * - Backend: Identifica el campo de firma, decodifica el Base64 e inyecta la imagen
 *   en el Excel usando worksheet.AddPicture().
 * - También permite subir una imagen directamente.
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && sigCanvasRef.current) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = sigCanvasRef.current?.getCanvas();
            if (canvas) {
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                const x = (canvas.width - img.width * scale) / 2;
                const y = (canvas.height - img.height * scale) / 2;
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
              }
            }
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    };

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
              style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
            >
              Limpiar
            </button>
            <button
              type="button"
              className="btn-upload"
              onClick={() => fileInputRef.current?.click()}
              style={{ marginLeft: '10px', padding: '6px 12px', background: '#059669', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
            >
              Subir Imagen
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>
        </div>
        <p className="firma-hint">
          Dibuja tu firma con el mouse o dedo en el área de arriba, o sube una imagen.
        </p>
      </div>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;
