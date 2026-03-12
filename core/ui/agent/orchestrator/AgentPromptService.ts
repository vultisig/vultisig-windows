import { v4 as uuidv4 } from 'uuid'

import type { AgentEventEmitter } from './AgentEventEmitter'

export class AgentPromptService {
  private events: AgentEventEmitter
  private passwordResolver: ((value: string) => void) | null = null
  private confirmResolver: ((value: boolean) => void) | null = null

  constructor(events: AgentEventEmitter) {
    this.events = events
  }

  providePassword(password: string): void {
    const resolver = this.passwordResolver
    this.passwordResolver = null
    if (resolver) resolver(password)
  }

  provideConfirmation(confirmed: boolean): void {
    const resolver = this.confirmResolver
    this.confirmResolver = null
    if (resolver) resolver(confirmed)
  }

  waitForPassword(params: {
    signal: AbortSignal
    convId: string
    toolName: string
    operation: string
  }): Promise<string> {
    const { signal, convId, toolName, operation } = params
    return new Promise<string>((resolve, reject) => {
      const requestId = uuidv4()

      const onAbort = () => {
        this.passwordResolver = null
        reject(new Error('context canceled'))
      }

      if (signal.aborted) {
        reject(new Error('context canceled'))
        return
      }

      signal.addEventListener('abort', onAbort, { once: true })
      this.passwordResolver = (password: string) => {
        signal.removeEventListener('abort', onAbort)
        resolve(password)
      }

      this.events.emit('password_required', {
        conversationId: convId,
        toolName,
        operation,
        requestId,
      })
    })
  }

  waitForConfirmation(params: {
    signal: AbortSignal
    convId: string
    action: string
    details: string
    actionId: string
  }): Promise<boolean> {
    const { signal, convId, action, details, actionId } = params
    return new Promise<boolean>((resolve, reject) => {
      const requestId = uuidv4()

      const onAbort = () => {
        this.confirmResolver = null
        reject(new Error('context canceled'))
      }

      if (signal.aborted) {
        reject(new Error('context canceled'))
        return
      }

      signal.addEventListener('abort', onAbort, { once: true })
      this.confirmResolver = (confirmed: boolean) => {
        signal.removeEventListener('abort', onAbort)
        resolve(confirmed)
      }

      this.events.emit('confirmation_required', {
        conversationId: convId,
        action,
        details,
        actionId,
        requestId,
      })
    })
  }
}
