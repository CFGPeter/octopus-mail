// Spanish translations: platform. Keys are the English source strings used with t() / tp().
import type { Dictionary } from '../../i18n'

const dict: Dictionary = {
  strings: {
    // src/main/index.ts — window, context menu, notifications, tray
    'Octopus Mail — DEMO (test profile)': 'Octopus Mail — DEMO (perfil de prueba)',
    'Add to dictionary': 'Añadir al diccionario',
    'Copy link': 'Copiar enlace',
    Cut: 'Cortar',
    Copy: 'Copiar',
    Paste: 'Pegar',
    'Paste as plain text': 'Pegar como texto sin formato',
    'Octopus Mail — home server connected': 'Octopus Mail — servidor doméstico conectado',
    'Octopus Mail — no connection to the home server': 'Octopus Mail — sin conexión con el servidor doméstico',
    '⏰ Reminder': '⏰ Recordatorio',
    '(no subject)': '(sin asunto)',
    Calendar: 'Calendario',
    'Octopus Mail — {n} unread': 'Octopus Mail — no leídos: {n}',
    'The home server has no OAuth Client ID set (Settings → Accounts → OAuth).': 'El servidor doméstico no tiene un OAuth Client ID configurado (Ajustes → Cuentas → OAuth).',
    "Couldn't determine the account's email address": 'No se pudo determinar la dirección de correo de la cuenta',
    'The app is not connected to a home server': 'La aplicación no está conectada a un servidor doméstico',
    'Open Octopus Mail': 'Abrir Octopus Mail',
    'New message': 'Nuevo mensaje',
    'Sync now': 'Sincronizar ahora',
    Quit: 'Salir',

    // src/main/backend.ts and src/server/server.ts — errors
    'Unknown method {method}': 'Método desconocido {method}',
    'Method {method} does not support streaming': 'El método {method} no admite transmisión en continuo',
    "Can't reach the home server ({url}): {error}": 'No se puede conectar con el servidor doméstico ({url}): {error}',
    'The home server rejected this device — pair it again (Settings → Home server).': 'El servidor doméstico rechazó este dispositivo — vuelve a emparejarlo (Ajustes → Servidor doméstico).',
    "The server didn't return the attachment (HTTP {status})": 'El servidor no devolvió el adjunto (HTTP {status})',
    'attachment-{id}': 'adjunto-{id}',
    "Can't connect to {url}: {error}": 'No se puede conectar con {url}: {error}',
    '{url} is not an Octopus Mail server': '{url} no es un servidor de Octopus Mail',
    'Pairing failed (HTTP {status})': 'Falló el emparejamiento (HTTP {status})',
    'Request too large': 'Solicitud demasiado grande',
    'Too many failed attempts — wait 10 minutes': 'Demasiados intentos fallidos — espera 10 minutos',
    'Invalid or expired pairing code': 'Código de emparejamiento no válido o caducado',
    'The web interface is not available in this installation.': 'La interfaz web no está disponible en esta instalación.',
    'Not authorized — pair this device with the server': 'Sin autorización — empareja este dispositivo con el servidor',
    'Missing X-Octo header': 'Falta el encabezado X-Octo',
    'Not found': 'No encontrado',
    file: 'archivo',

    // src/server — default device names, sign-in page
    Computer: 'Computadora',
    Device: 'Dispositivo',
    Phone: 'Teléfono',
    Browser: 'Navegador',
    'Octopus Mail — sign in': 'Octopus Mail — iniciar sesión',
    'Enter the pairing code from your home server.': 'Introduce el código de emparejamiento de tu servidor doméstico.',
    'New code:': 'Código nuevo:',
    Connect: 'Conectar',
    'Too many attempts — wait 10 minutes.': 'Demasiados intentos — espera 10 minutos.',
    'Invalid or expired code.': 'Código no válido o caducado.',

    // src/shared/when.ts — presets and formatWhen()
    'Later today': 'Más tarde hoy',
    'This evening': 'Esta noche',
    Tomorrow: 'Mañana',
    'Tomorrow evening': 'Mañana por la noche',
    'This weekend': 'Este fin de semana',
    'Next week': 'La próxima semana',
    'Later this week': 'Más tarde esta semana',
    'In a month': 'En un mes',
    Someday: 'Algún día',
    'today {time}': 'hoy {time}',
    'tomorrow {time}': 'mañana {time}',
  },
  plurals: {
    '{n} new message': ['{n} mensaje nuevo', '{n} mensajes nuevos', '{n} mensajes nuevos'],
    '{n} unread': ['{n} no leído', '{n} no leídos', '{n} no leídos'],
  },
}
export default dict
