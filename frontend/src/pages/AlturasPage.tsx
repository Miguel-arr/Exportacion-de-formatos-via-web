import { useState, useRef } from 'react';
import type { FormEvent, ReactNode } from 'react';
import SignaturePad, { type SignaturePadHandle } from '../components/SignaturePad';
import { generarDocumento, descargarBlob } from '../services/api';
import type { GenerarDocumentoRequest } from '../types/api';

interface AlturasPageProps {
  displayName: string;
  onVolver: () => void;
  onSesionExpirada: () => void;
}

// COMPONENTE: Sección Desplegable (Acordeón)
const SeccionDesplegable = ({ titulo, children, defaultAbierto = false }: { titulo: string, children: ReactNode, defaultAbierto?: boolean }) => {
  const [abierto, setAbierto] = useState(defaultAbierto);
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader} onClick={() => setAbierto(!abierto)}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{titulo}</h3>
        <span style={{ fontSize: '20px', color: '#64748b' }}>{abierto ? '▲' : '▼'}</span>
      </div>
      {abierto && <div style={styles.cardBody}>{children}</div>}
    </div>
  );
};

export default function AlturasPage({ displayName, onVolver, onSesionExpirada }: AlturasPageProps) {
  const hoy = new Date().toISOString().split('T')[0];

    // ================= ESTADO CENTRALIZADO =================
  const [formData, setFormData] = useState<Record<string, any>>({
    fecha_permiso: hoy,
    hora_inicio: '',
    hora_fin: '',
    area_trabajo: '',
    ubicacion_trabajo: '',
    altura_maxima: '',

    // Checkboxes Tipo de Trabajo
    chk_mantenimiento: false,
    chk_almacenamiento: false,
    chk_instalacion: false,
    chk_supervicion: false,
    chk_orden: false,
    chk_izaje: false,
    chk_arme: false,
    otros_trabajos: '',

    // Lista dinamica de ejecutores
    ejecutores: [{ nombres: '', doc: '', cargo: '' }],

    // Verificacion Ejecutor
    ejec_examen: '',
    ejec_certificado: '',
    ejec_ss: '',
    ejec_anclajes: '',
    ejec_alcohol: '',

    // Permisos Adicionales
    permiso_caliente: '',
    permiso_confinados: '',
    permiso_electrico: '',

    // Verificacion Peligros
    chk_ats: '',
    chk_socializacion: '',
    chk_optimas: '',
    chk_delimitado: '',
    chk_rescate: '',
    chk_coordinador: '',
    chk_clima: '',
    chk_izar: '',
    chk_portaherramienta: '',
    chk_electricidad: '',
    chk_verificacion_puntos_anclajes: '',

    // EPP
    epp_casco: '',
    epp_gafas: '',
    epp_dotacion: '',
    epp_guantes: '',
    epp_calzado: '',
    otros_elementos: '',

    // Equipos Proteccion Caidas
    anclaje_fijo: '', est_anclaje_fijo: '', obs_anclaje_fijo: '',
    arnes: '', est_arnes: '', obs_arnes: '',
    anclaje_movil: '', est_anclaje_movil: '', obs_anclaje_movil: '',
    mosquetones: '', est_mosquetones: '', obs_mosquetones: '',
    eslinga_detencion: '', est_eslinga_detencion: '', obs_eslinga_detencion: '',
    frenos: '', est_frenos: '', obs_frenos: '',
    eslinga_posicionamiento: '', est_eslinga_posicionamiento: '', obs_eslinga_posicionamiento: '',
    lvh_temporal: '', est_lvh_temporal: '', obs_lvh_temporal: '',
    eslinga_restriccion: '', est_eslinga_restriccion: '', obs_eslinga_restriccion: '',
    otros_equipos: '', estado_otros_equipos: '', obs_otros_equipos: '',

    // Medidas Prevencion
    delimitacion_area: '', obs_delimitacion_area: '',
    barandas: '', obs_barandas: '',
    control_acceso: '', obs_control_acceso: '',
    ayudantes_seguridad: '', obs_ayudantes_seguridad: '',
    lineas_advertencia: '', obs_lineas_advertencia: '',
    otros_medidas: '', obs_otros_medidas: '',
    control_huecos: '',

    // Sistemas Acceso
    andamios: '', obs_andamios: '',
    elevadores_personas: '', obs_elevadores_personas: '',
    andamios_colgantes: '', obs_andamios_colgantes: '',
    trabajo_suspension: '', obs_trabajo_suspension: '',
    escaleras_fijas: '', obs_escaleras_fijas: '',
    otros_sistemas: '', obs_otros_sistemas: '',
    escaleras_moviles: '', obs_escaleras_moviles: '',

    // Herramientas
    herramientas_utilizar: '',

    // Claridad de Caida
    distancia_Caida_libre: 0,
    altura_trabajador: 0,
    longitud_eslinga: 0,
    absorbedor_choque: 0,
    factor_seguridad: 0.6,

    // Nombres, Docs y Cargos para Firmas
    nombre_responsable_tarea: '', doc_responsable_tarea: '', cargo_responsable_tarea: '',
    nombre_coordinador_altura: '', doc_coordinador_altura: '', cargo_coordinador_altura: '',
    nombre_responsable_emergencia: '', doc_responsable_emergencia: '', cargo_responsable_emergencia: '',

    // Datos de Cierre
    tarea_terminada: '',
    orden_aseo_realizado: '',
    hubo_incidentes: '',
    nombre_cierre: '',
    cargo_cierre: '',
    fecha_cierre: hoy,
    hora_cierre: '',
    motivo_cierre: '',
    observaciones_finales: '',
  });

  const [loading, setLoading] = useState(false);
  const [alerta, setAlerta] = useState<{ tipo: 'error' | 'success'; mensaje: string } | null>(null);

  // Referencias para las firmas
  const firmaResponsableRef = useRef<SignaturePadHandle>(null);
  const firmaCoordinadorRef = useRef<SignaturePadHandle>(null);
  const firmaEmergenciaRef = useRef<SignaturePadHandle>(null);
  const firmaCierreRef = useRef<SignaturePadHandle>(null);

  // ================= MANEJADORES GLOBALES =================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {// Te actualiza cualquier campo del form, incluyendo checkboxes y radios mientras tenga el atributo "name" correcto
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleEjecutorChange = (index: number, campo: string, valor: string) => {
    const nuevosEjecutores = [...formData.ejecutores];
    nuevosEjecutores[index][campo] = valor;
    setFormData({ ...formData, ejecutores: nuevosEjecutores });
  };

  const agregarEjecutor = () => {
    setFormData({ ...formData, ejecutores: [...formData.ejecutores, { nombres: '', doc: '', cargo: '' }] });
  };

  const eliminarEjecutor = (index: number) => {
    const nuevosEjecutores = formData.ejecutores.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, ejecutores: nuevosEjecutores });
  };

  // ================= ENVÍO DEL FORMULARIO =================
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAlerta(null);
    setLoading(true);

    try {
      const datos = { ...formData };
      
      // Convertir checkboxes a X en minúscula
      ['mantenimiento', 'almacenamiento', 'instalacion', 'supervicion', 'orden', 'izaje', 'arme'].forEach(chk => {
        datos[`chk_${chk}`] = formData[`chk_${chk}`] ? 'X' : '';
      });

      // Aplanar la lista de ejecutores
      formData.ejecutores.forEach((ejec: any, index: number) => {
        datos[`ejecutor_nombres_${index + 1}`] = ejec.nombres;
        datos[`ejecutor_doc_${index + 1}`] = ejec.doc;
        datos[`ejecutor_cargo_${index + 1}`] = ejec.cargo;
      });
      // Para compatibilidad con placeholders únicos si solo hay uno
      if (formData.ejecutores.length > 0) {
        datos['ejecutor_nombres'] = formData.ejecutores[0].nombres;
        datos['ejecutor_doc'] = formData.ejecutores[0].doc;
        datos['ejecutor_cargo'] = formData.ejecutores[0].cargo;
      }
      delete datos.ejecutores;

      // Captura de Firmas
      const fResp = firmaResponsableRef.current?.getFirmaBase64();
      if (fResp) datos.ImgFirmaResponsableTarea = { firma_base64: fResp };
      
      const fCoord = firmaCoordinadorRef.current?.getFirmaBase64();
      if (fCoord) datos.ImgFirmaCoordinadorAltura = { firma_base64: fCoord };
      
      const fEmerg = firmaEmergenciaRef.current?.getFirmaBase64();
      if (fEmerg) datos.ImgFirmaResponsableEmergencia = { firma_base64: fEmerg };
      
      const fCierre = firmaCierreRef.current?.getFirmaBase64();
      if (fCierre) datos.firma_cierre = { firma_base64: fCierre };

      // Cálculos de Claridad de Caída
      const alturaLibreR = Number(formData.altura_trabajador) + Number(formData.longitud_eslinga) + 
                           Number(formData.absorbedor_choque) + Number(formData.factor_seguridad);
      const distanciaLibreReal = Number(formData.distancia_Caida_libre) - alturaLibreR;
      
      datos.altura_libre_r = alturaLibreR;
      datos.distancia_libre_real = distanciaLibreReal;
      datos.distancia_real_resultante = distanciaLibreReal;

      const req: GenerarDocumentoRequest = { plantilla: 'ALTURAS.xlsx', hoja: 'Permiso de trabajo', datos };
      const blob = await generarDocumento(req);

      descargarBlob(blob, 'Permiso_Alturas_Generado.xlsx');
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

  const RadioGroup = ({ label, name, options = ['SI', 'NO', 'N/A'] }: { label: string, name: string, options?: string[] }) => (
    <div style={styles.radioRow}>
      <span style={{ flex: 1, fontWeight: '500' }}>{label}</span>
      <div style={{ display: 'flex', gap: '20px' }}>
        {options.map(opt => (
          <label key={opt} style={styles.checkLabel}>
            <input type="radio" name={name} value={opt} checked={formData[name] === opt} onChange={handleChange} required /> {opt}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif', color: '#333' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #e5e7eb', paddingBottom: '15px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#1f2937' }}>Permiso de Trabajo en Alturas</h1>
        <button type="button" onClick={onVolver} style={styles.btnSecundario}>Volver al Menú</button>
      </div>

      {alerta && <div style={{ padding: '15px', background: alerta.tipo === 'error' ? '#fee2e2' : '#dcfce7', color: alerta.tipo === 'error' ? '#991b1b' : '#166534', marginBottom: '25px', borderRadius: '6px' }}>{alerta.mensaje}</div>}

      <form onSubmit={handleSubmit}>
        
        <SeccionDesplegable titulo="1. Información General y Ejecutores" defaultAbierto={true}>
          <div style={styles.grid3}>
            <div style={styles.inputGroup}><label>Fecha:</label> <input type="date" name="fecha_permiso" value={formData.fecha_permiso} onChange={handleChange} required style={styles.input} /></div>
            <div style={styles.inputGroup}><label>Hora Inicio:</label> <input type="time" name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} required style={styles.input} /></div>
            <div style={styles.inputGroup}><label>Hora Fin:</label> <input type="time" name="hora_fin" value={formData.hora_fin} onChange={handleChange} style={styles.input} /></div>
            <div style={styles.inputGroup}><label>Área General:</label> <input type="text" name="area_trabajo" value={formData.area_trabajo} onChange={handleChange} required style={styles.input} /></div>
            <div style={styles.inputGroup}><label>Ubicación Específica:</label> <input type="text" name="ubicacion_trabajo" value={formData.ubicacion_trabajo} onChange={handleChange} required style={styles.input} /></div>
            <div style={styles.inputGroup}><label>Altura Máx (m):</label> <input type="number" step="0.1" name="altura_maxima" value={formData.altura_maxima} onChange={handleChange} required style={styles.input} /></div>
          </div>
          
          <hr style={styles.hr} />
          <h4 style={styles.subTitle}>Tipo de Trabajo</h4>
          <div style={styles.grid3}>
            <label style={styles.checkLabel}><input type="checkbox" name="chk_mantenimiento" checked={formData.chk_mantenimiento} onChange={handleChange} /> Mantenimiento</label>
            <label style={styles.checkLabel}><input type="checkbox" name="chk_almacenamiento" checked={formData.chk_almacenamiento} onChange={handleChange} /> Almacenamiento</label>
            <label style={styles.checkLabel}><input type="checkbox" name="chk_instalacion" checked={formData.chk_instalacion} onChange={handleChange} /> Instalación</label>
            <label style={styles.checkLabel}><input type="checkbox" name="chk_supervicion" checked={formData.chk_supervicion} onChange={handleChange} /> Supervisión</label>
            <label style={styles.checkLabel}><input type="checkbox" name="chk_orden" checked={formData.chk_orden} onChange={handleChange} /> Orden y aseo</label>
            <label style={styles.checkLabel}><input type="checkbox" name="chk_izaje" checked={formData.chk_izaje} onChange={handleChange} /> Izaje de carga</label>
            <label style={styles.checkLabel}><input type="checkbox" name="chk_arme" checked={formData.chk_arme} onChange={handleChange} /> Arme/Desarme</label>
            <div style={styles.inputGroup}><label>Otros:</label> <input type="text" name="otros_trabajos" value={formData.otros_trabajos} onChange={handleChange} style={styles.input} /></div>
          </div>

          <hr style={styles.hr} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ margin: 0, color: '#374151', fontSize: '16px' }}>Datos de los Ejecutores</h4>
            <button type="button" onClick={agregarEjecutor} style={styles.btnPrimarioChico}>+ Agregar Ejecutor</button>
          </div>
          {formData.ejecutores.map((ejec: any, index: number) => (
            <div key={index} style={{ ...styles.grid3, alignItems: 'flex-end', marginBottom: '10px' }}>
              <input type="text" placeholder="Nombres" value={ejec.nombres} onChange={(e) => handleEjecutorChange(index, 'nombres', e.target.value)} style={styles.input} required />
              <input type="text" placeholder="Documento" value={ejec.doc} onChange={(e) => handleEjecutorChange(index, 'doc', e.target.value)} style={styles.input} required />
              <input type="text" placeholder="Cargo" value={ejec.cargo} onChange={(e) => handleEjecutorChange(index, 'cargo', e.target.value)} style={styles.input} required />
              {formData.ejecutores.length > 1 && <button type="button" onClick={() => eliminarEjecutor(index)} style={styles.btnEliminar}>X</button>}
            </div>
          ))}
        </SeccionDesplegable>

        <SeccionDesplegable titulo="2. Verificación de Condiciones del Ejecutor">
          <RadioGroup label="¿Examen médico vigente?" name="ejec_examen" />
          <RadioGroup label="¿Certificado de alturas vigente?" name="ejec_certificado" />
          <RadioGroup label="¿Afiliación a SS vigente?" name="ejec_ss" />
          <RadioGroup label="¿Conoce y verifica sus anclajes?" name="ejec_anclajes" />
          <RadioGroup label="¿Se realizó prueba de alcohol?" name="ejec_alcohol" />
        </SeccionDesplegable>

        <SeccionDesplegable titulo="3. Permisos Adicionales">
          <RadioGroup label="¿Permiso en caliente?" name="permiso_caliente" />
          <RadioGroup label="¿Permiso espacios confinados?" name="permiso_confinados" />
          <RadioGroup label="¿Permiso riesgo eléctrico?" name="permiso_electrico" />
        </SeccionDesplegable>

        <SeccionDesplegable titulo="4. Verificación de Peligros y Riesgos">
          <RadioGroup label="¿ATS socializado?" name="chk_ats" />
          <RadioGroup label="¿Socialización de procedimientos?" name="chk_socializacion" />
          <RadioGroup label="¿Condiciones óptimas?" name="chk_optimas" />
          <RadioGroup label="¿Área delimitada?" name="chk_delimitado" />
          <RadioGroup label="¿Plan de rescate?" name="chk_rescate" />
          <RadioGroup label="¿Coordinador presente?" name="chk_coordinador" />
          <RadioGroup label="¿Clima favorable?" name="chk_clima" />
          <RadioGroup label="¿Izaje de cargas?" name="chk_izar" />
          <RadioGroup label="¿Portaherramientas?" name="chk_portaherramienta" />
          <RadioGroup label="¿Riesgo eléctrico?" name="chk_electricidad" />
          <RadioGroup label="¿Verificación puntos anclaje?" name="chk_verificacion_puntos_anclajes" />
        </SeccionDesplegable>

        <SeccionDesplegable titulo="5. Elementos de Protección Personal (EPP)">
          <RadioGroup label="Casco" name="epp_casco" />
          <RadioGroup label="Gafas" name="epp_gafas" />
          <RadioGroup label="Dotación" name="epp_dotacion" />
          <RadioGroup label="Guantes" name="epp_guantes" />
          <RadioGroup label="Calzado" name="epp_calzado" />
          <div style={styles.inputGroup}><label>Otros EPP:</label> <input type="text" name="otros_elementos" value={formData.otros_elementos} onChange={handleChange} style={styles.input} /></div>
        </SeccionDesplegable>

        <SeccionDesplegable titulo="6. Equipos de Protección Contra Caídas">
          {['anclaje_fijo', 'arnes', 'anclaje_movil', 'mosquetones', 'eslinga_detencion', 'frenos', 'eslinga_posicionamiento', 'lvh_temporal', 'eslinga_restriccion'].map(eq => (
            <div key={eq} style={{ marginBottom: '20px', padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
              <RadioGroup label={`¿Usa ${eq.replace('_', ' ')}?`} name={eq} />
              <div style={styles.grid2}>
                <div style={styles.inputGroup}><label>Estado:</label> <input type="text" name={`est_${eq}`} value={formData[`est_${eq}`]} onChange={handleChange} style={styles.input} /></div>
                <div style={styles.inputGroup}><label>Observaciones:</label> <input type="text" name={`obs_${eq}`} value={formData[`obs_${eq}`]} onChange={handleChange} style={styles.input} /></div>
              </div>
            </div>
          ))}
          <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
            <div style={styles.inputGroup}><label>Otros Equipos:</label> <input type="text" name="otros_equipos" value={formData.otros_equipos} onChange={handleChange} style={styles.input} /></div>
            <div style={styles.grid2}>
              <div style={styles.inputGroup}><label>Estado:</label> <input type="text" name="estado_otros_equipos" value={formData.estado_otros_equipos} onChange={handleChange} style={styles.input} /></div>
              <div style={styles.inputGroup}><label>Observaciones:</label> <input type="text" name="obs_otros_equipos" value={formData.obs_otros_equipos} onChange={handleChange} style={styles.input} /></div>
            </div>
          </div>
        </SeccionDesplegable>

        <SeccionDesplegable titulo="7. Medidas de Prevención">
          {['delimitacion_area', 'barandas', 'control_acceso', 'ayudantes_seguridad', 'lineas_advertencia', 'otros_medidas'].map(med => (
            <div key={med} style={{ marginBottom: '15px' }}>
              <RadioGroup label={`¿${med.replace('_', ' ')}?`} name={med} />
              <div style={styles.inputGroup}><label>Observaciones:</label> <input type="text" name={`obs_${med}`} value={formData[`obs_${med}`]} onChange={handleChange} style={styles.input} /></div>
            </div>
          ))}
          <RadioGroup label="Control de huecos" name="control_huecos" />
        </SeccionDesplegable>

        <SeccionDesplegable titulo="8. Sistemas de Acceso">
          {['andamios', 'elevadores_personas', 'andamios_colgantes', 'trabajo_suspension', 'escaleras_fijas', 'otros_sistemas', 'escaleras_moviles'].map(sis => (
            <div key={sis} style={{ marginBottom: '15px' }}>
              <RadioGroup label={`¿${sis.replace('_', ' ')}?`} name={sis} />
              <div style={styles.inputGroup}><label>Observaciones:</label> <input type="text" name={`obs_${sis}`} value={formData[`obs_${sis}`]} onChange={handleChange} style={styles.input} /></div>
            </div>
          ))}
        </SeccionDesplegable>

        <SeccionDesplegable titulo="9. Herramientas y Claridad de Caída">
          <div style={styles.inputGroup}><label>Herramientas a utilizar:</label> <textarea name="herramientas_utilizar" value={formData.herramientas_utilizar} onChange={handleChange} style={styles.textarea} rows={3}></textarea></div>
          <hr style={styles.hr} />
          <h4 style={styles.subTitle}>Cálculo Claridad de Caída</h4>
          <div style={styles.grid3}>
            <div style={styles.inputGroup}><label>Distancia Caída Libre (F):</label> <input type="number" step="0.1" name="distancia_Caida_libre" value={formData.distancia_Caida_libre} onChange={handleChange} style={styles.input} /></div>
            <div style={styles.inputGroup}><label>Altura Trabajador (A):</label> <input type="number" step="0.1" name="altura_trabajador" value={formData.altura_trabajador} onChange={handleChange} style={styles.input} /></div>
            <div style={styles.inputGroup}><label>Longitud Eslinga (B):</label> <input type="number" step="0.1" name="longitud_eslinga" value={formData.longitud_eslinga} onChange={handleChange} style={styles.input} /></div>
            <div style={styles.inputGroup}><label>Absorbedor (C):</label> <input type="number" step="0.1" name="absorbedor_choque" value={formData.absorbedor_choque} onChange={handleChange} style={styles.input} /></div>
            <div style={styles.inputGroup}><label>Factor Seguridad (D):</label> <input type="number" step="0.1" name="factor_seguridad" value={formData.factor_seguridad} onChange={handleChange} style={styles.input} /></div>
          </div>
        </SeccionDesplegable>

        <SeccionDesplegable titulo="10. Firmas de Autorización">
          <div style={styles.grid3}>
            <div style={styles.firmaBox}>
              <h5 style={{ margin: '0 0 10px 0' }}>Responsable Tarea</h5>
              <input type="text" name="nombre_responsable_tarea" placeholder="Nombre" value={formData.nombre_responsable_tarea} onChange={handleChange} style={styles.input} required />
              <input type="text" name="doc_responsable_tarea" placeholder="Documento" value={formData.doc_responsable_tarea} onChange={handleChange} style={{ ...styles.input, marginTop: '5px' }} required />
              <input type="text" name="cargo_responsable_tarea" placeholder="Cargo" value={formData.cargo_responsable_tarea} onChange={handleChange} style={{ ...styles.input, marginTop: '5px' }} required />
              <div style={{ marginTop: '10px' }}><SignaturePad ref={firmaResponsableRef} label="Firma" /></div>
            </div>
            <div style={styles.firmaBox}>
              <h5 style={{ margin: '0 0 10px 0' }}>Coordinador Altura</h5>
              <input type="text" name="nombre_coordinador_altura" placeholder="Nombre" value={formData.nombre_coordinador_altura} onChange={handleChange} style={styles.input} required />
              <input type="text" name="doc_coordinador_altura" placeholder="Documento" value={formData.doc_coordinador_altura} onChange={handleChange} style={{ ...styles.input, marginTop: '5px' }} required />
              <input type="text" name="cargo_coordinador_altura" placeholder="Cargo" value={formData.cargo_coordinador_altura} onChange={handleChange} style={{ ...styles.input, marginTop: '5px' }} required />
              <div style={{ marginTop: '10px' }}><SignaturePad ref={firmaCoordinadorRef} label="Firma" /></div>
            </div>
            <div style={styles.firmaBox}>
              <h5 style={{ margin: '0 0 10px 0' }}>Emergencia</h5>
              <input type="text" name="nombre_responsable_emergencia" placeholder="Nombre" value={formData.nombre_responsable_emergencia} onChange={handleChange} style={styles.input} required />
              <input type="text" name="doc_responsable_emergencia" placeholder="Documento" value={formData.doc_responsable_emergencia} onChange={handleChange} style={{ ...styles.input, marginTop: '5px' }} required />
              <input type="text" name="cargo_responsable_emergencia" placeholder="Cargo" value={formData.cargo_responsable_emergencia} onChange={handleChange} style={{ ...styles.input, marginTop: '5px' }} required />
              <div style={{ marginTop: '10px' }}><SignaturePad ref={firmaEmergenciaRef} label="Firma" /></div>
            </div>
          </div>
        </SeccionDesplegable>

        <SeccionDesplegable titulo="11. Cierre" defaultAbierto={true}>
          <div style={styles.grid2}>
            <RadioGroup label="¿Tarea terminada?" name="tarea_terminada" options={['SI', 'NO']} />
            <RadioGroup label="¿Orden y aseo?" name="orden_aseo_realizado" options={['SI', 'NO']} />
            <RadioGroup label="¿Incidentes?" name="hubo_incidentes" options={['SI', 'NO']} />
          </div>
          <div style={{ ...styles.grid3, marginTop: '20px' }}>
            <div style={styles.inputGroup}><label>Nombre Cierre:</label> <input type="text" name="nombre_cierre" value={formData.nombre_cierre} onChange={handleChange} style={styles.input} /></div>
            <div style={styles.inputGroup}><label>Cargo Cierre:</label> <input type="text" name="cargo_cierre" value={formData.cargo_cierre} onChange={handleChange} style={styles.input} /></div>
            <div style={styles.inputGroup}><label>Hora Cierre:</label> <input type="time" name="hora_cierre" value={formData.hora_cierre} onChange={handleChange} style={styles.input} /></div>
          </div>
          <div style={{ ...styles.inputGroup, marginTop: '15px' }}><label>Motivo:</label> <input type="text" name="motivo_cierre" value={formData.motivo_cierre} onChange={handleChange} style={styles.input} /></div>
          <div style={{ ...styles.inputGroup, marginTop: '15px' }}><label>Observaciones Finales:</label> <textarea name="observaciones_finales" value={formData.observaciones_finales} onChange={handleChange} style={styles.textarea} rows={2}></textarea></div>
          <div style={{ ...styles.firmaBox, marginTop: '20px', maxWidth: '400px' }}>
            <h5 style={{ margin: '0 0 10px 0' }}>Firma Cierre</h5>
            <SignaturePad ref={firmaCierreRef} label="Firma" />
          </div>
        </SeccionDesplegable>

        <button type="submit" disabled={loading} style={styles.btnSubmit}>
          {loading ? 'Generando...' : 'Generar Permiso'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  card: { background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  cardHeader: { background: '#f8fafc', padding: '15px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
  cardBody: { padding: '20px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column' as const, gap: '5px' },
  input: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' },
  textarea: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', width: '100%', boxSizing: 'border-box' as const },
  checkLabel: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' },
  radioRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' },
  subTitle: { margin: '10px 0', color: '#475569', fontSize: '15px', fontWeight: '600' },
  hr: { border: 'none', borderTop: '1px solid #e5e7eb', margin: '20px 0' },
  firmaBox: { padding: '15px', border: '1px dashed #cbd5e1', borderRadius: '8px', background: '#fcfcfc' },
  btnSecundario: { padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  btnPrimarioChico: { padding: '6px 12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  btnEliminar: { padding: '6px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  btnSubmit: { width: '100%', padding: '15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }
};