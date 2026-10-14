// Polish translations: settings. Keys are the English source strings used with t() / tp().
import type { Dictionary } from '../../i18n'

const dict: Dictionary = {
  strings: {
    // tabs and window
    'Accounts': 'Konta',
    'Appearance & general': 'Wygląd i ogólne',
    'Inbox & Gatekeeper': 'Skrzynka i GateKeeper',
    'Notifications': 'Powiadomienia',
    'Signatures': 'Podpisy',
    'Templates': 'Szablony',
    'Rules': 'Reguły',
    'AI agents & CLI': 'Agenci AI i CLI',
    'Calendars': 'Kalendarze',
    'Home server': 'Serwer domowy',
    'Keyboard shortcuts': 'Skróty klawiszowe',
    'About': 'Informacje',
    'Settings': 'Ustawienia',
    'Close': 'Zamknij',

    // agent access levels
    'No access': 'Brak dostępu',
    'Read only': 'Odczyt',
    'Triage (drafts, actions)': 'Porządkowanie (drafty, akcje)',
    'Send (+ calendar)': 'Wysyłka (+ kalendarz)',

    // accounts
    'Mail accounts': 'Konta pocztowe',
    'Passwords are stored {where}, not in the app database.': 'Hasła są przechowywane {where}, nie w bazie programu.',
    'password': 'hasło',
    'synced {when}': 'synchronizacja {when}',
    'not synced yet': 'jeszcze nie zsynchronizowano',
    'Aliases:': 'Aliasy:',
    'Signature': 'Podpis',
    'No signature': 'Bez podpisu',
    'Edit': 'Edytuj',
    'Add account': 'Dodaj konto',
    'OAuth sign-in (optional)': 'Logowanie OAuth (opcjonalne)',
    'Your own Google/Microsoft app IDs for signing in without a password and for Google Calendar access.':
      'Własne identyfikatory aplikacji Google/Microsoft do logowania bez hasła i dostępu do kalendarza Google.',
    'Saved': 'Zapisano',
    'Save': 'Zapisz',
    'Account {email}': 'Konto {email}',
    'Remove the account {email} from Octopus Mail? Your mail on the server stays untouched.':
      'Usunąć konto {email} z Octopus Mail? Poczta na serwerze zostaje nietknięta.',
    'Remove account': 'Usuń konto',
    'Cancel': 'Anuluj',
    'Sender name': 'Nazwa nadawcy',
    'Color': 'Kolor',
    'New password (leave empty to keep the current one)': 'Nowe hasło (puste = bez zmian)',
    'Sync history (days)': 'Synchronizuj wstecz (dni)',
    'Smart (people and priority senders)': 'Inteligentne (ludzie i priorytety)',
    'All': 'Wszystkie',
    'Off': 'Wyłączone',
    'Add alias (sender address)': 'Dodaj alias (adres nadawcy)',
    'e.g. office@yourcompany.com': 'np. biuro@twojafirma.pl',
    'Account enabled': 'Konto włączone',
    'A disabled account is not synced.': 'Wyłączone konto nie jest synchronizowane.',
    'Servers': 'Serwery',
    'IMAP port': 'Port IMAP',
    'SMTP port': 'Port SMTP',
    'Username': 'Nazwa użytkownika',

    // appearance & general
    'Appearance': 'Wygląd',
    'Language': 'Język',
    'The window reloads to apply the language.': 'Po zmianie okno przeładuje się automatycznie.',
    'Automatic (system language)': 'Automatycznie (język systemu)',
    'Theme': 'Motyw',
    'Match system': 'Jak w systemie',
    'Light': 'Jasny',
    'Dark': 'Ciemny',
    'List density': 'Gęstość listy',
    'Comfortable (with preview)': 'Wygodna (z podglądem)',
    'Compact': 'Kompaktowa',
    'Startup': 'Uruchamianie',
    'Launch when Windows starts': 'Uruchamiaj przy starcie Windows',
    'Snoozed messages, reminders and scheduled sends then work without opening the window.':
      'Wtedy odłożone wiadomości, przypomnienia i wysyłki zaplanowane działają bez otwierania okna.',
    'Closing the window keeps the app running in the tray': 'Zamknięcie okna chowa program do zasobnika',
    'Sending': 'Wysyłanie',
    'Default sending account': 'Domyślne konto nadawcy',
    'Last used': 'Ostatnio używane',
    'Undo send window: {n} s': 'Czas na cofnięcie wysłania: {n} s',

    // inbox & gatekeeper
    'Automatically sorts mail into People, Notifications and Newsletters (based on headers, Gmail categories and your choices).':
      'Automatyczny podział na Ludzi, Powiadomienia i Newslettery (na podstawie nagłówków, kategorii Gmaila i Twoich decyzji).',
    'Turn on Smart Inbox': 'Włącz Smart Inbox',
    'Group notifications into one card': 'Grupuj powiadomienia w jedną kartę',
    'Group newsletters into one card': 'Grupuj newslettery w jedną kartę',
    'Mark as read when opened': 'Oznaczaj jako przeczytane po otwarciu',
    'Gatekeeper': 'GateKeeper',
    'New senders (people who have never received an email from you) wait in a separate section until you accept or block them.':
      'Nowi nadawcy (którzy nigdy od Ciebie nie dostali maila) czekają w osobnej sekcji, aż ich zaakceptujesz lub zablokujesz.',
    'Screen new senders before they reach the Inbox': 'Sprawdzaj nowych nadawców przed Odebranymi',
    'Privacy': 'Prywatność',
    'Remote images in messages': 'Zdalne obrazy w wiadomościach',
    'Only from people I know': 'Tylko od znanych osób',
    'Always': 'Zawsze',
    'Never (ask)': 'Nigdy (pytaj)',
    'Block tracking pixels': 'Blokuj piksele śledzące',
    'Removes the invisible images senders use to check whether you have read their message.':
      'Usuwa niewidoczne obrazki, którymi nadawcy sprawdzają, czy przeczytałeś wiadomość.',
    'Snooze & reminders': 'Odkładanie i przypomnienia',
    '“Morning” hour': 'Godzina „rano”',
    '“Evening” hour': 'Godzina „wieczorem”',
    'Downloading': 'Pobieranie',
    'Download message content from the last (days)': 'Pobieraj treści wiadomości z ostatnich (dni)',
    'For full-text search and offline AI. Older content is downloaded when you open a message.':
      'Do wyszukiwania pełnotekstowego i AI bez internetu. Starsze treści pobierane są przy otwarciu.',

    // notifications
    'System notifications': 'Powiadomienia systemowe',
    'Show notifications for new mail': 'Pokazuj powiadomienia o nowej poczcie',
    'Notification sound': 'Dźwięk powiadomień',
    'Mode per account': 'Tryb dla kont',
    '“Smart” = only messages from people and priority senders, no newsletters or automated mail.':
      '„Inteligentne” = tylko wiadomości od ludzi i nadawców priorytetowych, bez newsletterów i automatów.',
    'Smart': 'Inteligentne',

    // signatures
    'Choose the default signature for an account in the Accounts tab. You can use plain text or HTML.':
      'Domyślny podpis dla konta wybierzesz w zakładce Konta. Możesz używać zwykłego tekstu albo HTML.',
    'Delete this signature?': 'Usunąć podpis?',
    'My signature': 'Mój podpis',
    'New signature': 'Nowy podpis',
    'Name': 'Nazwa',
    'Content (text or HTML)': 'Treść (tekst lub HTML)',
    'Preview:': 'Podgląd:',

    // templates ({auto3} = {{imię odbiorcy}}, the Polish alias of {{recipient first name}})
    'Type fields to fill in as {field}. Automatic: {auto1}, {auto2}, {auto3}.':
      'Pola do wypełnienia wpisujesz jako {field}. Automatyczne: {auto1}, {auto2}, {auto3}.',
    'Field name': 'Nazwa pola',
    'fields: {list}': 'pola: {list}',
    'Delete this template?': 'Usunąć szablon?',
    'New template': 'Nowy szablon',
    'Template': 'Szablon',
    'Subject': 'Temat',
    'Body': 'Treść',
    'Hi {{recipient first name}},\n\nhere is the quote for {{Project}}…': 'Dzień dobry {{imię odbiorcy}},\n\nprzesyłam ofertę na {{Projekt}}…',

    // rules: fields, operators, actions
    'Sender': 'Nadawca',
    'To': 'Do',
    'To or Cc': 'Do lub DW',
    'Account': 'Konto',
    'Category': 'Kategoria',
    'Attachment (yes/no)': 'Załącznik (yes/no)',
    'Mailing list': 'Lista mailingowa',
    'contains': 'zawiera',
    'does not contain': 'nie zawiera',
    'is exactly': 'jest równe',
    'starts with': 'zaczyna się od',
    'ends with': 'kończy się na',
    'matches the regular expression': 'pasuje do wyrażenia',
    'Done (archive)': 'Zrobione (archiwizuj)',
    'Mark as read': 'Oznacz jako przeczytane',
    'Pin': 'Przypnij',
    'Move to folder': 'Przenieś do folderu',
    'folder path': 'ścieżka folderu',
    'Add label (Gmail)': 'Dodaj etykietę (Gmail)',
    'label': 'etykieta',
    'Set category': 'Ustaw kategorię',
    'Snooze for N hours': 'Odłóż na N godzin',
    'number of hours': 'liczba godzin',
    'Mute conversation': 'Wycisz wątek',
    'Set aside': 'Odłóż na bok',
    'No notification': 'Bez powiadomienia',
    'Move to Trash': 'Do kosza',
    'Block sender': 'Zablokuj nadawcę',

    // rules
    'They run on new messages arriving in the Inbox (e.g. “from invoices@… → label Accounting and done”).':
      'Działają na nowych wiadomościach przychodzących do Odebranych (np. „od faktury@… → etykieta Księgowość i zrobione”).',
    '{field} {op} “{value}”': '{field} {op} „{value}”',
    'and': 'i',
    'or': 'lub',
    'used {n}×': 'użyta {n}×',
    'Apply now': 'Zastosuj teraz',
    'Delete this rule?': 'Usunąć regułę?',
    'New rule': 'Nowa reguła',
    'Rule': 'Reguła',
    'Matches {n} of the recent messages in the Inbox': 'Pasuje do {n} z ostatnich wiadomości w Odebranych',
    'Test': 'Testuj',
    'When': 'Gdy',
    'all of the conditions': 'wszystkie warunki',
    'any of the conditions': 'którykolwiek warunek',
    'are met:': 'są spełnione:',
    'Condition': 'Warunek',
    'Then:': 'Wtedy:',
    'Action': 'Akcja',
    'Stop processing more rules': 'Nie sprawdzaj kolejnych reguł',

    // AI
    'AI engine': 'Silnik AI',
    'Summaries, reply drafting, translations, quick replies and questions about your mail.':
      'Podsumowania, pisanie odpowiedzi, tłumaczenia, szybkie odpowiedzi i pytania o pocztę.',
    'Provider': 'Dostawca',
    'Ollama — local, free, private': 'Ollama — lokalnie, za darmo, prywatnie',
    'Claude (Anthropic) — best quality, pay per use': 'Claude (Anthropic) — najlepsza jakość, płatne za użycie',
    'OpenAI-compatible API (Mammouth, OpenRouter, …)': 'API zgodne z OpenAI (Mammouth, OpenRouter, …)',
    'OpenAI-compatible API': 'API zgodne z OpenAI',
    'Works with Mammouth, OpenRouter, LM Studio and any service with a /chat/completions endpoint. The key is stored {where}. Email content is sent to that service.': 'Działa z Mammouth, OpenRouter, LM Studio i każdą usługą z punktem /chat/completions. Klucz jest przechowywany {where}. Treść poczty jest wysyłana do tej usługi.',
    'API address': 'Adres API',
    'Base address as given in the service documentation, usually ending in /v1.': 'Adres bazowy z dokumentacji usługi, zwykle kończący się na /v1.',
    'Exact model name from the service, e.g. a small, cheap model to save credits.': 'Dokładna nazwa modelu z usługi, np. mały, tani model oszczędzający kredyty.',
    'Ollama (local)': 'Ollama (lokalnie)',
    'Ollama address': 'Adres Ollamy',
    'Ollama is not responding — start it to see the models.': 'Ollama nie odpowiada — uruchom ją, żeby zobaczyć modele.',
    'gemma3:12b and qwen3:8b work well, also for Polish.': 'Do języka polskiego dobrze sprawdzają się gemma3:12b i qwen3:8b.',
    'Refresh list': 'Odśwież listę',
    'The key from console.anthropic.com is stored {where}. Email content is then sent to the Anthropic API.':
      'Klucz z console.anthropic.com jest przechowywany {where}. Treść maili jest wtedy wysyłana do API Anthropic.',
    'API key (saved — enter a new one to change it)': 'Klucz API (zapisany — wpisz nowy, aby zmienić)',
    'API key': 'Klucz API',
    'Key saved': 'Zapisano klucz',
    'Key removed': 'Usunięto klucz',
    'Remove': 'Usuń',
    'Style': 'Styl',
    'Reply language': 'Język odpowiedzi',
    'Same as the conversation': 'Jak w korespondencji',
    'Always in Polish': 'Zawsze po polsku',
    'Always in English': 'Zawsze po angielsku',
    'About me (persona)': 'O mnie (persona)',
    'Who you are and how you write — the AI uses this when drafting replies.':
      'Kim jesteś i jak piszesz — AI użyje tego przy redagowaniu odpowiedzi.',
    'e.g. Anna, owner of a small design studio. I write briefly and to the point, on a first-name basis.':
      'np. Anna, właścicielka małej pracowni projektowej. Piszę krótko i konkretnie, po imieniu.',

    // AI agents & CLI
    'Copied': 'Skopiowano',
    'Could not copy': 'Nie udało się skopiować',
    'AI agent access level': 'Poziom dostępu agentów AI',
    'Applies to the `octo` CLI and the MCP server (Claude Code, Claude Desktop). It can only be changed here — an agent cannot raise its own permissions.':
      'Dotyczy CLI `octo` i serwera MCP (Claude Code, Claude Desktop). Zmienić go można tylko tutaj — agent nie podniesie sobie uprawnień.',
    'Connect to Claude Code': 'Podłącz do Claude Code',
    'Once, in a terminal. Claude can then read and triage your mail and (if you allow it) send mail and manage your calendar.':
      'Jednorazowo, w terminalu. Potem Claude może czytać, porządkować i (jeśli pozwolisz) wysyłać pocztę oraz zarządzać kalendarzem.',
    'Copy': 'Kopiuj',
    'Command line: {cmd}. The CLI also works when the app is closed and prints times in local time with the UTC offset.':
      'Wiersz poleceń: {cmd}. CLI działa także przy zamkniętej aplikacji, a czasy wypisuje w czasie lokalnym z przesunięciem UTC.',
    'Recent agent activity': 'Ostatnie działania agentów',
    'None': 'Brak',

    // calendars
    'Calendar sources': 'Źródła kalendarzy',
    'Google Calendar is added automatically for accounts signed in with Google OAuth. Add others (iCloud, Fastmail, Nextcloud, ICS, local) in the Calendar view.':
      'Kalendarz Google dodaje się automatycznie dla kont zalogowanych przez Google OAuth. Inne (iCloud, Fastmail, Nextcloud, ICS, lokalny) dodasz w widoku Kalendarza.',
    'Sync': 'Synchronizuj',
    'Remove this calendar source?': 'Usunąć źródło kalendarza?',
    'No calendars.': 'Brak kalendarzy.',

    // home server
    'Found the server “{host}” (version {version})': 'Znaleziono serwer „{host}” (wersja {version})',
    'After connecting, the app restarts and uses the accounts on the home server. Accounts added on this computer stay here, but are not used until you disconnect the server. Continue?':
      'Po połączeniu aplikacja uruchomi się ponownie i będzie korzystać z kont na serwerze domowym. Konta dodane na tym komputerze zostają tutaj, ale nie będą używane, dopóki nie odłączysz serwera. Kontynuować?',
    'An always-on computer (Raspberry Pi, NAS, old laptop) running Octopus Mail. It sends scheduled messages and brings back snoozed messages and reminders even when your computers are off, and all your computers and your phone’s browser see the same accounts.':
      'Komputer stale włączony (Raspberry Pi, NAS, stary laptop) z Octopus Mail. Wysyła zaplanowane wiadomości i budzi odłożone oraz przypomnienia także wtedy, gdy Twoje komputery są wyłączone, a wszystkie komputery i przeglądarka w telefonie widzą te same konta.',
    '1. On the server, run:': '1. Na serwerze uruchom:',
    'It prints the address (e.g. {example}) and a pairing code. Installing on a Raspberry Pi: README, section “Home server”.':
      'Wypisze adres (np. {example}) i kod parowania. Instalacja na Raspberry Pi: README, sekcja „Serwer domowy”.',
    '2. Connect this app:': '2. Połącz tę aplikację:',
    'Server address': 'Adres serwera',
    'e.g. 192.168.1.50 or raspberrypi.local': 'np. 192.168.1.50 albo raspberrypi.local',
    'Pairing code': 'Kod parowania',
    'Name of this device': 'Nazwa tego urządzenia',
    'e.g. Anna’s laptop': 'np. Laptop Piotra',
    'Connect to server': 'Połącz z serwerem',
    'Security': 'Bezpieczeństwo',
    'Each device gets its own key, which you can revoke at any time. The server stores your mailbox passwords, so keep it on your home network. For access from outside your home, use a VPN (e.g. Tailscale) rather than port forwarding on your router.':
      'Każde urządzenie dostaje własny klucz, który możesz w każdej chwili odebrać. Serwer przechowuje hasła do skrzynek, dlatego trzymaj go w sieci domowej. Dostęp spoza domu najlepiej przez VPN (np. Tailscale), nie przez przekierowanie portu w routerze.',
    'server': 'serwer',
    'Server': 'Serwer',
    'Connected': 'Połączono',
    'Not connected — the app keeps retrying': 'Brak połączenia — aplikacja ponawia próby',
    'this device: {name}': 'to urządzenie: {name}',
    'Disconnect this app from the home server? It restarts in local mode (with the accounts added on this computer).':
      'Odłączyć tę aplikację od serwera domowego? Uruchomi się ponownie w trybie lokalnym (z kontami dodanymi na tym komputerze).',
    'Disconnect': 'Odłącz',
    'Devices': 'Urządzenia',
    'Computers and browsers that have access to your mail on the server.': 'Komputery i przeglądarki, które mają dostęp do Twojej poczty na serwerze.',
    'this device': 'to urządzenie',
    'paired {when}': 'sparowane {when}',
    'last seen {when}': 'ostatnio {when}',
    'Revoke access for the device “{name}”?': 'Odebrać dostęp urządzeniu „{name}”?',
    'Revoke access': 'Odbierz dostęp',
    'Add device': 'Dodaj urządzenie',
    'Pairing code (one-time, valid until {time})': 'Kod parowania (jednorazowy, ważny do {time})',
    'Computer: Settings → Home server. Phone or browser: open {url} and enter the code.':
      'Komputer: Ustawienia → Serwer domowy. Telefon lub przeglądarka: otwórz {url} i wpisz kod.',
    'Claude Code with a home server': 'Claude Code przy serwerze domowym',
    'The agent connects to the server over SSH, e.g.: {cmd}': 'Agent łączy się z serwerem przez SSH, np.: {cmd}',

    // keyboard shortcuts
    'New message': 'Nowa wiadomość',
    'Command palette': 'Paleta poleceń',
    '/ or Ctrl+F': '/ lub Ctrl+F',
    'Search': 'Szukaj',
    'Next / previous conversation': 'Następna / poprzednia rozmowa',
    'Pin / unpin': 'Przypnij / odepnij',
    'Snooze': 'Odłóż',
    'Read / unread': 'Przeczytane / nieprzeczytane',
    'Mute': 'Wycisz',
    'Reply / reply all / forward': 'Odpowiedz / wszystkim / przekaż',
    'Select': 'Zaznacz',
    'Undo last action': 'Cofnij ostatnią akcję',
    'Send (in the editor)': 'Wyślij (w edytorze)',
    'Close / deselect': 'Zamknij / odznacz',
    'G then I / S / D / P / Z / A / T / N': 'G potem I / S / D / P / Z / A / T / N',
    'Go to: Inbox / Sent / Drafts / Pinned / Snoozed / Archive / Trash / New senders':
      'Idź do: Odebrane / Wysłane / Wersje robocze / Przypięte / Odłożone / Archiwum / Kosz / Nowi nadawcy',
    'G then C': 'G potem C',
    'Calendar': 'Kalendarz',

    // about
    'A free email client with Smart Inbox, Gatekeeper, AI, a calendar and access for AI agents.':
      'Darmowy klient poczty z Smart Inbox, GateKeeperem, AI, kalendarzem i dostępem dla agentów AI.',
    'Open source (MIT license):': 'Otwarty kod (licencja MIT):',
    'report a bug': 'zgłoś błąd',
    'App data:': 'Dane programu:',
  },
  plurals: {
    'Applied to {n} existing conversation': [
      'Zastosowano do {n} istniejącej rozmowy',
      'Zastosowano do {n} istniejących rozmów',
      'Zastosowano do {n} istniejących rozmów',
    ],
  },
}
export default dict
