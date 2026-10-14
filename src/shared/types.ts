// Data shapes shared by core, Electron main, renderer, CLI and MCP.

export type AgentAccess = 'none' | 'read' | 'triage' | 'send'
export type AuthKind = 'password' | 'oauth-google' | 'oauth-microsoft'
export type Category = 'people' | 'notification' | 'newsletter'
export type FolderRole =
  | 'inbox' | 'sent' | 'drafts' | 'trash' | 'junk' | 'archive' | 'all' | 'flagged' | 'important' | 'blocked'
export type NotifyMode = 'all' | 'smart' | 'none'

export interface Address {
  name?: string
  email: string
}

export interface Account {
  id: number
  email: string
  name: string
  provider: string
  auth: AuthKind
  username: string
  imap_host: string
  imap_port: number
  imap_secure: boolean
  smtp_host: string
  smtp_port: number
  smtp_secure: boolean
  color: string | null
  sort: number
  enabled: boolean
  agent_access: AgentAccess
  sync_days: number
  is_gmail: boolean
  notify: NotifyMode
  last_error: string | null
  last_sync: number | null
}

export interface AccountInput {
  email: string
  name?: string
  provider?: string
  auth?: AuthKind
  username?: string
  password?: string
  imap_host?: string
  imap_port?: number
  imap_secure?: boolean
  smtp_host?: string
  smtp_port?: number
  smtp_secure?: boolean
  color?: string
  sync_days?: number
}

export interface Folder {
  id: number
  account_id: number
  path: string
  name: string
  delimiter: string | null
  parent_path: string | null
  role: FolderRole | null
  total: number
  unread: number
  sync_mode: string
  last_sync: number | null
}

/** A virtual or real mailbox the UI can show. */
export type MailboxRef =
  | { kind: 'smart' } // Smart Inbox (all inbox threads, grouped by category)
  | { kind: 'unified'; role: FolderRole } // unified Inbox / Sent / Drafts / Archive...
  | { kind: 'folder'; folderId: number }
  | { kind: 'pinned' }
  | { kind: 'snoozed' }
  | { kind: 'setaside' }
  | { kind: 'scheduled' }
  | { kind: 'reminders' }
  | { kind: 'newsenders' }
  | { kind: 'blocked' }
  | { kind: 'category'; category: Category }
  | { kind: 'search'; query: string }
  | { kind: 'smartfolder'; id: number }
  | { kind: 'local-drafts' }

export interface ThreadSummary {
  thread_id: number
  account_id: number
  account_email: string
  account_color: string | null
  subject: string
  snippet: string
  participants: Address[]
  from: Address
  last_date: number
  message_count: number
  unread: boolean
  unread_count: number
  flagged: boolean
  has_attachments: boolean
  category: Category | null
  pinned: boolean
  muted: boolean
  snoozed_until: number | null
  set_aside: boolean
  reminder_at: number | null
  resurfaced_at: number | null
  has_draft: boolean
  latest_message_id: number
  folder_ids: number[]
  labels: string[]
  is_new_sender: boolean
  priority: boolean
  outgoing_last: boolean
}

export interface AttachmentInfo {
  id: number
  message_id: number
  part: string
  filename: string
  mime: string
  size: number
  content_id: string | null
  inline: boolean
  path: string | null
}

export interface MessageView {
  id: number
  account_id: number
  folder_id: number
  folder_role: FolderRole | null
  thread_id: number
  uid: number
  msgid: string | null
  subject: string
  from: Address
  to: Address[]
  cc: Address[]
  bcc: Address[]
  reply_to: Address[]
  date: number
  seen: boolean
  flagged: boolean
  answered: boolean
  is_outgoing: boolean
  snippet: string
  html: string | null
  text: string | null
  body_state: number
  attachments: AttachmentInfo[]
  list_unsubscribe: string | null
  list_unsubscribe_post: string | null
  calendar_part: string | null
  category: Category | null
  labels: string[]
}

export interface ThreadView {
  thread: ThreadSummary
  messages: MessageView[]
  drafts: DraftView[]
}

export type DraftStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled'

export interface DraftAttachment {
  filename: string
  path: string
  mime?: string
  size?: number
  content_id?: string
}

export interface DraftView {
  id: number
  account_id: number
  from_email: string | null
  from_name: string | null
  to: Address[]
  cc: Address[]
  bcc: Address[]
  subject: string
  html: string
  text: string
  attachments: DraftAttachment[]
  reply_to_message_id: number | null
  forward_of_message_id: number | null
  reply_kind: 'reply' | 'replyall' | 'forward' | null
  thread_id: number | null
  status: DraftStatus
  send_at: number | null
  sent_at: number | null
  error: string | null
  remind_at: number | null
  remind_kind: string | null
  signature: boolean
  source: string
  created_at: number
  updated_at: number
}

export interface DraftInput {
  id?: number
  account_id?: number
  from_email?: string
  to?: Address[] | string[]
  cc?: Address[] | string[]
  bcc?: Address[] | string[]
  subject?: string
  html?: string
  text?: string
  markdown?: string
  attachments?: DraftAttachment[]
  reply_to_message_id?: number
  reply_all?: boolean
  forward_of_message_id?: number
  signature?: boolean
  template_id?: number
  placeholders?: Record<string, string>
  source?: string
}

export interface Contact {
  id: number
  email: string
  name: string | null
  status: 'unknown' | 'accepted' | 'blocked'
  category: Category | null
  vip: boolean
  notes: string | null
  phone: string | null
  company: string | null
  sent_count: number
  recv_count: number
  last_sent: number | null
  last_received: number | null
  source: string
}

export interface Template {
  id: number
  name: string
  subject: string | null
  html: string | null
  to: Address[]
  cc: Address[]
  bcc: Address[]
  account_id: number | null
  shortcut: string | null
  placeholders: string[]
  updated_at: number
}

export interface Signature {
  id: number
  name: string
  html: string
}

export interface RuleCondition {
  field: 'from' | 'to' | 'cc' | 'subject' | 'body' | 'account' | 'category' | 'has_attachment' | 'list_id' | 'any_recipient'
  op: 'contains' | 'not_contains' | 'equals' | 'starts_with' | 'ends_with' | 'matches' | 'is'
  value: string
}

export interface RuleAction {
  type:
    | 'move' | 'archive' | 'trash' | 'mark_read' | 'pin' | 'mute' | 'categorize' | 'snooze'
    | 'label' | 'block' | 'notify' | 'no_notify' | 'forward' | 'set_aside'
  value?: string
}

export interface Rule {
  id: number
  name: string
  enabled: boolean
  match: 'all' | 'any'
  conditions: RuleCondition[]
  actions: RuleAction[]
  stop: boolean
  sort: number
  hits: number
}

export interface SmartFolder {
  id: number
  name: string
  query: string
  icon: string | null
  sort: number
}

export interface CalendarInfo {
  id: number
  source_id: number
  name: string
  color: string | null
  readonly: boolean
  enabled: boolean
  is_default: boolean
  source_kind: string
  source_name: string
}

export interface CalendarEvent {
  id: number
  calendar_id: number
  uid: string
  summary: string
  description: string | null
  location: string | null
  start: number
  end: number
  all_day: boolean
  recurring: boolean
  status: string | null
  organizer: Address | null
  attendees: (Address & { status?: string; role?: string })[]
  my_status: string | null
  conference_url: string | null
  color: string | null
  calendar_name: string
}

export interface EventInput {
  id?: number
  calendar_id?: number
  summary: string
  description?: string
  location?: string
  start: number
  end: number
  all_day?: boolean
  attendees?: string[]
  conference_url?: string
}

export interface SyncStatus {
  account_id: number
  email: string
  state: 'idle' | 'connecting' | 'syncing' | 'error' | 'offline' | 'disabled'
  detail: string | null
  error: string | null
  last_sync: number | null
}

export interface HistoryEntry {
  id: number
  at: number
  actor: string
  action: string
  target: string | null
  details: string | null
  ok: boolean
}

export interface AppSettings {
  theme: 'system' | 'light' | 'dark'
  density: 'comfortable' | 'compact'
  /** UI language; 'auto' follows the system (Polish systems → Polish, others → English) */
  language: 'auto' | 'pl' | 'en'
  smartInbox: boolean
  groupNewsletters: boolean
  groupNotifications: boolean
  gatekeeper: 'off' | 'on'
  undoSendSeconds: number
  markReadOnOpen: boolean
  loadRemoteImages: 'always' | 'contacts' | 'never'
  blockTrackers: boolean
  notifications: boolean
  notificationSound: boolean
  launchAtLogin: boolean
  minimizeToTray: boolean
  ai: {
    provider: 'ollama' | 'claude' | 'openai' | 'anthropic-compat' | 'off'
    ollamaUrl: string
    ollamaModel: string
    ollamaEmbedModel: string
    claudeModel: string
    /** any OpenAI-compatible endpoint (Mammouth, OpenRouter, LM Studio …): base URL ending in /v1 */
    openaiUrl: string
    openaiModel: string
    /** any Anthropic-compatible endpoint (/v1/messages): base URL without the /v1/messages part */
    anthropicCompatUrl: string
    anthropicCompatModel: string
    smartCategorize: boolean
    autoSummaries: boolean
    replyLanguage: 'auto' | 'pl' | 'en'
    persona: string
  }
  snoozeMorningHour: number
  snoozeEveningHour: number
  weekStartsOn: 0 | 1
  defaultAccountId: number | null
  timeZone: string
  swipeLeft: string
  swipeRight: string
  conversationOrder: 'newest-bottom' | 'newest-top'
  bodyPrefetchDays: number
}

export interface SearchResult {
  threads: ThreadSummary[]
  total: number
}

export interface AiResult {
  text: string
  provider: string
  model: string
  cached?: boolean
}

export type CoreEvent =
  | { type: 'mailbox-changed'; accountId?: number; folderIds?: number[] }
  | { type: 'thread-changed'; threadIds: number[] }
  | { type: 'sync-status'; status: SyncStatus }
  | { type: 'new-mail'; accountId: number; messageIds: number[] }
  | { type: 'drafts-changed' }
  | { type: 'contacts-changed' }
  | { type: 'calendar-changed' }
  | { type: 'settings-changed' }
  | { type: 'toast'; level: 'info' | 'error' | 'success'; message: string; action?: { label: string; command: string; args?: unknown } }
  | { type: 'reminder'; threadId: number; subject: string }
  | { type: 'server-connection'; online: boolean; url: string }
