import {
  filterAutoActions,
  filterBuildTx,
  filterNonAutoActions,
  filterProtectedActions,
  filterSignTx,
  needsConfirmation,
  needsPassword,
} from './actionClassification'
import type { AgentAuthService } from './AgentAuthService'
import type { AgentBackendClient } from './AgentBackendClient'
import { UnauthorizedError } from './AgentBackendClient'
import type { AgentContextService } from './AgentContextService'
import type { AgentEventEmitter } from './AgentEventEmitter'
import type { AgentPromptService } from './AgentPromptService'
import type { AgentToolExecutor } from './AgentToolExecutor'
import { buildSignTxAction } from './AgentTxPipeline'
import type { AgentTxService } from './AgentTxService'
import type {
  ActionResult,
  BackendAction,
  ConversationContext,
  SendMessageRequest,
  SendMessageResponse,
} from './types'

export class AgentMessageProcessor {
  private events: AgentEventEmitter
  private backendClient: AgentBackendClient
  private auth: AgentAuthService
  private contextService: AgentContextService
  private toolExecutor: AgentToolExecutor
  private txService: AgentTxService
  private promptService: AgentPromptService

  busy = false
  abortController: AbortController | null = null

  constructor(
    events: AgentEventEmitter,
    backendClient: AgentBackendClient,
    auth: AgentAuthService,
    contextService: AgentContextService,
    toolExecutor: AgentToolExecutor,
    txService: AgentTxService,
    promptService: AgentPromptService
  ) {
    this.events = events
    this.backendClient = backendClient
    this.auth = auth
    this.contextService = contextService
    this.toolExecutor = toolExecutor
    this.txService = txService
    this.promptService = promptService
  }

  processMessageAsync(ctx: ConversationContext, message: string): void {
    const run = async () => {
      try {
        await this.processMessage(ctx, message)
      } finally {
        this.busy = false
      }
    }
    run().catch(err => this.handleError(ctx.convId, ctx.vaultPubKey, err))
  }

  cancelRequest(): void {
    const ac = this.abortController
    this.abortController = null
    if (ac) ac.abort()
  }

  async reportActionResult(
    ctx: ConversationContext,
    result: ActionResult
  ): Promise<void> {
    const msgCtx = await this.contextService.buildQuickCtx(ctx.vaultPubKey)

    const req: SendMessageRequest = {
      public_key: ctx.vaultPubKey,
      action_result: result,
      context: msgCtx,
    }

    let resp: SendMessageResponse
    try {
      resp = await this.backendClient.sendMessageStream({
        convId: ctx.convId,
        req,
        token: ctx.token,
        onTextDelta: delta =>
          this.events.emit('text_delta', {
            conversationId: ctx.convId,
            delta,
          }),
        signal: ctx.signal,
      })
    } catch (err) {
      this.handleError(ctx.convId, ctx.vaultPubKey, err)
      return
    }

    await this.handleBackendResponse(ctx, resp)
  }

  handleError(convId: string, vaultPubKey: string, err: unknown): void {
    if (err instanceof DOMException && err.name === 'AbortError') {
      this.events.emit('error', {
        conversationId: convId,
        error: 'agent stopped',
      })
      return
    }

    if (err instanceof UnauthorizedError) {
      this.auth.invalidateToken(vaultPubKey)
      this.events.emit('auth_required', {
        conversationId: convId,
        vaultPubKey,
      })
      return
    }

    const message = err instanceof Error ? err.message : String(err)
    this.events.emit('error', { conversationId: convId, error: message })
  }

  private async processMessage(
    ctx: ConversationContext,
    message: string
  ): Promise<void> {
    this.events.emit('loading', { conversationId: ctx.convId })

    const msgCtx =
      this.contextService.takePreloadedContext(ctx.vaultPubKey) ??
      (await this.contextService.buildCtx(ctx.vaultPubKey))

    const req: SendMessageRequest = {
      public_key: ctx.vaultPubKey,
      content: message,
      context: msgCtx,
    }

    let resp: SendMessageResponse
    try {
      resp = await this.backendClient.sendMessageStream({
        convId: ctx.convId,
        req,
        token: ctx.token,
        onTextDelta: delta =>
          this.events.emit('text_delta', {
            conversationId: ctx.convId,
            delta,
          }),
        signal: ctx.signal,
      })
    } catch (err) {
      this.handleError(ctx.convId, ctx.vaultPubKey, err)
      return
    }

    await this.handleBackendResponse(ctx, resp)
  }

  private async handleBackendResponse(
    ctx: ConversationContext,
    resp: SendMessageResponse
  ): Promise<void> {
    if (resp.title?.trim()) {
      this.events.emit('title_updated', {
        conversationId: ctx.convId,
        title: resp.title.trim(),
      })
    }

    const allActions = resp.actions ?? []
    const [unprotectedActions, protectedActions] =
      filterProtectedActions(allActions)
    const nonAutoActions = filterNonAutoActions(unprotectedActions)

    this.events.emit('response', {
      conversationId: ctx.convId,
      message: resp.message.content,
      actions: nonAutoActions.map(a => ({
        id: a.id,
        type: a.type,
        title: a.title,
        description: a.description,
        params: a.params,
        auto_execute: a.auto_execute,
      })),
      suggestions: resp.suggestions?.map(s => ({
        id: s.id,
        plugin_id: s.plugin_id,
        title: s.title,
        description: s.description,
      })),
    })

    if (resp.tx_ready) {
      this.txService.setPendingTx(ctx.convId, resp.tx_ready)
    }

    const [actionsAfterBuild, buildAction] = filterBuildTx(
      filterAutoActions(unprotectedActions)
    )
    const [autoActions, signAction] = filterSignTx(actionsAfterBuild)

    if (buildAction && !this.txService.hasPendingTx(ctx.convId)) {
      let mode: 'swap' | 'send' | 'custom' = 'swap'
      if (buildAction.type === 'build_send_tx') mode = 'send'
      else if (buildAction.type === 'build_custom_tx') mode = 'custom'
      this.txService.buildTxAsync(ctx, buildAction.params ?? {}, mode)
    }

    const results: ActionResult[] = []
    for (const action of autoActions) {
      if (ctx.signal.aborted) return

      this.events.emit('tool_call', {
        conversationId: ctx.convId,
        actionId: action.id,
        actionType: action.type,
        title: action.title,
        params: action.params,
      })

      const result = await this.toolExecutor.executeTool({
        convId: ctx.convId,
        vaultPubKey: ctx.vaultPubKey,
        token: ctx.token,
        action,
      })

      this.events.emit('action_result', {
        conversationId: ctx.convId,
        actionId: action.id,
        actionType: action.type,
        success: result.success,
        data: result.data,
        error: result.error,
      })

      results.push(result)
    }

    if (results.length > 0) {
      await this.reportBatchActionResults(ctx, results)
      return
    }

    if (signAction) {
      const pending = this.txService.popPendingTx(ctx.convId)
      if (pending) {
        const fullAction = buildSignTxAction(pending)
        await this.executeAndReport(ctx, fullAction)
        return
      }
    }

    if (buildAction) return

    for (const action of protectedActions) {
      if (ctx.signal.aborted) return
      await this.executeAndReport(ctx, action)
    }

    if (protectedActions.length > 0) return

    this.events.emit('complete', {
      conversationId: ctx.convId,
      message: resp.message.content,
    })
  }

  private async reportBatchActionResults(
    ctx: ConversationContext,
    results: ActionResult[]
  ): Promise<void> {
    const msgCtx = await this.contextService.buildQuickCtx(ctx.vaultPubKey)

    for (let i = 0; i < results.length; i++) {
      if (ctx.signal.aborted) return

      const req: SendMessageRequest = {
        public_key: ctx.vaultPubKey,
        action_result: results[i],
        context: msgCtx,
      }

      const isLast = i === results.length - 1

      if (isLast) {
        let resp: SendMessageResponse
        try {
          resp = await this.backendClient.sendMessageStream({
            convId: ctx.convId,
            req,
            token: ctx.token,
            onTextDelta: delta =>
              this.events.emit('text_delta', {
                conversationId: ctx.convId,
                delta,
              }),
            signal: ctx.signal,
          })
        } catch {
          continue
        }
        await this.handleBackendResponse(ctx, resp)
      } else {
        try {
          await this.backendClient.sendMessage({
            convId: ctx.convId,
            req,
            token: ctx.token,
            signal: ctx.signal,
          })
        } catch {
          continue
        }
      }
    }
  }

  private async executeAndReport(
    ctx: ConversationContext,
    action: BackendAction
  ): Promise<void> {
    if (action.type === 'sign_tx') {
      const pending = this.txService.popPendingTx(ctx.convId)
      if (pending) {
        action = buildSignTxAction(pending)
      }
    }

    this.events.emit('loading', { conversationId: ctx.convId })

    this.events.emit('tool_call', {
      conversationId: ctx.convId,
      actionId: action.id,
      actionType: action.type,
      title: action.title,
      params: action.params,
    })

    let password: string | undefined
    if (needsPassword(action.type)) {
      try {
        password = await this.promptService.waitForPassword({
          signal: ctx.signal,
          convId: ctx.convId,
          toolName: action.type,
          operation: action.title,
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        this.events.emit('error', { conversationId: ctx.convId, error: msg })
        return
      }
    }

    if (needsConfirmation(action.type)) {
      try {
        const confirmed = await this.promptService.waitForConfirmation({
          signal: ctx.signal,
          convId: ctx.convId,
          action: action.type,
          details: action.title,
          actionId: action.id,
        })
        if (!confirmed) {
          this.events.emit('complete', {
            conversationId: ctx.convId,
            message: 'Action cancelled.',
          })
          return
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        this.events.emit('error', { conversationId: ctx.convId, error: msg })
        return
      }
    }

    const result = await this.toolExecutor.executeTool({
      convId: ctx.convId,
      vaultPubKey: ctx.vaultPubKey,
      token: ctx.token,
      action,
      password,
    })

    this.events.emit('action_result', {
      conversationId: ctx.convId,
      actionId: action.id,
      actionType: action.type,
      success: result.success,
      data: result.data,
      error: result.error,
    })

    await this.reportActionResult(ctx, result)
  }
}
