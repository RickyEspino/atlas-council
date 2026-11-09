import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import {
  ChevronDown,
  Columns3,
  Ellipsis,
  FileText,
  Maximize2,
  Pencil,
  Radio,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { startDemo } from '../lib/engine'
import { COUNCIL_STARTERS, COUNCIL_STARTER_EVENT, orderCouncilSeats } from '../lib/councilPresentation'
import type { Session } from '../lib/types'
import { modelLabel, providerReady, useFeatures, useStore } from '../store'
import { MessageView } from './MessageView'
import { ModelPicker } from './ModelPicker'
import { ParticipantsBar } from './ParticipantsBar'
import { Button, Dialog, Dot, IconButton, Logo, MenuItem, Popover, cn, inputClass } from './ui'

function ModelButton({ session }: { session: Session }) {
  const setChatModel = useStore((s) => s.setChatModel)
  const participant = session.participants[0]
  const provider = useStore((s) => s.providers.find((p) => p.id === participant?.providerId))
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  return (
    <>
      <button
        type="button"
        title="Choose a model"
        onClick={(e) => setAnchor(e.currentTarget)}
        className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-[15px] font-semibold hover:bg-hover"
      >
        {participant ? (
          <>
            <Dot color={participant.color} />
            <span className="truncate">{modelLabel(provider, participant.modelId)}</span>
          </>
        ) : (
          <span className="text-muted">Choose a model</span>
        )}
        <ChevronDown className="size-4 shrink-0 text-subtle" />
      </button>
      <ModelPicker
        anchor={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        selected={participant ? { providerId: participant.providerId, modelId: participant.modelId } : undefined}
        onSelect={(ref) => setChatModel(session.id, ref)}
      />
    </>
  )
}

/** The title without the "Model: " prefix that broadcast chats get (the header already shows the model). */
function paneTitle(session: Session): string {
  const prefix = session.kind === 'group' ? 'Group: ' : session.participants[0] ? `${session.participants[0].name}: ` : ''
  return prefix && session.title.startsWith(prefix) ? session.title.slice(prefix.length) : session.title
}

function InstructionsDialog({ session, onClose }: { session: Session; onClose: () => void }) {
  const updateSession = useStore((s) => s.updateSession)
  const fallback = useStore((s) => s.settings.defaultSystemPrompt)
  const [value, setValue] = useState(session.systemPrompt ?? '')
  return (
    <Dialog open onClose={onClose} title="Instructions for this chat" className="max-w-xl">
      <div className="space-y-3 p-5">
        <p className="text-sm text-muted">
          A system prompt sent with every request in this chat.
          {session.kind === 'group' && ' Each model in the group also gets its own persona, if you set one.'}
        </p>
        <textarea
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={fallback || 'e.g. Answer like a patient tutor. Use short paragraphs.'}
          className={cn(inputClass, 'min-h-40 resize-y')}
        />
        {!value && fallback && <p className="text-xs text-subtle">Leave empty to use the default from Settings → General.</p>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              updateSession(session.id, { systemPrompt: value.trim() || undefined })
              onClose()
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

function PaneMenu({ session, multi, onRename }: { session: Session; multi: boolean; onRename: () => void }) {
  const setPanes = useStore((s) => s.setPanes)
  const deleteSession = useStore((s) => s.deleteSession)
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [instructions, setInstructions] = useState(false)
  const close = () => setAnchor(null)
  return (
    <>
      <IconButton label="Chat options" onClick={(e) => setAnchor(e.currentTarget)}>
        <Ellipsis className="size-4" />
      </IconButton>
      <Popover anchor={anchor} open={!!anchor} onClose={close} align="end" className="w-52">
        <MenuItem icon={<Pencil className="size-3.5" />} onClick={() => (close(), onRename())}>
          Rename
        </MenuItem>
        <MenuItem icon={<FileText className="size-3.5" />} onClick={() => (close(), setInstructions(true))}>
          Instructions{session.systemPrompt ? ' (set)' : ''}
        </MenuItem>
        {multi && (
          <MenuItem icon={<Maximize2 className="size-3.5" />} onClick={() => (close(), setPanes([session.id]))}>
            Show only this chat
          </MenuItem>
        )}
        <MenuItem
          danger
          icon={<Trash2 className="size-3.5" />}
          onClick={() => {
            close()
            if (session.messages.length === 0 || window.confirm(`Delete "${session.title}"?`)) deleteSession(session.id)
          }}
        >
          Delete chat
        </MenuItem>
      </Popover>
      {instructions && <InstructionsDialog session={session} onClose={() => setInstructions(false)} />}
    </>
  )
}

function EmptyState({ session, compact }: { session: Session; compact: boolean }) {
  const openSettings = useStore((s) => s.openSettings)
  const hasRealProvider = useStore((s) => s.providers.some((p) => p.kind !== 'demo' && providerReady(s, p)))
  const chatgptProvider = useStore((s) => s.providers.find((p) => p.kind === 'chatgpt' && p.enabled))
  const features = useFeatures()

  if (session.kind === 'group') {
    const count = session.participants.length
    return (
      <div className="atlas-welcome flex h-full flex-col items-center justify-center overflow-y-auto px-5 py-10 text-center">
        <div className="atlas-welcome-halo"><Logo className="size-[76px]" /></div>
        <div className="atlas-eyebrow mt-7">{count < 2 ? 'ASSEMBLE THE COUNCIL' : 'THE COUNCIL AWAITS'}</div>
        <h2 className="atlas-welcome-title mt-3">{count === 3 ? 'Three minds.' : count === 0 ? 'Your Council.' : `${count} perspectives.`}<br /><span>One better question.</span></h2>
        <p className="mt-4 max-w-lg text-sm leading-7 text-muted">
          {count < 2
            ? 'Add at least two models above to assemble your Council.'
            : 'Bring the question. Let distinct perspectives challenge assumptions, find the blind spots, and build something worth acting on.'}
        </p>
        <div className="atlas-welcome-roster mt-8">
          {orderCouncilSeats(session.participants).map((p) => (
            <div key={p.id} className="atlas-welcome-seat">
              <span className="atlas-welcome-seat-mark" style={{ backgroundColor: `${p.color}24`, color: p.color, borderColor: `${p.color}70` }}>
                {p.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="truncate text-sm font-semibold">{p.name}</span>
              <span className="text-[11px] text-subtle">{p.name.toLowerCase().includes('solara') ? 'THE VISIONARY' : (p.name.toLowerCase().includes('vector') || p.name.toLowerCase().includes('vectone')) ? 'THE CHALLENGER' : 'THE STRATEGIST'}</span>
            </div>
          ))}
        </div>
        {count >= 2 && (
          <div className="atlas-starters mt-8">
            <div className="atlas-section-label mb-2 text-center">START A CONVERSATION</div>
            <p className="mb-3 text-xs text-muted">Choose a starting point, then personalize the prompt.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {COUNCIL_STARTERS.map((item) => (
                <button key={item.label} type="button" className="atlas-starter" onClick={() => window.dispatchEvent(new CustomEvent(COUNCIL_STARTER_EVENT, {
                  detail: { sessionId: session.id, prompt: item.prompt },
                }))}>
                  {item.label} <span aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <Logo className={compact ? 'size-10' : 'size-14'} />
      <h2 className={cn('font-semibold', compact ? 'text-lg' : 'text-2xl')}>What can I help with?</h2>
      {!hasRealProvider && (
        <div className="max-w-md rounded-2xl border border-line bg-sidebar p-4 text-left">
          <div className="text-sm font-medium">Connect a model provider</div>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            Add an API key for Anthropic, OpenAI, Google or any OpenAI-compatible service
            {chatgptProvider ? ', or use your ChatGPT Plus or Pro plan' : ''}. Until then you can try the simulated demo
            models.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="primary" onClick={() => openSettings('providers')}>
              Add an API key
            </Button>
            {chatgptProvider && (
              <Button size="sm" onClick={() => openSettings('providers', chatgptProvider.id)}>
                Use your ChatGPT plan
              </Button>
            )}
            {features.broadcast && (
              <Button size="sm" onClick={() => startDemo('compare')}>
                <Columns3 className="size-3.5" /> Demo: compare models
              </Button>
            )}
            {features.groupChat && (
              <Button size="sm" onClick={() => startDemo('group')}>
                <Users className="size-3.5" /> Demo: group chat
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function MessageList({ session, compact }: { session: Session; compact: boolean }) {
  const running = useStore((s) => !!s.running[session.id])
  const scroller = useRef<HTMLDivElement>(null)
  const stickToBottom = useRef(true)
  const lastCount = useRef(session.messages.length)

  useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
    const grew = session.messages.length > lastCount.current
    lastCount.current = session.messages.length
    if (grew && session.messages[session.messages.length - 1]?.role === 'user') stickToBottom.current = true
    if (stickToBottom.current) el.scrollTop = el.scrollHeight
  }, [session.messages])

  if (session.messages.length === 0) return <EmptyState session={session} compact={compact} />

  const lastAssistant = [...session.messages].reverse().find((m) => m.role === 'assistant')
  const lastMessage = session.messages[session.messages.length - 1]
  const participants = new Map(session.participants.map((p) => [p.id, p]))

  return (
    <div
      ref={scroller}
      onScroll={(e) => {
        const el = e.currentTarget
        stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
      }}
      className="atlas-message-list @container h-full overflow-y-auto"
    >
      <div className={cn('mx-auto flex flex-col gap-6 py-6', compact ? 'px-4' : 'max-w-[920px] px-5 sm:px-7')}>
        {session.messages.map((message) => (
          <MessageView
            key={message.id}
            message={message}
            sessionId={session.id}
            participant={message.participantId ? participants.get(message.participantId) : undefined}
            canRegenerate={!running && message.id === lastAssistant?.id && message.id === lastMessage.id}
            canEdit={!running && message.role === 'user'}
          />
        ))}
      </div>
    </div>
  )
}

export function ChatPane({ sessionId, multi, leading }: { sessionId: string; multi: boolean; leading?: ReactNode }) {
  const session = useStore((s) => s.sessions[sessionId])
  const focused = useStore((s) => s.focusedPane === sessionId)
  const excluded = useStore((s) => !!s.excludedTargets[sessionId])
  const running = useStore((s) => !!s.running[sessionId])
  const focusPane = useStore((s) => s.focusPane)
  const toggleTarget = useStore((s) => s.toggleTarget)
  const closePane = useStore((s) => s.closePane)
  const renameSession = useStore((s) => s.renameSession)
  const features = useFeatures()
  const [renaming, setRenaming] = useState(false)

  if (!session) return null
  const broadcasting = multi && features.broadcast

  return (
    <section
      onMouseDown={() => focusPane(sessionId)}
      className={cn(
        'atlas-chat-pane relative flex min-w-[300px] flex-1 flex-col border-line',
        multi && 'border-r last:border-r-0',
      )}
    >
      {multi && (
        <div
          className={cn(
            'absolute inset-x-0 top-0 h-0.5 transition-colors',
            broadcasting ? (excluded ? 'bg-transparent' : 'bg-accent/70') : focused ? 'bg-accent' : 'bg-transparent',
          )}
        />
      )}
      <header className="atlas-chamber-header flex h-14 shrink-0 items-center gap-1 px-3">
        {leading}
        {session.kind === 'chat' ? (
          <ModelButton session={session} />
        ) : multi ? (
          <span className="flex shrink-0 items-center gap-1.5 px-2 text-[15px] font-semibold">
            <Users className="size-4 text-muted" /> Group
          </span>
        ) : (
          <ParticipantsBar session={session} />
        )}
        <div className="min-w-0 flex-1 px-1">
          {renaming ? (
            <input
              autoFocus
              defaultValue={session.title}
              className={cn(inputClass, 'h-8 py-1')}
              onBlur={(e) => {
                renameSession(session.id, e.target.value)
                setRenaming(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur()
                if (e.key === 'Escape') setRenaming(false)
              }}
            />
          ) : (
            <button
              type="button"
              onDoubleClick={() => setRenaming(true)}
              title="Double-click to rename"
              className="block max-w-full truncate text-left text-sm text-muted"
            >
              {session.messages.length ? (session.kind === 'group' ? 'Council deliberation' : paneTitle(session)) : ''}
            </button>
          )}
        </div>
        {session.kind === 'group' ? (
          <span className="atlas-session-status hidden shrink-0 items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[11px] text-muted sm:inline-flex" role="status" aria-live="polite">
            <span className={cn('size-1.5 rounded-full', running ? 'animate-pulse bg-ok' : 'bg-subtle')} />
            {running ? 'Deliberating' : 'Ready'}
          </span>
        ) : running ? (
          <span className="mr-1 size-2 animate-pulse rounded-full bg-accent" title="Generating" />
        ) : null}
        {broadcasting && (
          <IconButton
            label={excluded ? 'Not receiving broadcasts (click to include)' : 'Receives broadcasts (click to exclude)'}
            active={!excluded}
            onClick={() => toggleTarget(sessionId)}
          >
            <Radio className={cn('size-4', !excluded && 'text-accent')} />
          </IconButton>
        )}
        <PaneMenu session={session} multi={multi} onRename={() => setRenaming(true)} />
        {multi && (
          <IconButton label="Close pane" onClick={() => closePane(sessionId)}>
            <X className="size-4" />
          </IconButton>
        )}
      </header>
      {session.kind === 'group' && multi && (
        <div className="flex h-10 shrink-0 items-center border-b border-line px-2">
          <ParticipantsBar session={session} />
        </div>
      )}
      <div className="min-h-0 flex-1">
        <MessageList session={session} compact={multi} />
      </div>
    </section>
  )
}
