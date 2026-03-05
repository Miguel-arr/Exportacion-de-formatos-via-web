/**
 * Tipos TypeScript para los contratos JSON del motor agnóstico.
 * Asegura que los objetos JSON enviados coincidan estrictamente
 * con los placeholders del motor (lineamientos técnicos del PDF).
 */

// ─── Autenticación ────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  username: string;
  displayName: string;
  token?: string;
}

export interface MeResponse {
  username: string;
  displayName: string;
}

// ─── Motor Agnóstico ──────────────────────────────────────────────────────────

/**
 * Contrato del motor agnóstico.
 * "plantilla" y "hoja" identifican el archivo Excel en el servidor.
 * "datos" es un JSON libre: las llaves deben coincidir con los
 * {{placeholders}} que estén en la plantilla Excel.
 *
 * Ejemplo:
 * {
 *   "plantilla": "ALTURAS.xlsx",
 *   "hoja": "Permiso de trabajo",
 *   "datos": {
 *     "fecha_expedicion": "25/02/2026",
 *     "nombre_coordinador": "Juan Pérez",
 *     "es_apto": "X",
 *     "FIRMA_RESPONSABLE": { "firma_base64": "data:image/png;base64,..." }
 *   }
 * }
 */
export interface GenerarDocumentoRequest {
  plantilla: string;
  hoja: string;
  datos: Record<string, DatoValor>;
}

/**
 * Un valor en el JSON de datos puede ser:
 * - string: para placeholders simples ({{llave}} → "valor")
 * - FirmaBase64: para campos de firma digital ({{FIRMA_CAMPO}} → imagen PNG)
 * - DatoItem[]: para listas dinámicas (Fila Semilla con InsertRowsBelow)
 */
export type DatoValor = string | FirmaBase64 | DatoItem[];

/**
 * Objeto de firma digital.
 * El backend identifica este tipo por la presencia de "firma_base64",
 * decodifica el Base64 e inyecta la imagen en el Excel usando AddPicture().
 */
export interface FirmaBase64 {
  firma_base64: string; // string Base64 (PNG) generado por react-signature-canvas
}

/**
 * Elemento de una lista dinámica.
 * Cada objeto del array corresponde a una fila clonada desde la Fila Semilla.
 */
export type DatoItem = Record<string, string>;

// ─── Datos específicos de formularios ────────────────────────────────────────

/**
 * Datos del formulario Permiso de Trabajo en Alturas.
 * Las llaves deben coincidir con los {{placeholders}} en ALTURAS.xlsx.
 */
export interface DatosAlturas {
  fecha_permiso: string;
  hora_inicio: string;
  area_trabajo: string;
  altura_maxima: string;
  firma_responsable?: FirmaBase64;
}

/**
 * Datos del formulario Registro de Asistencia.
 * Las llaves deben coincidir con los {{placeholders}} en ASISTENCIA.xlsx.
 */
export interface DatosAsistencia {
  fecha: string;
  hora_entrada: string;
  hora_salida: string;
  nombre_trabajador: string;
  departamento: string;
  observaciones?: string;
}
