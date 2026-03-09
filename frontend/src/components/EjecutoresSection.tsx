import { useRef } from 'react';
import SignaturePad, { type SignaturePadHandle } from './SignaturePad';
import RadioGroup from './RadioGroup';

export interface Ejecutor {
  nombres: string;
  doc: string;
  cargo: string;
  examen: string;
  certificado: string;
  ss: string;
  anclajes: string;
  alcohol: string;
  firma_base64?: string;
}

interface EjecutoresSectionProps {
  ejecutores: Ejecutor[];
  onEjecutorChange: (index: number, campo: keyof Ejecutor, valor: string) => void;
  onAgregarEjecutor: () => void;
  onEliminarEjecutor: (index: number) => void;
  firmasRefs: React.MutableRefObject<(SignaturePadHandle | null)[]>;
  styles?: any;
}

export default function EjecutoresSection({
  ejecutores,
  onEjecutorChange,
  onAgregarEjecutor,
  onEliminarEjecutor,
  firmasRefs,
  styles = defaultStyles
}: EjecutoresSectionProps) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h4 style={{ margin: 0, color: '#374151', fontSize: '16px' }}>Datos de los Ejecutores</h4>
        <button type="button" onClick={onAgregarEjecutor} style={styles.btnPrimarioChico}>
          + Agregar Ejecutor
        </button>
      </div>

      {ejecutores.map((ejec: Ejecutor, index: number) => (
        <div key={index} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h5 style={{ margin: 0 }}>Ejecutor #{index + 1}</h5>
            {ejecutores.length > 1 && (
              <button type="button" onClick={() => onEliminarEjecutor(index)} style={styles.btnEliminar}>
                Eliminar Ejecutor
              </button>
            )}
          </div>

          <div style={styles.grid3}>
            <input
              type="text"
              placeholder="Nombres y Apellidos"
              value={ejec.nombres}
              onChange={(e) => onEjecutorChange(index, 'nombres', e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Documento (C.C/C.E/P.E.P)"
              value={ejec.doc}
              onChange={(e) => onEjecutorChange(index, 'doc', e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Cargo/Rol"
              value={ejec.cargo}
              onChange={(e) => onEjecutorChange(index, 'cargo', e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={{ marginTop: '15px' }}>
            <RadioGroup
              label="¿Examen médico vigente?"
              name={`ejec_examen_${index}`}
              value={ejec.examen}
              onChange={(e: any) => onEjecutorChange(index, 'examen', e.target.value)}
              styles={styles}
            />
            <RadioGroup
              label="¿Certificado alturas vigente?"
              name={`ejec_cert_${index}`}
              value={ejec.certificado}
              onChange={(e: any) => onEjecutorChange(index, 'certificado', e.target.value)}
              styles={styles}
            />
            <RadioGroup
              label="¿Seguridad social vigente?"
              name={`ejec_ss_${index}`}
              value={ejec.ss}
              onChange={(e: any) => onEjecutorChange(index, 'ss', e.target.value)}
              styles={styles}
            />
            <RadioGroup
              label="¿Verifica sus anclajes?"
              name={`ejec_anc_${index}`}
              value={ejec.anclajes}
              onChange={(e: any) => onEjecutorChange(index, 'anclajes', e.target.value)}
              styles={styles}
            />
            <RadioGroup
              label="¿Consumió alcohol (24h)?"
              name={`ejec_alc_${index}`}
              value={ejec.alcohol}
              onChange={(e: any) => onEjecutorChange(index, 'alcohol', e.target.value)}
              styles={styles}
            />
          </div>

          <div style={{ marginTop: '15px', maxWidth: '400px', width: '100%' }}>
            <SignaturePad
              ref={(el) => {
                firmasRefs.current[index] = el;
              }}
              label={`Firma Ejecutor ${index + 1}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const defaultStyles = {
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' },
  input: { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', width: '100%', boxSizing: 'border-box' as const },
  btnPrimarioChico: { padding: '6px 12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  btnEliminar: { padding: '6px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
};
