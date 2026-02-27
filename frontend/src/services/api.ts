/**
 * Servicio de API para comunicarse con el backend.
 *
 * Flujo de autenticación (según lineamientos técnicos del PDF):
 * 1. El usuario ingresa credenciales en el Frontend.
 * 2. El Backend valida y genera un JWT firmado.
 * 3. El Frontend almacena el token en una Cookie con atributos HttpOnly y Secure.
 * 4. Cada petición posterior incluye el token de forma automática (credentials: 'include').
 *
 * IMPORTANTE: Se usa `credentials: 'include'` en todas las peticiones para que
 * el navegador envíe automáticamente la cookie HttpOnly al backend.
 * NO se almacena el token en localStorage ni sessionStorage.
 */

import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  GenerarDocumentoRequest,
} from '../types/api';

// En desarrollo con Vite, el proxy redirige /api → http://localhost:5205/api
// Esto permite que las cookies HttpOnly funcionen como same-origin.
// En producción, cambiar a la URL del servidor o dejar vacío si están en el mismo dominio.
const API_BASE = '';

// ─── Opciones base de fetch ───────────────────────────────────────────────────

/**
 * Opciones comunes para todas las peticiones al backend.
 * `credentials: 'include'` es fundamental para que el navegador envíe
 * automáticamente la cookie HttpOnly en cada petición.
 */
const baseOptions: RequestInit = {
  credentials: 'include', // Envía la cookie HttpOnly automáticamente
  headers: {
    'Content-Type': 'application/json',
  },
};

// ─── Autenticación ────────────────────────────────────────────────────────────

/**
 * Autentica al usuario. El backend setea la cookie HttpOnly en la respuesta.
 * El frontend NO necesita manejar el token directamente.
 */
export async function login(req: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    ...baseOptions,
    method: 'POST',
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Credenciales incorrectas.' }));
    throw new Error(err.message ?? 'Error de autenticación');
  }

  return res.json() as Promise<LoginResponse>;
}

/**
 * Cierra la sesión. El backend elimina la cookie HttpOnly.
 */
export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/api/auth/logout`, {
    ...baseOptions,
    method: 'POST',
  });
}

/**
 * Verifica si la sesión sigue activa consultando al backend con la cookie HttpOnly.
 * Útil para restaurar la sesión al recargar la página.
 */
export async function verificarSesion(): Promise<MeResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      ...baseOptions,
      method: 'GET',
    });

    if (!res.ok) return null;
    return res.json() as Promise<MeResponse>;
  } catch {
    return null;
  }
}

// ─── Motor Agnóstico ──────────────────────────────────────────────────────────

/**
 * Llama al único endpoint del motor agnóstico.
 * El backend itera sobre las llaves del JSON e inyecta los valores
 * en los placeholders {{llave}} de la plantilla Excel.
 *
 * Retorna un Blob con el archivo Excel generado para descarga.
 */
export async function generarDocumento(req: GenerarDocumentoRequest): Promise<Blob> {
  const res = await fetch(`${API_BASE}/api/documentos/generar`, {
    ...baseOptions,
    method: 'POST',
    body: JSON.stringify(req),
  });

  if (res.status === 401) {
    throw new Error('SESION_EXPIRADA');
  }

  if (!res.ok) {
    const texto = await res.text();
    throw new Error(texto || `Error ${res.status}`);
  }

  return res.blob();
}

/**
 * Descarga un Blob como archivo en el navegador.
 */
export function descargarBlob(blob: Blob, nombreArchivo: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
