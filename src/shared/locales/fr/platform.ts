// French translations: platform. Keys are the English source strings used with t() / tp().
import type { Dictionary } from '../../i18n'

const dict: Dictionary = {
  strings: {
    // src/main/index.ts — window, context menu, notifications, tray
    'Octopus Mail — DEMO (test profile)': 'Octopus Mail — DÉMO (profil de test)',
    'Add to dictionary': 'Ajouter au dictionnaire',
    'Copy link': 'Copier le lien',
    Cut: 'Couper',
    Copy: 'Copier',
    Paste: 'Coller',
    'Paste as plain text': 'Coller sans mise en forme',
    'Octopus Mail — home server connected': 'Octopus Mail — serveur domestique connecté',
    'Octopus Mail — no connection to the home server': 'Octopus Mail — pas de connexion au serveur domestique',
    '⏰ Reminder': '⏰ Rappel',
    '(no subject)': '(sans objet)',
    Calendar: 'Calendrier',
    'Octopus Mail — {n} unread': 'Octopus Mail — non lus : {n}',
    'The home server has no OAuth Client ID set (Settings → Accounts → OAuth).': 'Aucun OAuth Client ID n’est défini sur le serveur domestique (Paramètres → Comptes → OAuth).',
    "Couldn't determine the account's email address": 'Impossible de déterminer l’adresse e-mail du compte',
    'The app is not connected to a home server': 'L’application n’est pas connectée à un serveur domestique',
    'Open Octopus Mail': 'Ouvrir Octopus Mail',
    'New message': 'Nouveau message',
    'Sync now': 'Synchroniser maintenant',
    Quit: 'Quitter',

    // src/main/backend.ts and src/server/server.ts — errors
    'Unknown method {method}': 'Méthode inconnue {method}',
    'Method {method} does not support streaming': 'La méthode {method} ne prend pas en charge le streaming',
    "Can't reach the home server ({url}): {error}": 'Impossible de joindre le serveur domestique ({url}) : {error}',
    'The home server rejected this device — pair it again (Settings → Home server).': 'Le serveur domestique a rejeté cet appareil — jumelez-le à nouveau (Paramètres → Serveur domestique).',
    "The server didn't return the attachment (HTTP {status})": 'Le serveur n’a pas renvoyé la pièce jointe (HTTP {status})',
    'attachment-{id}': 'piece-jointe-{id}',
    "Can't connect to {url}: {error}": 'Impossible de se connecter à {url} : {error}',
    '{url} is not an Octopus Mail server': '{url} n’est pas un serveur Octopus Mail',
    'Pairing failed (HTTP {status})': 'Échec du jumelage (HTTP {status})',
    'Request too large': 'Requête trop volumineuse',
    'Too many failed attempts — wait 10 minutes': 'Trop de tentatives échouées — patientez 10 minutes',
    'Invalid or expired pairing code': 'Code de jumelage invalide ou expiré',
    'The web interface is not available in this installation.': 'L’interface web n’est pas disponible dans cette installation.',
    'Not authorized — pair this device with the server': 'Non autorisé — jumelez cet appareil avec le serveur',
    'Missing X-Octo header': 'En-tête X-Octo manquant',
    'Not found': 'Introuvable',
    file: 'fichier',

    // src/server — default device names, sign-in page
    Computer: 'Ordinateur',
    Device: 'Appareil',
    Phone: 'Téléphone',
    Browser: 'Navigateur',
    'Octopus Mail — sign in': 'Octopus Mail — connexion',
    'Enter the pairing code from your home server.': 'Saisissez le code de jumelage de votre serveur domestique.',
    'New code:': 'Nouveau code :',
    Connect: 'Se connecter',
    'Too many attempts — wait 10 minutes.': 'Trop de tentatives — patientez 10 minutes.',
    'Invalid or expired code.': 'Code invalide ou expiré.',

    // src/shared/when.ts — presets and formatWhen()
    'Later today': 'Plus tard aujourd’hui',
    'This evening': 'Ce soir',
    Tomorrow: 'Demain',
    'Tomorrow evening': 'Demain soir',
    'This weekend': 'Ce week-end',
    'Next week': 'La semaine prochaine',
    'Later this week': 'Plus tard cette semaine',
    'In a month': 'Dans un mois',
    Someday: 'Un jour',
    'today {time}': 'aujourd’hui {time}',
    'tomorrow {time}': 'demain {time}',
  },
  plurals: {
    '{n} new message': ['{n} nouveau message', '{n} nouveaux messages', '{n} nouveaux messages'],
    '{n} unread': ['{n} non lu', '{n} non lus', '{n} non lus'],
  },
}
export default dict
