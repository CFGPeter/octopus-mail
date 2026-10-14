// French translations: settings. Keys are the English source strings used with t() / tp().
import type { Dictionary } from '../../i18n'

const dict: Dictionary = {
  strings: {
    // tabs and window
    'Accounts': 'Comptes',
    'Appearance & general': 'Apparence et général',
    'Inbox & Gatekeeper': 'Boîte de réception et Gatekeeper',
    'Notifications': 'Notifications',
    'Signatures': 'Signatures',
    'Templates': 'Modèles',
    'Rules': 'Règles',
    'AI agents & CLI': 'Agents IA et CLI',
    'Calendars': 'Calendriers',
    'Home server': 'Serveur domestique',
    'Keyboard shortcuts': 'Raccourcis clavier',
    'About': 'À propos',
    'Settings': 'Paramètres',
    'Close': 'Fermer',

    // agent access levels
    'No access': 'Aucun accès',
    'Read only': 'Lecture seule',
    'Triage (drafts, actions)': 'Tri (brouillons, actions)',
    'Send (+ calendar)': 'Envoi (+ calendrier)',

    // accounts
    'Mail accounts': 'Comptes de messagerie',
    'Passwords are stored {where}, not in the app database.': 'Les mots de passe sont conservés {where}, pas dans la base de données de l’application.',
    'password': 'mot de passe',
    'synced {when}': 'synchronisé {when}',
    'not synced yet': 'pas encore synchronisé',
    'Aliases:': 'Alias :',
    'Signature': 'Signature',
    'No signature': 'Aucune signature',
    'Edit': 'Modifier',
    'Add account': 'Ajouter le compte',
    'OAuth sign-in (optional)': 'Connexion OAuth (facultatif)',
    'Your own Google/Microsoft app IDs for signing in without a password and for Google Calendar access.':
      'Vos propres identifiants d’application Google/Microsoft pour se connecter sans mot de passe et accéder à Google Agenda.',
    'Saved': 'Enregistré',
    'Save': 'Enregistrer',
    'Account {email}': 'Compte {email}',
    'Remove the account {email} from Octopus Mail? Your mail on the server stays untouched.':
      'Supprimer le compte {email} d’Octopus Mail ? Votre courrier sur le serveur reste intact.',
    'Remove account': 'Supprimer le compte',
    'Cancel': 'Annuler',
    'Sender name': 'Nom de l’expéditeur',
    'Color': 'Couleur',
    'New password (leave empty to keep the current one)': 'Nouveau mot de passe (laissez vide pour conserver l’actuel)',
    'Sync history (days)': 'Historique de synchronisation (jours)',
    'Smart (people and priority senders)': 'Intelligent (personnes et expéditeurs prioritaires)',
    'All': 'Tous',
    'Off': 'Désactivé',
    'Add alias (sender address)': 'Ajouter un alias (adresse d’expéditeur)',
    'e.g. office@yourcompany.com': 'par ex. bureau@votresociete.fr',
    'Account enabled': 'Compte activé',
    'A disabled account is not synced.': 'Un compte désactivé n’est pas synchronisé.',
    'Servers': 'Serveurs',
    'IMAP port': 'Port IMAP',
    'SMTP port': 'Port SMTP',
    'Username': 'Nom d’utilisateur',

    // appearance & general
    'Appearance': 'Apparence',
    'Language': 'Langue',
    'The window reloads to apply the language.': 'La fenêtre se recharge pour appliquer la langue.',
    'Automatic (system language)': 'Automatique (langue du système)',
    'Theme': 'Thème',
    'Match system': 'Comme le système',
    'Light': 'Clair',
    'Dark': 'Sombre',
    'List density': 'Densité de la liste',
    'Comfortable (with preview)': 'Confortable (avec aperçu)',
    'Compact': 'Compacte',
    'Startup': 'Démarrage',
    'Launch when Windows starts': 'Lancer au démarrage de Windows',
    'Snoozed messages, reminders and scheduled sends then work without opening the window.':
      'Les messages reportés, les rappels et les envois programmés fonctionnent alors sans ouvrir la fenêtre.',
    'Closing the window keeps the app running in the tray': 'Fermer la fenêtre laisse l’application active dans la zone de notification',
    'Sending': 'Envoi',
    'Default sending account': 'Compte d’envoi par défaut',
    'Last used': 'Dernier utilisé',
    'Undo send window: {n} s': 'Délai d’annulation de l’envoi : {n} s',

    // inbox & gatekeeper
    'Automatically sorts mail into People, Notifications and Newsletters (based on headers, Gmail categories and your choices).':
      'Trie automatiquement le courrier en Personnes, Notifications et Newsletters (selon les en-têtes, les catégories Gmail et vos choix).',
    'Turn on Smart Inbox': 'Activer Smart Inbox',
    'Group notifications into one card': 'Regrouper les notifications en une seule carte',
    'Group newsletters into one card': 'Regrouper les newsletters en une seule carte',
    'Mark as read when opened': 'Marquer comme lu à l’ouverture',
    'Gatekeeper': 'Gatekeeper',
    'New senders (people who have never received an email from you) wait in a separate section until you accept or block them.':
      'Les nouveaux expéditeurs (personnes à qui vous n’avez jamais écrit) attendent dans une section séparée que vous les acceptiez ou les bloquiez.',
    'Screen new senders before they reach the Inbox': 'Filtrer les nouveaux expéditeurs avant la boîte de réception',
    'Privacy': 'Confidentialité',
    'Remote images in messages': 'Images distantes dans les messages',
    'Only from people I know': 'Uniquement de personnes que je connais',
    'Always': 'Toujours',
    'Never (ask)': 'Jamais (demander)',
    'Block tracking pixels': 'Bloquer les pixels espions',
    'Removes the invisible images senders use to check whether you have read their message.':
      'Supprime les images invisibles que les expéditeurs utilisent pour savoir si vous avez lu leur message.',
    'Snooze & reminders': 'Report et rappels',
    '“Morning” hour': 'Heure du « matin »',
    '“Evening” hour': 'Heure du « soir »',
    'Downloading': 'Téléchargement',
    'Download message content from the last (days)': 'Télécharger le contenu des messages des derniers (jours)',
    'For full-text search and offline AI. Older content is downloaded when you open a message.':
      'Pour la recherche en texte intégral et l’IA hors ligne. Le contenu plus ancien est téléchargé à l’ouverture du message.',

    // notifications
    'System notifications': 'Notifications système',
    'Show notifications for new mail': 'Afficher les notifications de nouveaux messages',
    'Notification sound': 'Son de notification',
    'Mode per account': 'Mode par compte',
    '“Smart” = only messages from people and priority senders, no newsletters or automated mail.':
      '« Intelligent » = uniquement les messages de personnes et d’expéditeurs prioritaires, sans newsletters ni courriers automatiques.',
    'Smart': 'Intelligent',

    // signatures
    'Choose the default signature for an account in the Accounts tab. You can use plain text or HTML.':
      'Choisissez la signature par défaut d’un compte dans l’onglet Comptes. Vous pouvez utiliser du texte brut ou du HTML.',
    'Delete this signature?': 'Supprimer cette signature ?',
    'My signature': 'Ma signature',
    'New signature': 'Nouvelle signature',
    'Name': 'Nom',
    'Content (text or HTML)': 'Contenu (texte ou HTML)',
    'Preview:': 'Aperçu :',

    // templates (the field names {{recipient first name}} stay in English: the template engine knows them)
    'Type fields to fill in as {field}. Automatic: {auto1}, {auto2}, {auto3}.':
      'Saisissez les champs à compléter sous la forme {field}. Automatiques : {auto1}, {auto2}, {auto3}.',
    'Field name': 'Nom du champ',
    'fields: {list}': 'champs : {list}',
    'Delete this template?': 'Supprimer ce modèle ?',
    'New template': 'Nouveau modèle',
    'Template': 'Modèle',
    'Subject': 'Objet',
    'Body': 'Corps',
    'Hi {{recipient first name}},\n\nhere is the quote for {{Project}}…': 'Bonjour {{recipient first name}},\n\nvoici le devis pour {{Project}}…',

    // rules: fields, operators, actions
    'Sender': 'Expéditeur',
    'To': 'À',
    'To or Cc': 'À ou Cc',
    'Account': 'Compte',
    'Category': 'Catégorie',
    'Attachment (yes/no)': 'Pièce jointe (yes/no)',
    'Mailing list': 'Liste de diffusion',
    'contains': 'contient',
    'does not contain': 'ne contient pas',
    'is exactly': 'est exactement',
    'starts with': 'commence par',
    'ends with': 'se termine par',
    'matches the regular expression': 'correspond à l’expression régulière',
    'Done (archive)': 'Terminé (archiver)',
    'Mark as read': 'Marquer comme lu',
    'Pin': 'Épingler',
    'Move to folder': 'Déplacer vers un dossier',
    'folder path': 'chemin du dossier',
    'Add label (Gmail)': 'Ajouter un libellé (Gmail)',
    'label': 'libellé',
    'Set category': 'Définir la catégorie',
    'Snooze for N hours': 'Reporter de N heures',
    'number of hours': 'nombre d’heures',
    'Mute conversation': 'Mettre la conversation en sourdine',
    'Set aside': 'Mettre de côté',
    'No notification': 'Aucune notification',
    'Move to Trash': 'Mettre à la corbeille',
    'Block sender': 'Bloquer l’expéditeur',

    // rules
    'They run on new messages arriving in the Inbox (e.g. “from invoices@… → label Accounting and done”).':
      'Elles s’appliquent aux nouveaux messages arrivant dans la boîte de réception (par ex. « de factures@… → libellé Comptabilité et terminé »).',
    '{field} {op} “{value}”': '{field} {op} « {value} »',
    'and': 'et',
    'or': 'ou',
    'used {n}×': 'utilisée {n}×',
    'Apply now': 'Appliquer maintenant',
    'Delete this rule?': 'Supprimer cette règle ?',
    'New rule': 'Nouvelle règle',
    'Rule': 'Règle',
    'Matches {n} of the recent messages in the Inbox': 'Correspond à {n} des messages récents de la boîte de réception',
    'Test': 'Tester',
    'When': 'Quand',
    'all of the conditions': 'toutes les conditions',
    'any of the conditions': 'l’une des conditions',
    'are met:': 'sont remplies :',
    'Condition': 'Condition',
    'Then:': 'Alors :',
    'Action': 'Action',
    'Stop processing more rules': 'Ne pas traiter les règles suivantes',

    // AI
    'AI engine': 'Moteur d’IA',
    'Summaries, reply drafting, translations, quick replies and questions about your mail.':
      'Résumés, rédaction de réponses, traductions, réponses rapides et questions sur votre courrier.',
    'Provider': 'Fournisseur',
    'Ollama — local, free, private': 'Ollama — local, gratuit, privé',
    'Claude (Anthropic) — best quality, pay per use': 'Claude (Anthropic) — meilleure qualité, paiement à l’usage',
    'Ollama (local)': 'Ollama (local)',
    'Ollama address': 'Adresse d’Ollama',
    'Ollama is not responding — start it to see the models.': 'Ollama ne répond pas — démarrez-le pour voir les modèles.',
    'gemma3:12b and qwen3:8b work well, also for Polish.': 'gemma3:12b et qwen3:8b fonctionnent bien, y compris pour le polonais.',
    'Refresh list': 'Actualiser la liste',
    'The key from console.anthropic.com is stored {where}. Email content is then sent to the Anthropic API.':
      'La clé de console.anthropic.com est conservée {where}. Le contenu des e-mails est alors envoyé à l’API Anthropic.',
    'API key (saved — enter a new one to change it)': 'Clé API (enregistrée — saisissez-en une nouvelle pour la changer)',
    'API key': 'Clé API',
    'Key saved': 'Clé enregistrée',
    'Key removed': 'Clé supprimée',
    'Remove': 'Supprimer',
    'Style': 'Style',
    'Reply language': 'Langue des réponses',
    'Same as the conversation': 'Comme la conversation',
    'Always in Polish': 'Toujours en polonais',
    'Always in English': 'Toujours en anglais',
    'Always in French': 'Toujours en français',
    'Always in Spanish': 'Toujours en espagnol',
    'About me (persona)': 'À propos de moi (persona)',
    'Who you are and how you write — the AI uses this when drafting replies.':
      'Qui vous êtes et comment vous écrivez — l’IA s’en sert pour rédiger les réponses.',
    'e.g. Anna, owner of a small design studio. I write briefly and to the point, on a first-name basis.':
      'par ex. Anna, gérante d’un petit studio de design. J’écris de façon brève et directe, en m’adressant aux gens par leur prénom.',

    // AI agents & CLI
    'Copied': 'Copié',
    'Could not copy': 'Copie impossible',
    'AI agent access level': 'Niveau d’accès des agents IA',
    'Applies to the `octo` CLI and the MCP server (Claude Code, Claude Desktop). It can only be changed here — an agent cannot raise its own permissions.':
      'S’applique au CLI `octo` et au serveur MCP (Claude Code, Claude Desktop). Il ne peut être modifié qu’ici — un agent ne peut pas élever ses propres droits.',
    'Connect to Claude Code': 'Connecter à Claude Code',
    'Once, in a terminal. Claude can then read and triage your mail and (if you allow it) send mail and manage your calendar.':
      'Une seule fois, dans un terminal. Claude peut ensuite lire et trier votre courrier et (si vous l’autorisez) envoyer des messages et gérer votre calendrier.',
    'Copy': 'Copier',
    'Command line: {cmd}. The CLI also works when the app is closed and prints times in local time with the UTC offset.':
      'Ligne de commande : {cmd}. Le CLI fonctionne aussi lorsque l’application est fermée et affiche les heures en heure locale avec le décalage UTC.',
    'Recent agent activity': 'Activité récente des agents',
    'None': 'Aucune',

    // calendars
    'Calendar sources': 'Sources de calendriers',
    'Google Calendar is added automatically for accounts signed in with Google OAuth. Add others (iCloud, Fastmail, Nextcloud, ICS, local) in the Calendar view.':
      'Google Agenda est ajouté automatiquement pour les comptes connectés via Google OAuth. Ajoutez les autres (iCloud, Fastmail, Nextcloud, ICS, local) dans la vue Calendrier.',
    'Sync': 'Synchroniser',
    'Remove this calendar source?': 'Supprimer cette source de calendrier ?',
    'No calendars.': 'Aucun calendrier.',

    // home server
    'Found the server “{host}” (version {version})': 'Serveur « {host} » trouvé (version {version})',
    'After connecting, the app restarts and uses the accounts on the home server. Accounts added on this computer stay here, but are not used until you disconnect the server. Continue?':
      'Après la connexion, l’application redémarre et utilise les comptes du serveur domestique. Les comptes ajoutés sur cet ordinateur restent ici, mais ne sont pas utilisés tant que vous ne déconnectez pas le serveur. Continuer ?',
    'An always-on computer (Raspberry Pi, NAS, old laptop) running Octopus Mail. It sends scheduled messages and brings back snoozed messages and reminders even when your computers are off, and all your computers and your phone’s browser see the same accounts.':
      'Un ordinateur toujours allumé (Raspberry Pi, NAS, vieux portable) qui fait tourner Octopus Mail. Il envoie les messages programmés et ramène les messages reportés et les rappels même lorsque vos ordinateurs sont éteints ; tous vos ordinateurs et le navigateur de votre téléphone voient les mêmes comptes.',
    '1. On the server, run:': '1. Sur le serveur, exécutez :',
    'It prints the address (e.g. {example}) and a pairing code. Installing on a Raspberry Pi: README, section “Home server”.':
      'Il affiche l’adresse (par ex. {example}) et un code de jumelage. Installation sur Raspberry Pi : README, section « Serveur domestique ».',
    '2. Connect this app:': '2. Connectez cette application :',
    'Server address': 'Adresse du serveur',
    'e.g. 192.168.1.50 or raspberrypi.local': 'par ex. 192.168.1.50 ou raspberrypi.local',
    'Pairing code': 'Code de jumelage',
    'Name of this device': 'Nom de cet appareil',
    'e.g. Anna’s laptop': 'par ex. Portable d’Anna',
    'Connect to server': 'Se connecter au serveur',
    'Security': 'Sécurité',
    'Each device gets its own key, which you can revoke at any time. The server stores your mailbox passwords, so keep it on your home network. For access from outside your home, use a VPN (e.g. Tailscale) rather than port forwarding on your router.':
      'Chaque appareil reçoit sa propre clé, que vous pouvez révoquer à tout moment. Le serveur conserve les mots de passe de vos boîtes, gardez-le donc sur votre réseau domestique. Pour y accéder depuis l’extérieur, utilisez un VPN (par ex. Tailscale) plutôt qu’une redirection de port sur votre routeur.',
    'server': 'serveur',
    'Server': 'Serveur',
    'Connected': 'Connecté',
    'Not connected — the app keeps retrying': 'Non connecté — l’application réessaie',
    'this device: {name}': 'cet appareil : {name}',
    'Disconnect this app from the home server? It restarts in local mode (with the accounts added on this computer).':
      'Déconnecter cette application du serveur domestique ? Elle redémarre en mode local (avec les comptes ajoutés sur cet ordinateur).',
    'Disconnect': 'Déconnecter',
    'Devices': 'Appareils',
    'Computers and browsers that have access to your mail on the server.': 'Ordinateurs et navigateurs ayant accès à votre courrier sur le serveur.',
    'this device': 'cet appareil',
    'paired {when}': 'jumelé {when}',
    'last seen {when}': 'vu {when}',
    'Revoke access for the device “{name}”?': 'Révoquer l’accès de l’appareil « {name} » ?',
    'Revoke access': 'Révoquer l’accès',
    'Add device': 'Ajouter un appareil',
    'Pairing code (one-time, valid until {time})': 'Code de jumelage (à usage unique, valable jusqu’à {time})',
    'Computer: Settings → Home server. Phone or browser: open {url} and enter the code.':
      'Ordinateur : Paramètres → Serveur domestique. Téléphone ou navigateur : ouvrez {url} et saisissez le code.',
    'Claude Code with a home server': 'Claude Code avec un serveur domestique',
    'The agent connects to the server over SSH, e.g.: {cmd}': 'L’agent se connecte au serveur via SSH, par ex. : {cmd}',

    // keyboard shortcuts
    'New message': 'Nouveau message',
    'Command palette': 'Palette de commandes',
    '/ or Ctrl+F': '/ ou Ctrl+F',
    'Search': 'Rechercher',
    'Next / previous conversation': 'Conversation suivante / précédente',
    'Pin / unpin': 'Épingler / désépingler',
    'Snooze': 'Reporter',
    'Read / unread': 'Lu / non lu',
    'Mute': 'Sourdine',
    'Reply / reply all / forward': 'Répondre / répondre à tous / transférer',
    'Select': 'Sélectionner',
    'Undo last action': 'Annuler la dernière action',
    'Send (in the editor)': 'Envoyer (dans l’éditeur)',
    'Close / deselect': 'Fermer / désélectionner',
    'G then I / S / D / P / Z / A / T / N': 'G puis I / S / D / P / Z / A / T / N',
    'Go to: Inbox / Sent / Drafts / Pinned / Snoozed / Archive / Trash / New senders':
      'Aller à : Boîte de réception / Envoyés / Brouillons / Épinglés / Reportés / Archives / Corbeille / Nouveaux expéditeurs',
    'G then C': 'G puis C',
    'Calendar': 'Calendrier',

    // about
    'A free email client with Smart Inbox, Gatekeeper, AI, a calendar and access for AI agents.':
      'Un client de messagerie gratuit avec Smart Inbox, Gatekeeper, IA, calendrier et accès pour les agents IA.',
    'Open source (MIT license):': 'Open source (licence MIT) :',
    'report a bug': 'signaler un bug',
    'App data:': 'Données de l’application :',
  },
  plurals: {
    'Applied to {n} existing conversation': [
      'Appliqué à {n} conversation existante',
      'Appliqué à {n} conversations existantes',
      'Appliqué à {n} conversations existantes',
    ],
  },
}
export default dict
