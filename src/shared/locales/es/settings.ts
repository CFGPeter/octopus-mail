// Spanish translations: settings. Keys are the English source strings used with t() / tp().
import type { Dictionary } from '../../i18n'

const dict: Dictionary = {
  strings: {
    // tabs and window
    'Accounts': 'Cuentas',
    'Appearance & general': 'Apariencia y general',
    'Inbox & Gatekeeper': 'Bandeja y Gatekeeper',
    'Notifications': 'Notificaciones',
    'Signatures': 'Firmas',
    'Templates': 'Plantillas',
    'Rules': 'Reglas',
    'AI agents & CLI': 'Agentes de IA y CLI',
    'Calendars': 'Calendarios',
    'Home server': 'Servidor doméstico',
    'Keyboard shortcuts': 'Atajos de teclado',
    'About': 'Acerca de',
    'Settings': 'Ajustes',
    'Close': 'Cerrar',

    // agent access levels
    'No access': 'Sin acceso',
    'Read only': 'Solo lectura',
    'Triage (drafts, actions)': 'Organización (borradores, acciones)',
    'Send (+ calendar)': 'Envío (+ calendario)',

    // accounts
    'Mail accounts': 'Cuentas de correo',
    'Passwords are stored {where}, not in the app database.': 'Las contraseñas se guardan {where}, no en la base de datos de la aplicación.',
    'password': 'contraseña',
    'synced {when}': 'sincronizada {when}',
    'not synced yet': 'aún sin sincronizar',
    'Aliases:': 'Alias:',
    'Signature': 'Firma',
    'No signature': 'Sin firma',
    'Edit': 'Editar',
    'Add account': 'Añadir cuenta',
    'OAuth sign-in (optional)': 'Inicio de sesión OAuth (opcional)',
    'Your own Google/Microsoft app IDs for signing in without a password and for Google Calendar access.':
      'Tus propios identificadores de aplicación de Google/Microsoft para iniciar sesión sin contraseña y acceder a Google Calendar.',
    'Saved': 'Guardado',
    'Save': 'Guardar',
    'Account {email}': 'Cuenta {email}',
    'Remove the account {email} from Octopus Mail? Your mail on the server stays untouched.':
      '¿Quitar la cuenta {email} de Octopus Mail? Tu correo en el servidor no se modifica.',
    'Remove account': 'Quitar cuenta',
    'Cancel': 'Cancelar',
    'Sender name': 'Nombre del remitente',
    'Color': 'Color',
    'New password (leave empty to keep the current one)': 'Contraseña nueva (déjala vacía para conservar la actual)',
    'Sync history (days)': 'Historial a sincronizar (días)',
    'Smart (people and priority senders)': 'Inteligente (personas y remitentes prioritarios)',
    'All': 'Todos',
    'Off': 'Desactivado',
    'Add alias (sender address)': 'Añadir alias (dirección del remitente)',
    'e.g. office@yourcompany.com': 'p. ej. oficina@tuempresa.com',
    'Account enabled': 'Cuenta activada',
    'A disabled account is not synced.': 'Una cuenta desactivada no se sincroniza.',
    'Servers': 'Servidores',
    'IMAP port': 'Puerto IMAP',
    'SMTP port': 'Puerto SMTP',
    'Username': 'Nombre de usuario',

    // appearance & general
    'Appearance': 'Apariencia',
    'Language': 'Idioma',
    'The window reloads to apply the language.': 'La ventana se recarga para aplicar el idioma.',
    'Automatic (system language)': 'Automático (idioma del sistema)',
    'Theme': 'Tema',
    'Match system': 'Igual que el sistema',
    'Light': 'Claro',
    'Dark': 'Oscuro',
    'List density': 'Densidad de la lista',
    'Comfortable (with preview)': 'Cómoda (con vista previa)',
    'Compact': 'Compacta',
    'Startup': 'Inicio',
    'Launch when Windows starts': 'Iniciar al arrancar Windows',
    'Snoozed messages, reminders and scheduled sends then work without opening the window.':
      'Así los mensajes pospuestos, los recordatorios y los envíos programados funcionan sin abrir la ventana.',
    'Closing the window keeps the app running in the tray': 'Al cerrar la ventana, la aplicación sigue en la bandeja del sistema',
    'Sending': 'Envío',
    'Default sending account': 'Cuenta de envío predeterminada',
    'Last used': 'La última usada',
    'Undo send window: {n} s': 'Tiempo para deshacer el envío: {n} s',

    // inbox & gatekeeper
    'Automatically sorts mail into People, Notifications and Newsletters (based on headers, Gmail categories and your choices).':
      'Clasifica automáticamente el correo en Personas, Notificaciones y Boletines (según los encabezados, las categorías de Gmail y tus decisiones).',
    'Turn on Smart Inbox': 'Activar Smart Inbox',
    'Group notifications into one card': 'Agrupar notificaciones en una sola tarjeta',
    'Group newsletters into one card': 'Agrupar boletines en una sola tarjeta',
    'Mark as read when opened': 'Marcar como leído al abrir',
    'Gatekeeper': 'Gatekeeper',
    'New senders (people who have never received an email from you) wait in a separate section until you accept or block them.':
      'Los remitentes nuevos (personas que nunca han recibido un correo tuyo) esperan en una sección aparte hasta que los aceptes o los bloquees.',
    'Screen new senders before they reach the Inbox': 'Revisar a los remitentes nuevos antes de que lleguen a Recibidos',
    'Privacy': 'Privacidad',
    'Remote images in messages': 'Imágenes remotas en los mensajes',
    'Only from people I know': 'Solo de personas que conozco',
    'Always': 'Siempre',
    'Never (ask)': 'Nunca (preguntar)',
    'Block tracking pixels': 'Bloquear píxeles de seguimiento',
    'Removes the invisible images senders use to check whether you have read their message.':
      'Elimina las imágenes invisibles que los remitentes usan para comprobar si has leído su mensaje.',
    'Snooze & reminders': 'Pospuestos y recordatorios',
    '“Morning” hour': 'Hora de «mañana»',
    '“Evening” hour': 'Hora de «tarde-noche»',
    'Downloading': 'Descarga',
    'Download message content from the last (days)': 'Descargar el contenido de los mensajes de los últimos (días)',
    'For full-text search and offline AI. Older content is downloaded when you open a message.':
      'Para la búsqueda de texto completo y la IA sin conexión. El contenido más antiguo se descarga al abrir un mensaje.',

    // notifications
    'System notifications': 'Notificaciones del sistema',
    'Show notifications for new mail': 'Mostrar notificaciones de correo nuevo',
    'Notification sound': 'Sonido de notificación',
    'Mode per account': 'Modo por cuenta',
    '“Smart” = only messages from people and priority senders, no newsletters or automated mail.':
      '«Inteligente» = solo mensajes de personas y remitentes prioritarios, sin boletines ni correo automático.',
    'Smart': 'Inteligente',

    // signatures
    'Choose the default signature for an account in the Accounts tab. You can use plain text or HTML.':
      'La firma predeterminada de cada cuenta se elige en la pestaña Cuentas. Puedes usar texto sin formato o HTML.',
    'Delete this signature?': '¿Eliminar esta firma?',
    'My signature': 'Mi firma',
    'New signature': 'Firma nueva',
    'Name': 'Nombre',
    'Content (text or HTML)': 'Contenido (texto o HTML)',
    'Preview:': 'Vista previa:',

    // templates (the {{…}} field names stay in English)
    'Type fields to fill in as {field}. Automatic: {auto1}, {auto2}, {auto3}.':
      'Escribe los campos por completar como {field}. Automáticos: {auto1}, {auto2}, {auto3}.',
    'Field name': 'Nombre del campo',
    'fields: {list}': 'campos: {list}',
    'Delete this template?': '¿Eliminar esta plantilla?',
    'New template': 'Plantilla nueva',
    'Template': 'Plantilla',
    'Subject': 'Asunto',
    'Body': 'Contenido',
    'Hi {{recipient first name}},\n\nhere is the quote for {{Project}}…': 'Hola {{recipient first name}},\n\nte envío la cotización de {{Project}}…',

    // rules: fields, operators, actions
    'Sender': 'Remitente',
    'To': 'Para',
    'To or Cc': 'Para o Cc',
    'Account': 'Cuenta',
    'Category': 'Categoría',
    'Attachment (yes/no)': 'Adjunto (yes/no)',
    'Mailing list': 'Lista de correo',
    'contains': 'contiene',
    'does not contain': 'no contiene',
    'is exactly': 'es exactamente',
    'starts with': 'empieza por',
    'ends with': 'termina en',
    'matches the regular expression': 'coincide con la expresión regular',
    'Done (archive)': 'Hecho (archivar)',
    'Mark as read': 'Marcar como leído',
    'Pin': 'Fijar',
    'Move to folder': 'Mover a carpeta',
    'folder path': 'ruta de la carpeta',
    'Add label (Gmail)': 'Añadir etiqueta (Gmail)',
    'label': 'etiqueta',
    'Set category': 'Establecer categoría',
    'Snooze for N hours': 'Posponer N horas',
    'number of hours': 'número de horas',
    'Mute conversation': 'Silenciar conversación',
    'Set aside': 'Apartar',
    'No notification': 'Sin notificación',
    'Move to Trash': 'Mover a la papelera',
    'Block sender': 'Bloquear remitente',

    // rules
    'They run on new messages arriving in the Inbox (e.g. “from invoices@… → label Accounting and done”).':
      'Se aplican a los mensajes nuevos que llegan a Recibidos (p. ej. «de facturas@… → etiqueta Contabilidad y hecho»).',
    '{field} {op} “{value}”': '{field} {op} «{value}»',
    'and': 'y',
    'or': 'o',
    'used {n}×': 'usada {n}×',
    'Apply now': 'Aplicar ahora',
    'Delete this rule?': '¿Eliminar esta regla?',
    'New rule': 'Regla nueva',
    'Rule': 'Regla',
    'Matches {n} of the recent messages in the Inbox': 'Coincide con {n} de los mensajes recientes en Recibidos',
    'Test': 'Probar',
    'When': 'Cuando',
    'all of the conditions': 'todas las condiciones',
    'any of the conditions': 'cualquiera de las condiciones',
    'are met:': 'se cumplan:',
    'Condition': 'Condición',
    'Then:': 'Entonces:',
    'Action': 'Acción',
    'Stop processing more rules': 'No procesar más reglas',

    // AI
    'AI engine': 'Motor de IA',
    'Summaries, reply drafting, translations, quick replies and questions about your mail.':
      'Resúmenes, redacción de respuestas, traducciones, respuestas rápidas y preguntas sobre tu correo.',
    'Provider': 'Proveedor',
    'Ollama — local, free, private': 'Ollama — local, gratuito, privado',
    'Claude (Anthropic) — best quality, pay per use': 'Claude (Anthropic) — la mejor calidad, pago por uso',
    'Ollama (local)': 'Ollama (local)',
    'Ollama address': 'Dirección de Ollama',
    'Ollama is not responding — start it to see the models.': 'Ollama no responde — inícialo para ver los modelos.',
    'gemma3:12b and qwen3:8b work well, also for Polish.': 'gemma3:12b y qwen3:8b funcionan bien, también en español.',
    'Refresh list': 'Actualizar lista',
    'The key from console.anthropic.com is stored {where}. Email content is then sent to the Anthropic API.':
      'La clave de console.anthropic.com se guarda {where}. El contenido del correo se envía entonces a la API de Anthropic.',
    'API key (saved — enter a new one to change it)': 'Clave de API (guardada — introduce una nueva para cambiarla)',
    'API key': 'Clave de API',
    'Key saved': 'Clave guardada',
    'Key removed': 'Clave eliminada',
    'Remove': 'Quitar',
    'Style': 'Estilo',
    'Reply language': 'Idioma de las respuestas',
    'Same as the conversation': 'El mismo de la conversación',
    'Always in French': 'Siempre en francés',
    'Always in Spanish': 'Siempre en español',
    'Always in Polish': 'Siempre en polaco',
    'Always in English': 'Siempre en inglés',
    'About me (persona)': 'Sobre mí (perfil)',
    'Who you are and how you write — the AI uses this when drafting replies.':
      'Quién eres y cómo escribes — la IA lo usa al redactar respuestas.',
    'e.g. Anna, owner of a small design studio. I write briefly and to the point, on a first-name basis.':
      'p. ej. Ana, dueña de un pequeño estudio de diseño. Escribo de forma breve y directa, tuteando.',

    // AI agents & CLI
    'Copied': 'Copiado',
    'Could not copy': 'No se pudo copiar',
    'AI agent access level': 'Nivel de acceso de los agentes de IA',
    'Applies to the `octo` CLI and the MCP server (Claude Code, Claude Desktop). It can only be changed here — an agent cannot raise its own permissions.':
      'Se aplica a la CLI `octo` y al servidor MCP (Claude Code, Claude Desktop). Solo se puede cambiar aquí — un agente no puede ampliar sus propios permisos.',
    'Connect to Claude Code': 'Conectar con Claude Code',
    'Once, in a terminal. Claude can then read and triage your mail and (if you allow it) send mail and manage your calendar.':
      'Una sola vez, en una terminal. Después Claude puede leer y organizar tu correo y (si lo permites) enviar correo y gestionar tu calendario.',
    'Copy': 'Copiar',
    'Command line: {cmd}. The CLI also works when the app is closed and prints times in local time with the UTC offset.':
      'Línea de comandos: {cmd}. La CLI también funciona con la aplicación cerrada y muestra las horas en hora local con el desfase UTC.',
    'Recent agent activity': 'Actividad reciente de los agentes',
    'None': 'Ninguna',

    // calendars
    'Calendar sources': 'Orígenes de calendarios',
    'Google Calendar is added automatically for accounts signed in with Google OAuth. Add others (iCloud, Fastmail, Nextcloud, ICS, local) in the Calendar view.':
      'Google Calendar se añade automáticamente para las cuentas con inicio de sesión de Google OAuth. Los demás (iCloud, Fastmail, Nextcloud, ICS, local) se añaden en la vista Calendario.',
    'Sync': 'Sincronizar',
    'Remove this calendar source?': '¿Quitar este origen de calendario?',
    'No calendars.': 'Sin calendarios.',

    // home server
    'Found the server “{host}” (version {version})': 'Se encontró el servidor «{host}» (versión {version})',
    'After connecting, the app restarts and uses the accounts on the home server. Accounts added on this computer stay here, but are not used until you disconnect the server. Continue?':
      'Tras conectar, la aplicación se reinicia y usa las cuentas del servidor doméstico. Las cuentas añadidas en este equipo se quedan aquí, pero no se usan hasta que desconectes el servidor. ¿Continuar?',
    'An always-on computer (Raspberry Pi, NAS, old laptop) running Octopus Mail. It sends scheduled messages and brings back snoozed messages and reminders even when your computers are off, and all your computers and your phone’s browser see the same accounts.':
      'Un equipo siempre encendido (Raspberry Pi, NAS, portátil viejo) con Octopus Mail. Envía los mensajes programados y recupera los mensajes pospuestos y los recordatorios incluso cuando tus equipos están apagados, y todos tus equipos y el navegador del teléfono ven las mismas cuentas.',
    '1. On the server, run:': '1. En el servidor, ejecuta:',
    'It prints the address (e.g. {example}) and a pairing code. Installing on a Raspberry Pi: README, section “Home server”.':
      'Mostrará la dirección (p. ej. {example}) y un código de emparejamiento. Instalación en una Raspberry Pi: README, sección «Servidor doméstico».',
    '2. Connect this app:': '2. Conecta esta aplicación:',
    'Server address': 'Dirección del servidor',
    'e.g. 192.168.1.50 or raspberrypi.local': 'p. ej. 192.168.1.50 o raspberrypi.local',
    'Pairing code': 'Código de emparejamiento',
    'Name of this device': 'Nombre de este dispositivo',
    'e.g. Anna’s laptop': 'p. ej. Portátil de Ana',
    'Connect to server': 'Conectar con el servidor',
    'Security': 'Seguridad',
    'Each device gets its own key, which you can revoke at any time. The server stores your mailbox passwords, so keep it on your home network. For access from outside your home, use a VPN (e.g. Tailscale) rather than port forwarding on your router.':
      'Cada dispositivo recibe su propia clave, que puedes revocar en cualquier momento. El servidor guarda las contraseñas de tus buzones, así que mantenlo en tu red doméstica. Para acceder desde fuera de casa, usa una VPN (p. ej. Tailscale) en lugar de redirigir puertos en tu router.',
    'server': 'servidor',
    'Server': 'Servidor',
    'Connected': 'Conectado',
    'Not connected — the app keeps retrying': 'Sin conexión — la aplicación sigue reintentando',
    'this device: {name}': 'este dispositivo: {name}',
    'Disconnect this app from the home server? It restarts in local mode (with the accounts added on this computer).':
      '¿Desconectar esta aplicación del servidor doméstico? Se reiniciará en modo local (con las cuentas añadidas en este equipo).',
    'Disconnect': 'Desconectar',
    'Devices': 'Dispositivos',
    'Computers and browsers that have access to your mail on the server.': 'Equipos y navegadores con acceso a tu correo en el servidor.',
    'this device': 'este dispositivo',
    'paired {when}': 'emparejado {when}',
    'last seen {when}': 'visto por última vez {when}',
    'Revoke access for the device “{name}”?': '¿Revocar el acceso del dispositivo «{name}»?',
    'Revoke access': 'Revocar acceso',
    'Add device': 'Añadir dispositivo',
    'Pairing code (one-time, valid until {time})': 'Código de emparejamiento (de un solo uso, válido hasta {time})',
    'Computer: Settings → Home server. Phone or browser: open {url} and enter the code.':
      'Computadora: Ajustes → Servidor doméstico. Teléfono o navegador: abre {url} e introduce el código.',
    'Claude Code with a home server': 'Claude Code con un servidor doméstico',
    'The agent connects to the server over SSH, e.g.: {cmd}': 'El agente se conecta al servidor por SSH, p. ej.: {cmd}',

    // keyboard shortcuts
    'New message': 'Nuevo mensaje',
    'Command palette': 'Paleta de comandos',
    '/ or Ctrl+F': '/ o Ctrl+F',
    'Search': 'Buscar',
    'Next / previous conversation': 'Conversación siguiente / anterior',
    'Pin / unpin': 'Fijar / desfijar',
    'Snooze': 'Posponer',
    'Read / unread': 'Leído / no leído',
    'Mute': 'Silenciar',
    'Reply / reply all / forward': 'Responder / responder a todos / reenviar',
    'Select': 'Seleccionar',
    'Undo last action': 'Deshacer la última acción',
    'Send (in the editor)': 'Enviar (en el editor)',
    'Close / deselect': 'Cerrar / deseleccionar',
    'G then I / S / D / P / Z / A / T / N': 'G y luego I / S / D / P / Z / A / T / N',
    'Go to: Inbox / Sent / Drafts / Pinned / Snoozed / Archive / Trash / New senders':
      'Ir a: Recibidos / Enviados / Borradores / Fijados / Pospuestos / Archivo / Papelera / Remitentes nuevos',
    'G then C': 'G y luego C',
    'Calendar': 'Calendario',

    // about
    'A free email client with Smart Inbox, Gatekeeper, AI, a calendar and access for AI agents.':
      'Un cliente de correo gratuito con Smart Inbox, Gatekeeper, IA, calendario y acceso para agentes de IA.',
    'Open source (MIT license):': 'Código abierto (licencia MIT):',
    'report a bug': 'informar de un error',
    'App data:': 'Datos de la aplicación:',
  },
  plurals: {
    'Applied to {n} existing conversation': [
      'Aplicado a {n} conversación existente',
      'Aplicado a {n} conversaciones existentes',
      'Aplicado a {n} conversaciones existentes',
    ],
  },
}
export default dict
