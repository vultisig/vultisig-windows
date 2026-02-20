import type {
  ActionResultEvent,
  AuthRequiredEvent,
  CompleteEvent,
  ConfirmationRequiredEvent,
  ErrorEvent,
  LoadingEvent,
  PasswordRequiredEvent,
  ResponseEvent,
  TextDeltaEvent,
  TitleUpdatedEvent,
  ToolCallEvent,
  TxStatusEvent,
} from '../types'

type AgentEventMap = {
  loading: LoadingEvent
  text_delta: TextDeltaEvent
  response: ResponseEvent
  tool_call: ToolCallEvent
  action_result: ActionResultEvent
  password_required: PasswordRequiredEvent
  confirmation_required: ConfirmationRequiredEvent
  auth_required: AuthRequiredEvent
  auth_connected: void
  complete: CompleteEvent
  error: ErrorEvent
  title_updated: TitleUpdatedEvent
  tx_status: TxStatusEvent
}

type EventCallback<T> = (data: T) => void

export class AgentEventEmitter {
  private listeners = new Map<string, Set<EventCallback<unknown>>>()

  on<K extends keyof AgentEventMap>(
    event: K,
    callback: EventCallback<AgentEventMap[K]>
  ): () => void {
    const key = event as string
    let set = this.listeners.get(key)
    if (!set) {
      set = new Set()
      this.listeners.set(key, set)
    }
    const cb = callback as EventCallback<unknown>
    set.add(cb)
    return () => {
      set!.delete(cb)
    }
  }

  emit<K extends keyof AgentEventMap>(
    event: K,
    ...args: AgentEventMap[K] extends void ? [] : [AgentEventMap[K]]
  ): void {
    const set = this.listeners.get(event as string)
    if (!set) return
    const data = args[0]
    for (const cb of set) {
      try {
        cb(data)
      } catch {
        // listener errors should not break the emitter
      }
    }
  }

  removeAllListeners(): void {
    this.listeners.clear()
  }
}
