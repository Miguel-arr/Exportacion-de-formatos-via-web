import { useState, useRef } from 'react';
import type { SignaturePadHandle } from '../components/SignaturePad';
import { generarDocumento, descargarBlob } from '../services/api';
import type { GenerarDocumentoRequest } from '../types/api';

interface UseFormEngineProps {
  initialData: Record<string, any>;
  onSesionExpirada: () => void;
}

interface UseFormEngineReturn {
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  loading: boolean;
  alerta: { tipo: 'error' | 'success'; mensaje: string } | null;
  setAlerta: (alerta: any) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent, config: SubmitConfig) => Promise<void>;
  firmaResponsableRef: React.MutableRefObject<SignaturePadHandle | null>;
  firmaCoordinadorRef: React.MutableRefObject<SignaturePadHandle | null>;
  firmaEmergenciaRef: React.MutableRefObject<SignaturePadHandle | null>;
  firmaCierreRef: React.MutableRefObject<SignaturePadHandle | null>;
  firmasEjecutoresRefs: React.MutableRefObject<(SignaturePadHandle | null)[]>;
}

interface SubmitConfig {
  plantilla: string;
  hoja: string;
  nombreArchivo: string;
  procesarDatos?: (datos: any, refs: any) => any;
}

export function useFormEngine({ initialData, onSesionExpirada }: UseFormEngineProps): UseFormEngineReturn {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [loading, setLoading] = useState(false);
  const [alerta, setAlerta] = useState<{ tipo: 'error' | 'success'; mensaje: string } | null>(null);

  const firmaResponsableRef = useRef<SignaturePadHandle>(null);
  const firmaCoordinadorRef = useRef<SignaturePadHandle>(null);
  const firmaEmergenciaRef = useRef<SignaturePadHandle>(null);
  const firmaCierreRef = useRef<SignaturePadHandle>(null);
  const firmasEjecutoresRefs = useRef<(SignaturePadHandle | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent, config: SubmitConfig) => {
    e.preventDefault();
    setAlerta(null);
    setLoading(true);

    try {
      let datos = { ...formData };

      if (config.procesarDatos) {
        datos = config.procesarDatos(datos, {
          firmaResponsableRef,
          firmaCoordinadorRef,
          firmaEmergenciaRef,
          firmaCierreRef,
          firmasEjecutoresRefs
        });
      }

      const req: GenerarDocumentoRequest = {
        plantilla: config.plantilla,
        hoja: config.hoja,
        datos
      };

      const blob = await generarDocumento(req);
      descargarBlob(blob, config.nombreArchivo);
      setAlerta({ tipo: 'success', mensaje: 'Documento generado correctamente.' });
    } catch (err: any) {
      if (err.message === 'SESION_EXPIRADA') {
        setAlerta({ tipo: 'error', mensaje: 'Sesión expirada.' });
        setTimeout(onSesionExpirada, 2000);
      } else {
        setAlerta({ tipo: 'error', mensaje: `Error: ${err.message || 'Error desconocido'}` });
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    alerta,
    setAlerta,
    handleChange,
    handleSubmit,
    firmaResponsableRef,
    firmaCoordinadorRef,
    firmaEmergenciaRef,
    firmaCierreRef,
    firmasEjecutoresRefs
  };
}
