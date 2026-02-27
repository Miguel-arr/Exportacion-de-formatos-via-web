/**
 * Servicio de API para comunicarse con el backend.
 *
 * Flujo de autenticación:
 * 1. El usuario ingresa credenciales en el Frontend.
 * 2. El Backend valida y genera un JWT firmado.
 * 3. El Frontend almacena el token en localStorage (para desarrollo) y en cookie HttpOnly (para producción).
 * 4. Cada petición posterior incluye el token en el header Authorization: Bearer <token>.
 *
 * NOTA: En desarrollo, usamos localStorage por simplicidad. En producción con HTTPS,
 * cambiar a cookies HttpOnly únicamente para máxima seguridad.
 */

import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  GenerarDocumentoRequest,
} from '../types/api';

// En desarrollo con Vite, el proxy redirige /api → http://localhost:5205/api
const API_BASE = '';

// Clave para almacenar el token en localStorage
const TOKEN_STORAGE_KEY = 'jwt_token';

// ─── Gestión de tokens ───────────────────────────────────────────────────────

/**
 * Almacena el token en localStorage.
 */
export function almacenarToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

/**
 * Obtiene el token desde localStorage.
 */
export function obtenerToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Elimina el token de localStorage.
 */
export function eliminarToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Crea las opciones de fetch con el token en el header Authorization.
 */
function crearOpciones(metodo: string = 'GET'): RequestInit {
  const opciones: RequestInit = {
    method: metodo,
    credentials: 'include', // Envía cookies si existen
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Agregar el token al header Authorization si existe
  const token = obtenerToken();
  if (token) {
    (opciones.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  return opciones;
}

// ─── Autenticación ────────────────────────────────────────────────────────────

/**
 * Autentica al usuario. El backend devuelve el JWT en el body.
 * El frontend lo almacena en localStorage para usarlo en peticiones posteriores.
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

  const data = await res.json() as LoginResponse & { token?: string };

  // Almacenar el token en localStorage
  if (data.token) {
    almacenarToken(data.token);
  }

  return data;
}

/**
 * Cierra la sesión. Elimina el token de localStorage.
 */
export async function logout(): Promise<void> {
  eliminarToken();
  await fetch(`${API_BASE}/api/auth/logout`, {
    ...crearOpciones('POST'),
  }).catch(() => {
    // Ignorar errores en logout
  });
}

/**
 * Verifica si la sesión sigue activa consultando al backend.
 * Útil para restaurar la sesión al recargar la página.
 */
export async function verificarSesion(): Promise<MeResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      ...crearOpciones('GET'),
    });

    if (!res.ok) {
      eliminarToken();
      return null;
    }

    return res.json() as Promise<MeResponse>;
  } catch {
    eliminarToken();
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
    eliminarToken();
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
