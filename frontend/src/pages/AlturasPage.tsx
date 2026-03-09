import { useRef } from 'react';
import type { FormEvent } from 'react';
import SignaturePad, { type SignaturePadHandle } from '../components/SignaturePad';
import CollapsibleSection from '../components/CollapsibleSection';
import RadioGroup from '../components/RadioGroup';
import EjecutoresSection, { type Ejecutor } from '../components/EjecutoresSection';
import { useFormEngine } from '../hooks/useFormEngine';
import { formStyles } from '../styles/formStyles';

interface AlturasPageProps {
  displayName: string;
  onVolver: () => void;
  onSesionExpirada: () => void;
}

export default function AlturasPage({ displayName, onVolver, onSesionExpirada }: AlturasPageProps) {
  const hoy = new Date().toISOString().split('T')[0];

  const initialData = {
    fecha_permiso: hoy,
    hora_inicio: '',
    hora_fin: '',
    area_trabajo: '',
    ubicacion_trabajo: '',
    altura_maxima: '',
    chk_mantenimiento: false,
    chk_almacenamiento: false,
    chk_instalacion: false,
    chk_supervicion: false,
    chk_orden: false,
    chk_izaje: false,
    chk_arme: false,
    otros_trabajos: '',
    descripcion_trabajo: '',
    ejecutores: [{ nombres: '', doc: '', cargo: '', examen: '', certificado: '', ss: '', anclajes: '', alcohol: '' }],
    permiso_caliente: '',
    permiso_confinados: '',
    permiso_electrico: '',
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
    epp_casco: '',
    epp_gafas: '',
    epp_dotacion: '',
    epp_guantes: '',
    epp_calzado: '',
    otros_elementos: '',
    anclaje_fijo: '', est_anclaje_fijo: '', obs_anclaje_fijo: '',
    arnes: '', est_arnes: '', obs_arnes: '',
    anclaje_movil: '', est_anclaje_movil: '', obs_anclaje_movil: '',
    mosquetones: '', est_mosquetones: '', obs_mosquetones: '',
    eslinga_detencion: '', est_eslinga_detencion: '', obs_eslinga_detencion: '',
    frenos: '', est_frenos: '', obs_frenos: '',
    eslinga_posicionamiento: '', est_eslinga_posicionamiento: '', obs_eslinga_posicionamiento: '',
    lvh_temporal: '', est_lvh_temporal: '', obs_lvh_temporal: '',
    lvv_temporal: '', est_lvv_temporal: '', obs_lvv_temporal: '',
    eslinga_restriccion: '', est_eslinga_restriccion: '', obs_eslinga_restriccion: '',
    otros_equipos: '', estado_otros_equipos: '', obs_otros_equipos: '',
    sistema_utilizar: '', restriccion: '', posicionamiento: '', detencion: '',
    delimitacion_area: '', obs_delimitacion_area: '',
    barandas: '', obs_barandas: '',
    control_acceso: '', obs_control_acceso: '',
    ayudantes_seguridad: '', obs_ayudantes_seguridad: '',
    lineas_advertencia: '', obs_lineas_advertencia: '',
    otros_medidas: '', obs_otros_medidas: '',
    control_huecos: '',
    andamios: '', obs_andamios: '',
    elevadores_personas: '', obs_elevadores_personas: '',
    andamios_colgantes: '', obs_andamios_colgantes: '',
    trabajo_suspension: '', obs_trabajo_suspension: '',
    escaleras_fijas: '', obs_escaleras_fijas: '',
    otros_sistemas: '', obs_otros_sistemas: '',
    escaleras_moviles: '', obs_escaleras_moviles: '',
    herramientas_utilizar: '',
    distancia_Caida_libre: 0,
    altura_trabajador: 0,
    longitud_eslinga: 0,
    absorbedor_choque: 0,
    factor_seguridad: 0.6,
    nombre_responsable_tarea: '', doc_responsable_tarea: '', cargo_responsable_tarea: '',
    nombre_coordinador_altura: '', doc_coordinador_altura: '', cargo_coordinador_altura: '',
    nombre_responsable_emergencia: '', doc_responsable_emergencia: '', cargo_responsable_emergencia: '',
    tarea_terminada: '',
    orden_aseo_realizado: '',
    hubo_incidentes: '',
    nombre_cierre: '',
    cargo_cierre: '',
    fecha_cierre: hoy,
    hora_cierre: '',
    motivo_cierre: '',
    observaciones_finales: '',
  };

  const { formData, loading, alerta, setAlerta, handleChange, handleEjecutorChange, agregarEjecutor, eliminarEjecutor, handleSubmit, firmaResponsableRef, firmaCoordinadorRef, firmaEmergenciaRef, firmaCierreRef, firmasEjecutoresRefs } = useFormEngine({
    initialData,
    onSesionExpirada
  });

  const procesarDatos = (datos: any, refs: any) => {
    ['mantenimiento', 'almacenamiento', 'instalacion', 'supervicion', 'orden', 'izaje', 'arme'].forEach(chk => {
      datos[`chk_${chk}`] = formData[`chk_${chk}`] ? 'X' : '';
    });
    datos['ubicación_trabajo'] = formData.ubicacion_trabajo;
    delete datos.ubicacion_trabajo;
    datos['descripcion_trabajo'] = formData.descripcion_trabajo;
    datos['{{sistema_utilizar}}'] = formData.sistema_utilizar;
    datos['{{restriccion}}'] = formData.restriccion;
    datos['{{posicionamiento}}'] = formData.posicionamiento;
    datos['{{detencion}}'] = formData.detencion;
    datos.ejecutores = formData.ejecutores.map((ejec: Ejecutor, index: number) => {
      const firmaBase64 = refs.firmasEjecutoresRefs.current[index]?.getFirmaBase64();
      return {
        ejecutor_nombres: ejec.nombres,
        ejecutor_doc: ejec.doc,
        ejecutor_cargo: ejec.cargo,
        ejec_examen: ejec.examen,
        ejec_certificado: ejec.certificado,
        ejec_ss: ejec.ss,
        ejec_anclajes: ejec.anclajes,
        ejec_alcohol: ejec.alcohol,
        firma_ejecutor: firmaBase64 ? { firma_base64: firmaBase64 } : null
      };
    });

    const fResp = refs.firmaResponsableRef.current?.getFirmaBase64();
    if (fResp) datos.ImgFirmaResponsableTarea = { firma_base64: fResp };

    const fCoord = refs.firmaCoordinadorRef.current?.getFirmaBase64();
    if (fCoord) datos.ImgFirmaCoordinadorAltura = { firma_base64: fCoord };

    const fEmerg = refs.firmaEmergenciaRef.current?.getFirmaBase64();
    if (fEmerg) datos.ImgFirmaResponsableEmergencia = { firma_base64: fEmerg };

    const fCierre = refs.firmaCierreRef.current?.getFirmaBase64();
    if (fCierre) datos.firma_cierre = { firma_base64: fCierre };

    const alturaLibreR = Number(formData.altura_trabajador) + Number(formData.longitud_eslinga) + Number(formData.absorbedor_choque) + Number(formData.factor_seguridad);
    const distanciaLibreReal = Number(formData.distancia_Caida_libre) - alturaLibreR;

    datos.altura_libre_r = alturaLibreR;
    datos.distancia_libre_real = distanciaLibreReal;
    datos.distancia_real_resultante = distanciaLibreReal;

    return datos;
  };

  const onSubmit = (e: FormEvent) => {
    handleSubmit(e, {
      plantilla: 'ALTURAS.xlsx',
      hoja: 'Permiso de trabajo',
      nombreArchivo: 'Permiso_Alturas_Generado.xlsx',
      procesarDatos
    });
  };

  return (
    <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif', color: '#333' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #e5e7eb', paddingBottom: '15px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#1f2937' }}>Permiso de Trabajo en Alturas</h1>
        <button type="button" onClick={onVolver} style={formStyles.btnSecundario}>Volver al Menú</button>
      </div>

      {alerta && <div style={{ padding: '15px', background: alerta.tipo === 'error' ? '#fee2e2' : '#dcfce7', color: alerta.tipo === 'error' ? '#991b1b' : '#166534', marginBottom: '25px', borderRadius: '6px' }}>{alerta.mensaje}</div>}

      <form onSubmit={onSubmit}>
        <CollapsibleSection titulo="1. Información General y Ejecutores" defaultAbierto={true} styles={formStyles}>
          <div style={formStyles.grid3}>
            <div style={formStyles.inputGroup}><label>Fecha:</label> <input type="date" name="fecha_permiso" value={formData.fecha_permiso} onChange={handleChange} required style={formStyles.input} /></div>
            <div style={formStyles.inputGroup}><label>Hora Inicio:</label> <input type="time" name="hora_inicio" value={formData.hora_inicio} onChange={handleChange} required style={formStyles.input} /></div>
            <div style={formStyles.inputGroup}><label>Hora Fin:</label> <input type="time" name="hora_fin" value={formData.hora_fin} onChange={handleChange} style={formStyles.input} /></div>
            <div style={formStyles.inputGroup}><label>Área General:</label> <input type="text" name="area_trabajo" value={formData.area_trabajo} onChange={handleChange} required style={formStyles.input} /></div>
            <div style={formStyles.inputGroup}><label>Ubicación Específica:</label> <input type="text" name="ubicacion_trabajo" value={formData.ubicacion_trabajo} onChange={handleChange} required style={formStyles.input} /></div>
            <div style={formStyles.inputGroup}><label>Altura Máx (m):</label> <input type="number" step="0.1" name="altura_maxima" value={formData.altura_maxima} onChange={handleChange} required style={formStyles.input} /></div>
          </div>

          <hr style={formStyles.hr} />
          <h4 style={formStyles.subTitle}>Tipo de Trabajo</h4>
          <div style={formStyles.grid3}>
            <label style={formStyles.checkLabel}><input type="checkbox" name="chk_mantenimiento" checked={formData.chk_mantenimiento} onChange={handleChange} /> Mantenimiento</label>
            <label style={formStyles.checkLabel}><input type="checkbox" name="chk_almacenamiento" checked={formData.chk_almacenamiento} onChange={handleChange} /> Almacenamiento</label>
            <label style={formStyles.checkLabel}><input type="checkbox" name="chk_instalacion" checked={formData.chk_instalacion} onChange={handleChange} /> Instalación</label>
            <label style={formStyles.checkLabel}><input type="checkbox" name="chk_supervicion" checked={formData.chk_supervicion} onChange={handleChange} /> Supervisión</label>
            <label style={formStyles.checkLabel}><input type="checkbox" name="chk_orden" checked={formData.chk_orden} onChange={handleChange} /> Orden y aseo</label>
            <label style={formStyles.checkLabel}><input type="checkbox" name="chk_izaje" checked={formData.chk_izaje} onChange={handleChange} /> Izaje de carga</label>
            <label style={formStyles.checkLabel}><input type="checkbox" name="chk_arme" checked={formData.chk_arme} onChange={handleChange} /> Arme/Desarme</label>
            <div style={formStyles.inputGroup}><label>Otros:</label> <input type="text" name="otros_trabajos" value={formData.otros_trabajos} onChange={handleChange} style={formStyles.input} /></div>
          </div>

          <hr style={formStyles.hr} />
          <div style={formStyles.inputGroup}><label style={{ fontWeight: '600', color: '#374151' }}>Descripción del Trabajo:</label> <textarea name="descripcion_trabajo" value={formData.descripcion_trabajo} onChange={handleChange} style={{...formStyles.textarea, minHeight: '100px'}} placeholder="Describe el trabajo a realizar..." required></textarea></div>

          <hr style={formStyles.hr} />
          <EjecutoresSection
            ejecutores={formData.ejecutores}
            onEjecutorChange={handleEjecutorChange}
            onAgregarEjecutor={agregarEjecutor}
            onEliminarEjecutor={eliminarEjecutor}
            firmasRefs={firmasEjecutoresRefs}
            styles={formStyles}
          />
        </CollapsibleSection>

        <CollapsibleSection titulo="2. Permisos Adicionales" styles={formStyles}>
          <RadioGroup label="¿Permiso en caliente?" name="permiso_caliente" value={formData.permiso_caliente} onChange={handleChange} styles={formStyles} />
          <RadioGroup label="¿Permiso espacios confinados?" name="permiso_confinados" value={formData.permiso_confinados} onChange={handleChange} styles={formStyles} />
          <RadioGroup label="¿Permiso riesgo eléctrico?" name="permiso_electrico" value={formData.permiso_electrico} onChange={handleChange} styles={formStyles} />
        </CollapsibleSection>

        <CollapsibleSection titulo="3. Verificación de Peligros y Riesgos" styles={formStyles}>
          <div style={formStyles.grid2}>
            <RadioGroup label="¿ATS socializado?" name="chk_ats" value={formData.chk_ats} onChange={handleChange} styles={formStyles} />
            <RadioGroup label="¿Socialización de procedimientos?" name="chk_socializacion" value={formData.chk_socializacion} onChange={handleChange} styles={formStyles} />
            <RadioGroup label="¿Condiciones óptimas?" name="chk_optimas" value={formData.chk_optimas} onChange={handleChange} styles={formStyles} />
            <RadioGroup label="¿Área delimitada?" name="chk_delimitado" value={formData.chk_delimitado} onChange={handleChange} styles={formStyles} />
            <RadioGroup label="¿Plan de rescate?" name="chk_rescate" value={formData.chk_rescate} onChange={handleChange} styles={formStyles} />
            <RadioGroup label="¿Coordinador presente?" name="chk_coordinador" value={formData.chk_coordinador} onChange={handleChange} styles={formStyles} />
            <RadioGroup label="¿Clima favorable?" name="chk_clima" value={formData.chk_clima} onChange={handleChange} styles={formStyles} />
            <RadioGroup label="¿Izaje de cargas?" name="chk_izar" value={formData.chk_izar} onChange={handleChange} styles={formStyles} />
            <RadioGroup label="¿Portaherramientas?" name="chk_portaherramienta" value={formData.chk_portaherramienta} onChange={handleChange} styles={formStyles} />
            <RadioGroup label="¿Riesgo eléctrico?" name="chk_electricidad" value={formData.chk_electricidad} onChange={handleChange} styles={formStyles} />
            <RadioGroup label="¿Verificación puntos anclaje?" name="chk_verificacion_puntos_anclajes" value={formData.chk_verificacion_puntos_anclajes} onChange={handleChange} styles={formStyles} />
          </div>
        </CollapsibleSection>

        <CollapsibleSection titulo="4. Elementos de Protección Personal (EPP)" styles={formStyles}>
          <div style={formStyles.grid2}>
            <RadioGroup label="Casco" name="epp_casco" value={formData.epp_casco} onChange={handleChange} styles={formStyles} />
            <RadioGroup label="Gafas" name="epp_gafas" value={formData.epp_gafas} onChange={handleChange} styles={formStyles} />
            <RadioGroup label="Dotación" name="epp_dotacion" value={formData.epp_dotacion} onChange={handleChange} styles={formStyles} />
            <RadioGroup label="Guantes" name="epp_guantes" value={formData.epp_guantes} onChange={handleChange} styles={formStyles} />
            <RadioGroup label="Calzado" name="epp_calzado" value={formData.epp_calzado} onChange={handleChange} styles={formStyles} />
          </div>
          <div style={{ ...formStyles.inputGroup, marginTop: '10px' }}><label>Otros EPP:</label> <input type="text" name="otros_elementos" value={formData.otros_elementos} onChange={handleChange} style={formStyles.input} /></div>
        </CollapsibleSection>

        <CollapsibleSection titulo="5. Equipos de Protección Contra Caídas" styles={formStyles}>
          {['anclaje_fijo', 'arnes', 'anclaje_movil', 'mosquetones', 'eslinga_detencion', 'frenos', 'eslinga_posicionamiento', 'lvh_temporal', 'lvv_temporal', 'eslinga_restriccion'].map(eq => (
            <div key={eq} style={{ marginBottom: '15px', padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
              <RadioGroup label={`¿Usa ${eq.replace(/_/g, ' ')}?`} name={eq} value={formData[eq]} onChange={handleChange} styles={formStyles} />
              <div style={formStyles.grid2}>
                <div style={formStyles.inputGroup}><label>Estado:</label> <select name={`est_${eq}`} value={formData[`est_${eq}`]} onChange={handleChange} style={formStyles.input}><option value="">Seleccionar...</option><option value="Bueno">Bueno</option><option value="Regular">Regular</option><option value="Malo">Malo</option></select></div>
                <div style={formStyles.inputGroup}><label style={{ fontWeight: '600', color: '#374151' }}>Observaciones:</label> <textarea name={`obs_${eq}`} value={formData[`obs_${eq}`]} onChange={handleChange} style={{...formStyles.textarea, minHeight: '70px'}} placeholder="Describe el estado o cualquier observación..."></textarea></div>
              </div>
            </div>
          ))}
          <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
            <div style={formStyles.inputGroup}><label>Otros Equipos:</label> <input type="text" name="otros_equipos" value={formData.otros_equipos} onChange={handleChange} style={formStyles.input} /></div>
            <div style={formStyles.grid2}>
              <div style={formStyles.inputGroup}><label>Estado:</label> <select name="estado_otros_equipos" value={formData.estado_otros_equipos} onChange={handleChange} style={formStyles.input}><option value="">Seleccionar...</option><option value="Bueno">Bueno</option><option value="Regular">Regular</option><option value="Malo">Malo</option></select></div>
              <div style={formStyles.inputGroup}><label style={{ fontWeight: '600', color: '#374151' }}>Observaciones:</label> <textarea name="obs_otros_equipos" value={formData.obs_otros_equipos} onChange={handleChange} style={{...formStyles.textarea, minHeight: '70px'}} placeholder="Describe el estado o cualquier observación..."></textarea></div>
            </div>
          </div>

          <hr style={formStyles.hr} />
          <h4 style={formStyles.subTitle}>Sistema a Utilizar</h4>
          <div style={formStyles.grid2}>
            <div style={formStyles.inputGroup}><label>Sistema a Utilizar:</label> <input type="text" name="sistema_utilizar" value={formData.sistema_utilizar} onChange={handleChange} style={formStyles.input} placeholder="Especifica el sistema" /></div>
            <RadioGroup label="Restriccion" name="restriccion" value={formData.restriccion} onChange={handleChange} options={['SI', 'NO']} styles={formStyles} />
          </div>
          <div style={formStyles.grid2}>
            <RadioGroup label="Posicionamiento" name="posicionamiento" value={formData.posicionamiento} onChange={handleChange} options={['SI', 'NO']} styles={formStyles} />
            <RadioGroup label="Detencion de Caidas" name="detencion" value={formData.detencion} onChange={handleChange} options={['SI', 'NO']} styles={formStyles} />
          </div>
        </CollapsibleSection>

        <CollapsibleSection titulo="6. Medidas de Prevención y Sistemas de Acceso" styles={formStyles}>
          <h4 style={formStyles.subTitle}>Medidas de Prevención</h4>
          {['delimitacion_area', 'barandas', 'control_acceso', 'ayudantes_seguridad', 'lineas_advertencia', 'otros_medidas'].map(med => (
            <div key={med} style={{ marginBottom: '10px' }}>
              <RadioGroup label={`¿${med.replace(/_/g, ' ')}?`} name={med} value={formData[med]} onChange={handleChange} styles={formStyles} />
              <div style={formStyles.inputGroup}><label>Observaciones:</label> <input type="text" name={`obs_${med}`} value={formData[`obs_${med}`]} onChange={handleChange} style={formStyles.input} /></div>
            </div>
          ))}
          <RadioGroup label="Control de huecos" name="control_huecos" value={formData.control_huecos} onChange={handleChange} styles={formStyles} />

          <hr style={formStyles.hr} />
          <h4 style={formStyles.subTitle}>Sistemas de Acceso</h4>
          {['andamios', 'elevadores_personas', 'andamios_colgantes', 'trabajo_suspension', 'escaleras_fijas', 'otros_sistemas', 'escaleras_moviles'].map(sis => (
            <div key={sis} style={{ marginBottom: '10px' }}>
              <RadioGroup label={`¿${sis.replace(/_/g, ' ')}?`} name={sis} value={formData[sis]} onChange={handleChange} styles={formStyles} />
              <div style={formStyles.inputGroup}><label>Observaciones:</label> <input type="text" name={`obs_${sis}`} value={formData[`obs_${sis}`]} onChange={handleChange} style={formStyles.input} /></div>
            </div>
          ))}
        </CollapsibleSection>

        <CollapsibleSection titulo="7. Herramientas y Claridad de Caída" styles={formStyles}>
          <div style={formStyles.inputGroup}><label>Herramientas a utilizar:</label> <textarea name="herramientas_utilizar" value={formData.herramientas_utilizar} onChange={handleChange} style={formStyles.textarea} rows={3}></textarea></div>
          <hr style={formStyles.hr} />
          <h4 style={formStyles.subTitle}>Cálculo Claridad de Caída</h4>
          <div style={formStyles.grid3}>
            <div style={formStyles.inputGroup}><label>Distancia Caída Libre (F):</label> <input type="number" step="0.1" name="distancia_Caida_libre" value={formData.distancia_Caida_libre} onChange={handleChange} style={formStyles.input} /></div>
            <div style={formStyles.inputGroup}><label>Altura Trabajador (A):</label> <input type="number" step="0.1" name="altura_trabajador" value={formData.altura_trabajador} onChange={handleChange} style={formStyles.input} /></div>
            <div style={formStyles.inputGroup}><label>Longitud Eslinga (B):</label> <input type="number" step="0.1" name="longitud_eslinga" value={formData.longitud_eslinga} onChange={handleChange} style={formStyles.input} /></div>
            <div style={formStyles.inputGroup}><label>Absorbedor (C):</label> <input type="number" step="0.1" name="absorbedor_choque" value={formData.absorbedor_choque} onChange={handleChange} style={formStyles.input} /></div>
            <div style={formStyles.inputGroup}><label>Factor Seguridad (D):</label> <input type="number" step="0.1" name="factor_seguridad" value={formData.factor_seguridad} onChange={handleChange} style={formStyles.input} /></div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection titulo="8. Firmas de Autorización" styles={formStyles}>
          <div style={formStyles.grid3}>
            <div style={formStyles.firmaBox}>
              <h5 style={{ margin: '0 0 10px 0' }}>Responsable Tarea</h5>
              <input type="text" name="nombre_responsable_tarea" placeholder="Nombre" value={formData.nombre_responsable_tarea} onChange={handleChange} style={formStyles.input} required />
              <input type="text" name="doc_responsable_tarea" placeholder="Documento" value={formData.doc_responsable_tarea} onChange={handleChange} style={{ ...formStyles.input, marginTop: '5px' }} required />
              <input type="text" name="cargo_responsable_tarea" placeholder="Cargo" value={formData.cargo_responsable_tarea} onChange={handleChange} style={{ ...formStyles.input, marginTop: '5px' }} required />
              <div style={{ marginTop: '10px' }}><SignaturePad ref={firmaResponsableRef} label="Firma" /></div>
            </div>
            <div style={formStyles.firmaBox}>
              <h5 style={{ margin: '0 0 10px 0' }}>Coordinador Altura</h5>
              <input type="text" name="nombre_coordinador_altura" placeholder="Nombre" value={formData.nombre_coordinador_altura} onChange={handleChange} style={formStyles.input} required />
              <input type="text" name="doc_coordinador_altura" placeholder="Documento" value={formData.doc_coordinador_altura} onChange={handleChange} style={{ ...formStyles.input, marginTop: '5px' }} required />
              <input type="text" name="cargo_coordinador_altura" placeholder="Cargo" value={formData.cargo_coordinador_altura} onChange={handleChange} style={{ ...formStyles.input, marginTop: '5px' }} required />
              <div style={{ marginTop: '10px' }}><SignaturePad ref={firmaCoordinadorRef} label="Firma" /></div>
            </div>
            <div style={formStyles.firmaBox}>
              <h5 style={{ margin: '0 0 10px 0' }}>Emergencia</h5>
              <input type="text" name="nombre_responsable_emergencia" placeholder="Nombre" value={formData.nombre_responsable_emergencia} onChange={handleChange} style={formStyles.input} required />
              <input type="text" name="doc_responsable_emergencia" placeholder="Documento" value={formData.doc_responsable_emergencia} onChange={handleChange} style={{ ...formStyles.input, marginTop: '5px' }} required />
              <input type="text" name="cargo_responsable_emergencia" placeholder="Cargo" value={formData.cargo_responsable_emergencia} onChange={handleChange} style={{ ...formStyles.input, marginTop: '5px' }} required />
              <div style={{ marginTop: '10px' }}><SignaturePad ref={firmaEmergenciaRef} label="Firma" /></div>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection titulo="9. Cierre" defaultAbierto={true} styles={formStyles}>
          <div style={formStyles.grid2}>
            <RadioGroup label="¿Tarea terminada?" name="tarea_terminada" value={formData.tarea_terminada} onChange={handleChange} options={['SI', 'NO']} styles={formStyles} />
            <RadioGroup label="¿Orden y aseo?" name="orden_aseo_realizado" value={formData.orden_aseo_realizado} onChange={handleChange} options={['SI', 'NO']} styles={formStyles} />
            <RadioGroup label="¿Incidentes?" name="hubo_incidentes" value={formData.hubo_incidentes} onChange={handleChange} options={['SI', 'NO']} styles={formStyles} />
          </div>
          <div style={{ ...formStyles.grid3, marginTop: '20px' }}>
            <div style={formStyles.inputGroup}><label>Nombre Cierre:</label> <input type="text" name="nombre_cierre" value={formData.nombre_cierre} onChange={handleChange} style={formStyles.input} /></div>
            <div style={formStyles.inputGroup}><label>Cargo Cierre:</label> <input type="text" name="cargo_cierre" value={formData.cargo_cierre} onChange={handleChange} style={formStyles.input} /></div>
            <div style={formStyles.inputGroup}><label>Hora Cierre:</label> <input type="time" name="hora_cierre" value={formData.hora_cierre} onChange={handleChange} style={formStyles.input} /></div>
          </div>
          <div style={{ ...formStyles.inputGroup, marginTop: '15px' }}><label>Motivo:</label> <input type="text" name="motivo_cierre" value={formData.motivo_cierre} onChange={handleChange} style={formStyles.input} /></div>
          <div style={{ ...formStyles.inputGroup, marginTop: '15px' }}><label>Observaciones Finales:</label> <textarea name="observaciones_finales" value={formData.observaciones_finales} onChange={handleChange} style={formStyles.textarea} rows={2}></textarea></div>
          <div style={{ ...formStyles.firmaBox, marginTop: '20px', maxWidth: '400px' }}>
            <h5 style={{ margin: '0 0 10px 0' }}>Firma Cierre</h5>
            <SignaturePad ref={firmaCierreRef} label="Firma" />
          </div>
        </CollapsibleSection>

        <button type="submit" disabled={loading} style={formStyles.btnSubmit}>
          {loading ? 'Generando...' : 'Generar Permiso'}
        </button>
      </form>
    </div>
  );
}
