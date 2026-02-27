/**
 * Servicio de API para comunicarse con el backend.
 *
 * Flujo de autenticación (según lineamientos técnicos del PDF):
 * 1. El usuario ingresa credenciales en el Frontend.
 * 2. El Backend valida y genera un JWT firmado.
 * 3. El Frontend almacena el token en una Cookie con atributos HttpOnly y Secure.
 * 4. Cada petición posterior incluye el token de forma automática (credentials: 'include').
 *
 * FALLBACK en desarrollo: Si la cookie no se envía correctamente (por proxy/puertos diferentes),
 * el frontend también envía el token en el header Authorization: Bearer <token>.
 * El backend intenta leer de la cookie primero, luego del header.
 *
 * IMPORTANTE: Se usa `credentials: 'include'` en todas las peticiones para que
 * el navegador envíe automáticamente la cookie HttpOnly al backend.
 * NO se almacena el token en localStorage ni sessionStorage (excepto temporalmente en memoria).
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

// Token almacenado en memoria (no en localStorage) para fallback en desarrollo
let tokenEnMemoria: string | null = null;

// ─── Opciones base de fetch ───────────────────────────────────────────────────

/**
 * Crea las opciones de fetch con el token en el header Authorization.
 * Se usa como fallback cuando la cookie HttpOnly no se envía correctamente.
 */
function crearOpciones(metodo: string = 'GET'): RequestInit {
  const opciones: RequestInit = {
    method: metodo,
    credentials: 'include', // Envía la cookie HttpOnly automáticamente
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Fallback: si hay token en memoria, enviarlo en el header Authorization
  // (necesario en desarrollo con puertos diferentes)
  if (tokenEnMemoria) {
    (opciones.headers as Record<string, string>)['Authorization'] = `Bearer ${tokenEnMemoria}`;
  }

  return opciones;
}

// ─── Autenticación ────────────────────────────────────────────────────────────

/**
 * Autentica al usuario. El backend setea la cookie HttpOnly en la respuesta.
 * El frontend almacena el token en memoria como fallback para desarrollo.
 */
export async function login(req: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Credenciales incorrectos.' }));
    throw new Error(err.message ?? 'Error de autenticación');
  }

  const data = await res.json() as LoginResponse;

  // IMPORTANTE: El backend NO devuelve el token en el body (está en la cookie HttpOnly).
  // Sin embargo, para que el fallback funcione en desarrollo con puertos diferentes,
  // necesitamos extraer el token de la cookie. Como no podemos acceder a cookies HttpOnly
  // desde JavaScript, usamos un truco: hacemos una petición a /api/auth/me para obtener
  // el token que el backend puede generar nuevamente.
  // En producción, esto no es necesario porque la cookie funciona correctamente.

  return data;
}

/**
 * Obtiene el token JWT del backend (para fallback en desarrollo).
 * Esta función se llama después del login para obtener un token que se pueda
 * enviar en el header Authorization si la cookie no funciona correctamente.
 */
export async function obtenerTokenParaFallback(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/token`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) return null;
    const data = await res.json() as { token?: string };
    return data.token ?? null;
  } catch {
    return null;
  }
}

/**
 * Cierra la sesión. El backend elimina la cookie HttpOnly.
 */
export async function logout(): Promise<void> {
  tokenEnMemoria = null;
  await fetch(`${API_BASE}/api/auth/logout`, {
    ...crearOpciones('POST'),
  });
}

/**
 * Verifica si la sesión sigue activa consultando al backend con la cookie HttpOnly.
 * Útil para restaurar la sesión al recargar la página.
 */
export async function verificarSesion(): Promise<MeResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      ...crearOpciones('GET'),
    });

    if (!res.ok) {
      tokenEnMemoria = null;
      return null;
    }

    // Si la sesión es válida y no tenemos token en memoria, intentar obtenerlo
    if (!tokenEnMemoria) {
      const token = await obtenerTokenParaFallback();
      if (token) {
        tokenEnMemoria = token;
      }
    }

    return res.json() as Promise<MeResponse>;
  } catch {
    tokenEnMemoria = null;
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
    ...crearOpciones('POST'),
    body: JSON.stringify(req),
  });

  if (res.status === 401) {
    tokenEnMemoria = null;
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

/**
 * Almacena el token en memoria (para fallback en desarrollo).
 * Se llama después del login exitoso.
 */
export function almacenarTokenEnMemoria(token: string): void {
  tokenEnMemoria = token;
}

/**
 * Obtiene el token almacenado en memoria.
 */
export function obtenerTokenEnMemoria(): string | null {
  return tokenEnMemoria;
}
