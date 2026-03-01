import { EvmChain } from '@core/chain/Chain'
import { attempt, withFallback } from '@lib/utils/attempt'
import { z } from 'zod'

import type { AgentBackendClient } from './AgentBackendClient'
import type { AgentContextService } from './AgentContextService'
import type { AgentEventEmitter } from './AgentEventEmitter'
import type { AgentToolExecutor } from './AgentToolExecutor'
import { buildTxResultSummary, isRetryableBuildError } from './AgentTxPipeline'
import type {
  ActionResult,
  BackendAction,
  ConversationContext,
  SendMessageRequest,
  TxReady,
} from './types'

const txDataSchema = z
  .object({
    to: z.string(),
    value: z.string(),
    data: z.string(),
    memo: z.string().optional(),
    nonce: z.number(),
    gas_limit: z.number(),
    chain_id: z.string().optional(),
    unsigned_tx: z.string().optional(),
    signing_hash: z.string().optional(),
    msg_hash: z.string().optional(),
  })
  .passthrough()

const txReadySchema = z
  .object({
    provider: z.string().optional(),
    expected_output: z.string().optional(),
    minimum_output: z.string().optional(),
    needs_approval: z.boolean().optional(),
    keysign_payload: z.string().optional(),
    approval_tx: txDataSchema.optional(),
    swap_tx: txDataSchema.optional(),
    from_chain: z.string(),
    from_symbol: z.string(),
    to_chain: z.string().optional(),
    to_symbol: z.string().optional(),
    amount: z.string(),
    sender: z.string(),
    destination: z.string(),
    tx_type: z
      .enum(['swap', 'send', 'deposit', 'evm_contract', 'wasm_execute'])
      .optional(),
    tx_details: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough()

type ReportCallback = (
  ctx: ConversationContext,
  result: ActionResult
) => Promise<void>

type ErrorCallback = (convId: string, vaultPubKey: string, err: unknown) => void

type SignalEntry<T = unknown> = {
  resolve: (value: T | null) => void
  timer: ReturnType<typeof setTimeout>
}

const maxBuildTxAttempts = 2

export class AgentTxService {
  private events: AgentEventEmitter
  private toolExecutor: AgentToolExecutor
  private contextService: AgentContextService
  private backendClient: AgentBackendClient
  private pendingTx = new Map<string, TxReady>()
  private buildAttempts = new Map<string, number>()
  private buildActive = new Set<string>()
  private signals = new Map<string, SignalEntry>()
  private reportCallback: ReportCallback = async () => {}
  private errorCallback: ErrorCallback = () => {}

  constructor(
    events: AgentEventEmitter,
    toolExecutor: AgentToolExecutor,
    contextService: AgentContextService,
    backendClient: AgentBackendClient
  ) {
    this.events = events
    this.toolExecutor = toolExecutor
    this.contextService = contextService
    this.backendClient = backendClient
  }

  setReportCallback(cb: ReportCallback): void {
    this.reportCallback = cb
  }

  setErrorCallback(cb: ErrorCallback): void {
    this.errorCallback = cb
  }

  hasPendingTx(convId: string): boolean {
    return this.pendingTx.has(convId)
  }

  popPendingTx(convId: string): TxReady | null {
    const tx = this.pendingTx.get(convId) ?? null
    this.pendingTx.delete(convId)
    return tx
  }

  setPendingTx(convId: string, tx: TxReady): void {
    this.pendingTx.set(convId, tx)
    this.notify(`build:${convId}`, tx)
  }

  deletePendingTx(convId: string): void {
    this.pendingTx.delete(convId)
  }

  hasBuildInProgress(convId: string): boolean {
    return this.buildActive.has(convId)
  }

  waitFor<T>(key: string, timeoutMs: number): Promise<T | null> {
    return new Promise<T | null>(resolve => {
      const timer = setTimeout(() => {
        this.signals.delete(key)
        resolve(null)
      }, timeoutMs)

      this.signals.set(key, {
        resolve: resolve as (value: unknown | null) => void,
        timer,
      })
    })
  }

  notify(key: string, value: unknown): void {
    const entry = this.signals.get(key)
    if (entry) {
      clearTimeout(entry.timer)
      this.signals.delete(key)
      entry.resolve(value)
    }
  }

  cancelSignals(convId: string): void {
    for (const [key, entry] of this.signals) {
      if (key.endsWith(`:${convId}`)) {
        clearTimeout(entry.timer)
        this.signals.delete(key)
        entry.resolve(null)
      }
    }
  }

  buildTxAsync(
    ctx: ConversationContext,
    params: Record<string, unknown>,
    mode: 'swap' | 'send' | 'custom' = 'swap'
  ): void {
    const buildTxConfig: Record<
      string,
      { actionType: string; toolName: string; title: string }
    > = {
      send: {
        actionType: 'build_send_tx',
        toolName: 'build_send_tx',
        title: 'Build Send Transaction',
      },
      custom: {
        actionType: 'build_custom_tx',
        toolName: 'build_custom_tx',
        title: 'Build Custom Transaction',
      },
      swap: {
        actionType: 'build_swap_tx',
        toolName: 'build_swap_tx',
        title: 'Build Swap Transaction',
      },
    }
    const { actionType, toolName, title } = buildTxConfig[mode]

    this.buildActive.add(ctx.convId)

    const run = async () => {
      const attempts = (this.buildAttempts.get(ctx.convId) ?? 0) + 1
      this.buildAttempts.set(ctx.convId, attempts)

      if (attempts > maxBuildTxAttempts) {
        this.buildAttempts.delete(ctx.convId)
        this.buildActive.delete(ctx.convId)
        this.notify(`build:${ctx.convId}`, null)
        const result: ActionResult = {
          action: actionType,
          success: false,
          error: 'transaction build failed after multiple attempts',
        }
        await this.reportCallback(ctx, result)
        return
      }

      if (mode === 'swap') {
        await this.preflightSearchToken(ctx, params)
      }

      const buildAction: BackendAction = {
        id: `build-tx-${Date.now()}`,
        type: toolName,
        title,
        params,
        auto_execute: true,
      }

      this.events.emit('tool_call', {
        conversationId: ctx.convId,
        actionId: buildAction.id,
        actionType,
        title: buildAction.title,
      })

      const toolResult = await this.toolExecutor.executeTool({
        convId: ctx.convId,
        vaultPubKey: ctx.vaultPubKey,
        token: ctx.token,
        action: buildAction,
      })

      this.events.emit('action_result', {
        conversationId: ctx.convId,
        actionId: buildAction.id,
        actionType,
        success: toolResult.success,
        data: toolResult.data,
        error: toolResult.error,
      })

      if (!toolResult.success) {
        this.buildActive.delete(ctx.convId)
        this.notify(`build:${ctx.convId}`, null)
        const result: ActionResult = {
          action: actionType,
          success: false,
          error: toolResult.error,
        }
        if (isRetryableBuildError(toolResult.error ?? '')) {
          result.data = { retryable: true }
        }
        await this.reportCallback(ctx, result)
        return
      }

      this.buildAttempts.delete(ctx.convId)
      this.buildActive.delete(ctx.convId)
      const txReady = txReadySchema.parse(toolResult.data)
      this.setPendingTx(ctx.convId, txReady)

      const summary = buildTxResultSummary(txReady)

      const scanResult = await this.scanTxIfEvm(
        ctx.convId,
        ctx.vaultPubKey,
        ctx.token,
        txReady
      )
      if (scanResult) {
        summary.security_scan = scanResult
      }

      const result: ActionResult = {
        action: actionType,
        success: true,
        data: summary,
      }
      await this.reportCallback(ctx, result)
    }
    run().catch(err => {
      this.buildActive.delete(ctx.convId)
      this.notify(`build:${ctx.convId}`, null)
      this.errorCallback(ctx.convId, ctx.vaultPubKey, err)
    })
  }

  private async scanTxIfEvm(
    convId: string,
    vaultPubKey: string,
    token: string,
    txReady: TxReady
  ): Promise<Record<string, unknown> | null> {
    const evmChains = Object.values(EvmChain) as string[]
    if (!evmChains.includes(txReady.from_chain)) return null

    const details = txReady.tx_details ?? {}
    const to = (details.to_address as string) || txReady.destination || ''

    const rawValue = (details.to_amount as string) || '0'
    const value = withFallback(
      attempt(() => '0x' + BigInt(rawValue).toString(16)),
      '0x0'
    )

    const rawMemo = (details.memo as string) || ''
    const data = rawMemo.startsWith('0x') ? rawMemo : '0x'

    if (!to) return null

    const scanAction: BackendAction = {
      id: `scan-tx-${Date.now()}`,
      type: 'scan_tx',
      title: 'Security Scan',
      params: {
        chain: txReady.from_chain,
        from: txReady.sender,
        to,
        value,
        data,
      },
      auto_execute: true,
    }

    this.events.emit('tool_call', {
      conversationId: convId,
      actionId: scanAction.id,
      actionType: 'scan_tx',
      title: scanAction.title,
      params: scanAction.params,
    })

    const result = await this.toolExecutor.executeTool({
      convId,
      vaultPubKey,
      token,
      action: scanAction,
    })

    this.events.emit('action_result', {
      conversationId: convId,
      actionId: scanAction.id,
      actionType: 'scan_tx',
      success: result.success,
      data: result.data,
      error: result.error,
    })

    if (result.success && result.data) {
      return result.data
    }

    return null
  }

  private async preflightSearchToken(
    ctx: ConversationContext,
    params: Record<string, unknown>
  ): Promise<void> {
    const toSymbol =
      typeof params.to_symbol === 'string' ? params.to_symbol : ''
    if (!toSymbol) return

    const searchParams: Record<string, unknown> = { query: toSymbol }
    const toChain = typeof params.to_chain === 'string' ? params.to_chain : ''
    if (toChain) searchParams.chain = toChain

    const actionId = `preflight-search-${Date.now()}`
    const action: BackendAction = {
      id: actionId,
      type: 'search_token',
      title: `Search Token: ${toSymbol}`,
      params: searchParams,
      auto_execute: true,
    }

    this.events.emit('tool_call', {
      conversationId: ctx.convId,
      actionId,
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
      actionId,
      actionType: action.type,
      success: result.success,
      data: result.data,
      error: result.error,
    })

    await attempt(async () => {
      const msgCtx = await this.contextService.buildQuickCtx(ctx.vaultPubKey)
      const req: SendMessageRequest = {
        public_key: ctx.vaultPubKey,
        action_result: result,
        context: msgCtx,
      }
      await this.backendClient.sendMessage({
        convId: ctx.convId,
        req,
        token: ctx.token,
        signal: ctx.signal,
      })
    })
  }
}
