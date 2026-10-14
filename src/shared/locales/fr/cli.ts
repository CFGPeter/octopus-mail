// French translations: cli. Keys are the English source strings used with t() / tp().
// Commands, flags and date examples in the help stay as typed (the date parser reads English and Polish).
import type { Dictionary } from '../../i18n'

const dict: Dictionary = {
  strings: {
    // the same in French
    'newsl.': 'newsl.',
    // ── help (octo help) ──
    'octo {version} — Octopus Mail from the command line (local times with UTC offset)':
      'octo {version} — Octopus Mail en ligne de commande (heures locales avec décalage UTC)',
    [`Reading:
  octo accounts                              accounts, agent access levels
  octo folders [account]                     folders with counts
  octo emails [mailbox] [--filter q] [--page N] [--page-size N] [--unread]
       mailbox: Inbox|Sent|Archive|Trash|Spam|pinned|snoozed|aside|reminders|newsenders|
                people|notifications|newsletters|account@x.com|account@x.com:Folder|<smart folder>
  octo search ["topic"] [--filter q] [--in account|account:Folder] [--page N]   (all folders)
  octo thread <ID|tID> [--html]              whole thread with bodies and attachments
  octo attachment <ID> [--save file] [--stream]
  octo contacts [query]  ·  octo templates  ·  octo template <ID|name>`]: `Lecture :
  octo accounts                              comptes, niveaux d’accès des agents
  octo folders [compte]                      dossiers avec compteurs
  octo emails [boîte] [--filter q] [--page N] [--page-size N] [--unread]
       boîte : Inbox|Sent|Archive|Trash|Spam|pinned|snoozed|aside|reminders|newsenders|
               people|notifications|newsletters|compte@x.fr|compte@x.fr:Dossier|<dossier intelligent>
  octo search ["sujet"] [--filter q] [--in compte|compte:Dossier] [--page N]   (tous les dossiers)
  octo thread <ID|tID> [--html]              conversation complète avec corps et pièces jointes
  octo attachment <ID> [--save fichier] [--stream]
  octo contacts [requête]  ·  octo templates  ·  octo template <ID|nom>`,
    [`Writing and sending (draft IDs never change):
  octo draft --to a@b.com [--cc ..] [--bcc ..] --subject "…" --body "markdown…"
             [--reply-to ID [--reply-all]] [--forward ID] [--account account] [--attach file]
             [--template name --placeholder "Field=value"] [--no-signature] [--edit ID]
  octo draft --delete ID
  octo drafts  ·  octo scheduled
  octo send <ID> [--at "tomorrow 9:00"] [--remind "in 3 days"]   sends and waits for SMTP confirmation
  octo unschedule <ID>                       cancels a scheduled send (back to drafts)`]: `Rédaction et envoi (les ID de brouillons ne changent jamais) :
  octo draft --to a@b.fr [--cc ..] [--bcc ..] --subject "…" --body "markdown…"
             [--reply-to ID [--reply-all]] [--forward ID] [--account compte] [--attach fichier]
             [--template nom --placeholder "Champ=valeur"] [--no-signature] [--edit ID]
  octo draft --delete ID
  octo drafts  ·  octo scheduled
  octo send <ID> [--at "tomorrow 9:00"] [--remind "in 3 days"]   envoie et attend la confirmation SMTP
  octo unschedule <ID>                       annule un envoi programmé (retour aux brouillons)`,
    [`Organizing (message ID or t<thread ID>, several allowed):
  octo action archive|inbox|trash|delete-forever|spam|not-spam|read|unread|pin|unpin|
              mute|unmute|aside|unaside|priority|unpriority|unsubscribe <ID...>
  octo action snooze <ID...> --until "mon 8:00"   ·  octo action unsnooze <ID...>
  octo action remind <ID...> --at "in 3 days" [--if-no-reply]  ·  octo action unremind <ID...>
  octo action move <ID...> --folder "account@x.com:Folder"  ·  octo action label|unlabel <ID...> --label X
  octo sender accept|block|unblock|vip|unvip <email|@domain...>
  octo sender category <email...> people|notification|newsletter`]: `Organisation (ID de message ou t<ID de conversation>, plusieurs possibles) :
  octo action archive|inbox|trash|delete-forever|spam|not-spam|read|unread|pin|unpin|
              mute|unmute|aside|unaside|priority|unpriority|unsubscribe <ID...>
  octo action snooze <ID...> --until "mon 8:00"   ·  octo action unsnooze <ID...>
  octo action remind <ID...> --at "in 3 days" [--if-no-reply]  ·  octo action unremind <ID...>
  octo action move <ID...> --folder "compte@x.fr:Dossier"  ·  octo action label|unlabel <ID...> --label X
  octo sender accept|block|unblock|vip|unvip <email|@domaine...>
  octo sender category <email...> people|notification|newsletter`,
    [`Calendar:
  octo events [--from "today"] [--to "in 7 days"]  ·  octo availability [--days 5] [--duration 30]
  octo event create --title "…" --start "tomorrow 10:00" [--end "tomorrow 11:00"] [--attendee a@b.com] [--location …]
  octo event delete <ID>  ·  octo invite <message ID>  ·  octo rsvp <message ID> accept|maybe|decline`]: `Calendrier :
  octo events [--from "today"] [--to "in 7 days"]  ·  octo availability [--days 5] [--duration 30]
  octo event create --title "…" --start "tomorrow 10:00" [--end "tomorrow 11:00"] [--attendee a@b.fr] [--location …]
  octo event delete <ID>  ·  octo invite <ID du message>  ·  octo rsvp <ID du message> accept|maybe|decline`,
    [`AI (Ollama or Claude, per settings):
  octo ai summarize <ID|tID>  ·  octo ai reply <ID|tID> [--instructions "…"]  ·  octo ai ask "question"`]: `IA (Ollama ou Claude, selon les paramètres) :
  octo ai summarize <ID|tID>  ·  octo ai reply <ID|tID> [--instructions "…"]  ·  octo ai ask "question"`,
    [`Other:
  octo status · octo sync [account] · octo history [--limit N] · octo daemon (sync without a window)
  octo serve [--port 8787]   home server (e.g. Raspberry Pi): 24/7 engine + API + web interface
  octo server pair | devices | revoke <ID>    pairing codes and paired devices
  octo mcp   (MCP server on stdio for Claude Code / Claude Desktop)
Global: --json (machine-readable data), --no-sync (don't fetch new mail first)`]: `Autres :
  octo status · octo sync [compte] · octo history [--limit N] · octo daemon (synchronisation sans fenêtre)
  octo serve [--port 8787]   serveur domestique (par ex. Raspberry Pi) : moteur 24h/24 + API + interface web
  octo server pair | devices | revoke <ID>    codes de jumelage et appareils jumelés
  octo mcp   (serveur MCP sur stdio pour Claude Code / Claude Desktop)
Global : --json (données lisibles par machine), --no-sync (ne pas récupérer d’abord le nouveau courrier)`,

    // ── errors and messages ──
    'Could not understand the date for {label}: "{input}". Examples: "tomorrow 9:00", "fri 14:30", "in 2 hours", "2026-10-20 09:15".':
      'Date non comprise pour {label} : « {input} ». Exemples : "tomorrow 9:00", "fri 14:30", "in 2 hours", "2026-10-20 09:15".',
    'No message with ID {id} (give threads as t<ID>)': 'Aucun message avec l’ID {id} (indiquez les conversations sous la forme t<ID>)',
    'Invalid ID: {id}': 'ID invalide : {id}',
    'Give a message ID or a thread ID (t<ID>)': 'Indiquez un ID de message ou de conversation (t<ID>)',
    'No account {email}': 'Aucun compte {email}',
    'Account {email} has no folder "{folder}" (see: octo folders {email})': 'Le compte {email} n’a pas de dossier « {folder} » (voir : octo folders {email})',
    'Unknown mailbox "{name}". Use: Inbox, Sent, Archive, Trash, Spam, pinned, snoozed, aside, reminders, newsenders, account@x.com or account@x.com:Folder':
      'Boîte inconnue « {name} ». Utilisez : Inbox, Sent, Archive, Trash, Spam, pinned, snoozed, aside, reminders, newsenders, compte@x.fr ou compte@x.fr:Dossier',
    'The app is not running — fetching new mail…': 'L’application n’est pas lancée — récupération du nouveau courrier…',
    'Error: {message}': 'Erreur : {message}',
    'Unknown command "{cmd}". See: octo help': 'Commande inconnue « {cmd} ». Voir : octo help',

    // ── thread list (emails, search) ──
    Me: 'Moi',
    person: 'personne',
    'notif.': 'notif.',
    THREAD: 'CONVERSATION',
    DATE: 'DATE',
    FROM: 'DE',
    SUBJECT: 'OBJET',
    'CAT.': 'CAT.',
    FLAGS: 'INDICATEURS',
    ACCOUNT: 'COMPTE',
    'New senders awaiting a decision: {n} (octo emails newsenders)': 'Nouveaux expéditeurs en attente de décision : {n} (octo emails newsenders)',
    'Page {page}. Flags: U unread, P pinned, ! priority, A attachment, S snoozed, R reminder, N new sender, D draft, M muted, B set aside':
      'Page {page}. Indicateurs : U non lu, P épinglé, ! prioritaire, A pièce jointe, S reporté, R rappel, N nouvel expéditeur, D brouillon, M en sourdine, B mis de côté',
    'Give a topic or --filter': 'Indiquez un sujet ou --filter',
    'ID: {id} (thread t{thread}) · {date} · {account} · {folder}\nFrom: {from}\nSubject: {subject}':
      'ID : {id} (conversation t{thread}) · {date} · {account} · {folder}\nDe : {from}\nObjet : {subject}',
    'Nothing found.': 'Aucun résultat.',
    'Threads found: {total} (page {page})': 'Conversations trouvées : {total} (page {page})',

    // ── thread ──
    'Give a message ID or t<thread ID>': 'Indiquez un ID de message ou t<ID de conversation>',
    'Thread does not exist': 'La conversation n’existe pas',
    'Warning: not all message bodies were downloaded ({error})': 'Attention : tous les corps de message n’ont pas été téléchargés ({error})',
    'Thread t{id}: {subject}': 'Conversation t{id} : {subject}',
    'Account: {account} · messages: {n} · category: {category}': 'Compte : {account} · messages : {n} · catégorie : {category}',
    pinned: 'épinglé',
    'snoozed until {time}': 'reporté jusqu’à {time}',
    'reminder {time}': 'rappel {time}',
    'labels: {labels}': 'libellés : {labels}',
    UNREAD: 'NON LU',
    'From: {from}': 'De : {from}',
    'To: {to}': 'À : {to}',
    'Cc: {cc}': 'Cc : {cc}',
    'Bcc: {bcc}': 'Cci : {bcc}',
    'Subject: {subject}': 'Objet : {subject}',
    '📅 Contains an invitation (octo invite {id})': '📅 Contient une invitation (octo invite {id})',
    '(no content)': '(aucun contenu)',
    'Attachments:': 'Pièces jointes :',
    '(not downloaded — octo attachment {id})': '(non téléchargée — octo attachment {id})',
    NAME: 'NOM',
    SIZE: 'TAILLE',
    TYPE: 'TYPE',
    PATH: 'CHEMIN',
    'DRAFT ID: {id} · {status}': 'ID DU BROUILLON : {id} · {status}',
    'send at {time}': 'envoi {time}',

    // ── attachment ──
    'Give an attachment ID (the ID column in octo thread)': 'Indiquez un ID de pièce jointe (colonne ID dans octo thread)',
    'ID: {id}\nName: {name}\nSize: {size}\nType: {type}\nPath: {path}\nMessage: {message}':
      'ID : {id}\nNom : {name}\nTaille : {size}\nType : {type}\nChemin : {path}\nMessage : {message}',

    // ── accounts, folders, contacts, templates ──
    'no access': 'aucun',
    read: 'lecture',
    triage: 'tri',
    send: 'envoi',
    'AGENT ACCESS': 'ACCÈS DES AGENTS',
    SYNC: 'SYNCHRO',
    ERROR: 'ERREUR',
    'FOLDER (identifier)': 'DOSSIER (identifiant)',
    ROLE: 'RÔLE',
    TOTAL: 'TOTAL',
    'UNREAD THREADS': 'CONV. NON LUES',
    EMAIL: 'E-MAIL',
    CATEGORY: 'CATÉGORIE',
    SENT: 'ENVOYÉS',
    RECEIVED: 'REÇUS',
    LAST: 'DERNIER',
    FIELDS: 'CHAMPS',
    MODIFIED: 'MODIFIÉ',
    'ID: {id}\nName: {name}\nSubject: {subject}\nTo: {to}': 'ID : {id}\nNom : {name}\nObjet : {subject}\nÀ : {to}',
    'Fields:': 'Champs :',
    '(none)': '(aucun)',

    // ── drafts, sending ──
    TO: 'À',
    UPDATED: 'MODIFIÉ',
    'SEND AT': 'ENVOI',
    'Cancel: octo unschedule <ID>': 'Annulation : octo unschedule <ID>',
    'Draft {id} deleted.': 'Brouillon {id} supprimé.',
    'File not found: {path}': 'Fichier introuvable : {path}',
    'File {path} is larger than 25 MB': 'Le fichier {path} dépasse 25 Mo',
    file: 'fichier',
    'Status: draft (the ID will not change)': 'Statut : brouillon (l’ID ne changera pas)',
    'Attachments: {list}': 'Pièces jointes : {list}',
    'Send: octo send {id}  ·  Open: octopus-mail://draft/{id}': 'Envoi : octo send {id}  ·  Ouvrir : octopus-mail://draft/{id}',
    'Give a draft ID': 'Indiquez un ID de brouillon',
    'Warning: the app is not running — the message will go out only when you start Octopus Mail or `octo daemon`.':
      'Attention : l’application n’est pas lancée — le message ne partira que lorsque vous démarrerez Octopus Mail ou `octo daemon`.',
    'Scheduled: {subject}\nSend at: {time}\nCancel: octo unschedule {id}': 'Programmé : {subject}\nEnvoi : {time}\nAnnulation : octo unschedule {id}',
    'Sent: {subject} ({time})': 'Envoyé : {subject} ({time})',
    'Not sent (status: {status}): {error}': 'Non envoyé (statut : {status}) : {error}',
    'Not sent (status: {status})': 'Non envoyé (statut : {status})',
    'Send cancelled. "{subject}" is a draft again (ID {id}).': 'Envoi annulé. « {subject} » est de nouveau un brouillon (ID {id}).',

    // ── actions, senders ──
    'Give an action (octo help)': 'Indiquez une action (octo help)',
    '--folder must point to an account folder, e.g. account@x.com:Projects': '--folder doit désigner un dossier du compte, par ex. compte@x.fr:Projets',
    'Give --label': 'Indiquez --label',
    'Unknown action "{action}"': 'Action inconnue « {action} »',
    'Action partly failed: {errors}': 'Action partiellement échouée : {errors}',
    'OK: {result} (threads: {threads})': 'OK : {result} (conversations : {threads})',
    'Category: people|notification|newsletter': 'Catégorie : people|notification|newsletter',
    'Give address(es) or @domain': 'Indiquez une ou plusieurs adresses ou @domaine',

    // ── calendar, AI ──
    '{date} (all day)': '{date} (toute la journée)',
    START: 'DÉBUT',
    END: 'FIN',
    EVENT: 'ÉVÉNEMENT',
    CALENDAR: 'CALENDRIER',
    'MY RSVP': 'MA RÉPONSE',
    MEETING: 'RÉUNION',
    'No free slots in this range.': 'Aucun créneau libre dans cette plage.',
    'Give --title and --start': 'Indiquez --title et --start',
    'Created event {id}: {title} · {time}': 'Événement {id} créé : {title} · {time}',
    'Event deleted.': 'Événement supprimé.',
    'This message does not contain an invitation.': 'Ce message ne contient pas d’invitation.',
    'octo rsvp <message ID> accept|maybe|decline': 'octo rsvp <ID du message> accept|maybe|decline',
    'Invitation response sent.': 'Réponse à l’invitation envoyée.',
    'Sources: {list}': 'Sources : {list}',

    // ── status, sync, daemon, history ──
    'Sync engine: running ({owner}, pid {pid})': 'Moteur de synchronisation : actif ({owner}, pid {pid})',
    'Sync engine: NOT running — start the app or `octo daemon`': 'Moteur de synchronisation : INACTIF — lancez l’application ou `octo daemon`',
    '{email}: last sync {time} — ERROR: {error}': '{email} : dernière synchronisation {time} — ERREUR : {error}',
    '{email}: last sync {time}': '{email} : dernière synchronisation {time}',
    'Queued operations: {n}': 'Opérations en file d’attente : {n}',
    'Syncing {email}…': 'Synchronisation de {email}…',
    'Done.': 'Terminé.',
    'Sync is already running (the app or another daemon).': 'La synchronisation est déjà en cours (l’application ou un autre daemon).',
    'Octopus Mail daemon is running (Ctrl+C to stop).': 'Le daemon Octopus Mail est actif (Ctrl+C pour arrêter).',
    WHEN: 'QUAND',
    WHO: 'QUI',
    ACTION: 'ACTION',
    TARGET: 'CIBLE',
    RESULT: 'RÉSULTAT',
    DETAILS: 'DÉTAILS',

    // ── home server (octo serve / octo server) ──
    'A sync engine is already running on this computer (the app or a daemon). Close it before starting the server.':
      'Un moteur de synchronisation tourne déjà sur cet ordinateur (l’application ou un daemon). Fermez-le avant de démarrer le serveur.',
    [`Octopus Mail — home server is running.

Address:  {addresses}
Pairing code (valid for 15 min): {code}

In the app: Settings → Home server → enter the address and code. In a browser or on a phone, open the address.
New code: octo server pair · Device list: octo server devices · Ctrl+C to stop.`]: `Octopus Mail — le serveur domestique est actif.

Adresse :  {addresses}
Code de jumelage (valable 15 min) : {code}

Dans l’application : Paramètres → Serveur domestique → saisissez l’adresse et le code. Dans un navigateur ou sur un téléphone, ouvrez l’adresse.
Nouveau code : octo server pair · Liste des appareils : octo server devices · Ctrl+C pour arrêter.`,
    'Pairing code: {code}\nValid until: {time} (single use)': 'Code de jumelage : {code}\nValable jusqu’à : {time} (usage unique)',
    DEVICE: 'APPAREIL',
    PAIRED: 'JUMELÉ',
    'LAST SEEN': 'VU',
    'Give a device ID (octo server devices)': 'Indiquez un ID d’appareil (octo server devices)',
    'Access revoked.': 'Accès révoqué.',
    'No such device.': 'Aucun appareil de ce type.',
  },
  plurals: {},
}
export default dict
