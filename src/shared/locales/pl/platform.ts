// Polish translations: platform. Keys are the English source strings used with t() / tp().
import type { Dictionary } from '../../i18n'

const dict: Dictionary = {
  strings: {
    // src/main/index.ts — window, context menu, notifications, tray
    'Octopus Mail — DEMO (test profile)': 'Octopus Mail — DEMO (profil testowy)',
    'Add to dictionary': 'Dodaj do słownika',
    'Copy link': 'Kopiuj link',
    Cut: 'Wytnij',
    Copy: 'Kopiuj',
    Paste: 'Wklej',
    'Paste as plain text': 'Wklej bez formatowania',
    'Octopus Mail — home server connected': 'Octopus Mail — serwer domowy połączony',
    'Octopus Mail — no connection to the home server': 'Octopus Mail — brak połączenia z serwerem domowym',
    '⏰ Reminder': '⏰ Przypomnienie',
    '(no subject)': '(bez tematu)',
    Calendar: 'Kalendarz',
    'Octopus Mail — {n} unread': 'Octopus Mail — nieprzeczytane: {n}',
    'The home server has no OAuth Client ID set (Settings → Accounts → OAuth).': 'Na serwerze domowym nie ustawiono OAuth Client ID (Ustawienia → Konta → OAuth).',
    "Couldn't determine the account's email address": 'Nie udało się ustalić adresu e-mail konta',
    'The app is not connected to a home server': 'Aplikacja nie jest połączona z serwerem domowym',
    'Open Octopus Mail': 'Otwórz Octopus Mail',
    'New message': 'Nowa wiadomość',
    'Sync now': 'Synchronizuj teraz',
    Quit: 'Zakończ',

    // src/main/backend.ts and src/server/server.ts — errors
    'Unknown method {method}': 'Nieznana metoda {method}',
    'Method {method} does not support streaming': 'Metoda {method} nie obsługuje strumieniowania',
    "Can't reach the home server ({url}): {error}": 'Brak połączenia z serwerem domowym ({url}): {error}',
    'The home server rejected this device — pair it again (Settings → Home server).': 'Serwer domowy odrzucił to urządzenie — sparuj je ponownie (Ustawienia → Serwer domowy).',
    "The server didn't return the attachment (HTTP {status})": 'Serwer nie zwrócił załącznika (HTTP {status})',
    'attachment-{id}': 'zalacznik-{id}',
    "Can't connect to {url}: {error}": 'Nie mogę połączyć się z {url}: {error}',
    '{url} is not an Octopus Mail server': '{url} nie jest serwerem Octopus Mail',
    'Pairing failed (HTTP {status})': 'Parowanie nie powiodło się (HTTP {status})',
    'Request too large': 'Za duże żądanie',
    'Too many failed attempts — wait 10 minutes': 'Za dużo nieudanych prób — odczekaj 10 minut',
    'Invalid or expired pairing code': 'Nieprawidłowy albo wygasły kod parowania',
    'The web interface is not available in this installation.': 'Interfejs WWW nie jest dostępny w tej instalacji.',
    'Not authorized — pair this device with the server': 'Brak autoryzacji — sparuj urządzenie z serwerem',
    'Missing X-Octo header': 'Brak nagłówka X-Octo',
    'Not found': 'Nie znaleziono',
    file: 'plik',

    // src/server — default device names, sign-in page
    Computer: 'Komputer',
    Device: 'Urządzenie',
    Phone: 'Telefon',
    Browser: 'Przeglądarka',
    'Octopus Mail — sign in': 'Octopus Mail — logowanie',
    'Enter the pairing code from your home server.': 'Wpisz kod parowania z serwera domowego.',
    'New code:': 'Nowy kod:',
    'or ask from a paired device': 'albo poproś o kod z już sparowanego urządzenia',
    Connect: 'Połącz',
    'Too many attempts — wait 10 minutes.': 'Za dużo prób — odczekaj 10 minut.',
    'Invalid or expired code.': 'Nieprawidłowy albo wygasły kod.',

    // src/shared/when.ts — presets and formatWhen()
    'Later today': 'Później dzisiaj',
    'This evening': 'Dziś wieczorem',
    Tomorrow: 'Jutro',
    'Tomorrow evening': 'Jutro wieczorem',
    'This weekend': 'W weekend',
    'Next week': 'W przyszłym tygodniu',
    'Later this week': 'Później w tym tygodniu',
    'In a month': 'Za miesiąc',
    Someday: 'Kiedyś',
    'today {time}': 'dziś {time}',
    'tomorrow {time}': 'jutro {time}',
  },
  plurals: {
    '{n} new message': ['{n} nowa wiadomość', '{n} nowe wiadomości', '{n} nowych wiadomości'],
    '{n} unread': ['{n} nieprzeczytana', '{n} nieprzeczytane', '{n} nieprzeczytanych'],
  },
}
export default dict
