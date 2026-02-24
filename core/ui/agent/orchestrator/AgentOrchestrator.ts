import { Chain, EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { getCoinBalance } from '@core/chain/coin/balance'
import { v4 as uuidv4 } from 'uuid'

import { toolHandlers } from '../tools'
import type {
  CoinInfo,
  ToolContext,
  ToolHandler,
  ToolHandlerResult,
  VaultMeta,
} from '../tools/types'
import type {
  Conversation,
  ConversationWithMessages,
  ServiceStatus,
} from '../types'
import {
  filterAutoActions,
  filterBuildTx,
  filterNonAutoActions,
  filterProtectedActions,
  filterSignTx,
  needsConfirmation,
  needsPassword,
  resolveToolName,
} from './actionClassification'
import { AgentAuthService } from './AgentAuthService'
import { AgentBackendClient, UnauthorizedError } from './AgentBackendClient'
import { buildMessageContext } from './AgentContextBuilder'
import { AgentEventEmitter } from './AgentEventEmitter'
import {
  buildSignTxAction,
  buildTxResultSummary,
  isRetryableBuildError,
} from './AgentTxPipeline'
import { buildSetVaultPrefix } from './setVaultMessage'
import {
  resolveEvmChainFromTx,
  signAndBroadcastMpcTransaction,
} from './signMpcBundle'
import type {
  ActionResult,
  BackendAction,
  BalanceInfo,
  MessageContext,
  MpcTransaction,
  SendMessageRequest,
  SendMessageResponse,
  TxReady,
} from './types'

type VaultData = {
  name: string
  publicKeyEcdsa: string
  publicKeyEddsa: string
  hexChainCode: string
  localPartyId: string
  resharePrefix: string
  libType: string
  signers: string[]
  keyShares: Array<{ publicKey: string; keyShare: string }>
}

type CoinData = {
  chain: string
  ticker: string
  address: string
  contractAddress?: string
  decimals: number
  logo?: string
  priceProviderId?: string
  isNativeToken: boolean
  id?: string
}

type AddressBookItem = {
  title: string
  address: string
  chain: string
}

type NavigationData = {
  id: string
  state?: Record<string, unknown>
}

type OrchestratorDeps = {
  getVault: (pubKey: string) => Promise<VaultData>
  getVaultCoins: (pubKey: string) => Promise<CoinData[]>
  getAddressBookItems: () => Promise<AddressBookItem[]>
  onNavigate: (nav: NavigationData) => void
  onVaultDataChanged: () => void
}

function formatBalance(raw: bigint, decimals: number, maxDecimals = 6): string {
  if (raw === 0n) return '0'

  const divisor = 10n ** BigInt(decimals)
  const whole = raw / divisor
  const remainder = raw % divisor

  if (remainder === 0n) return whole.toString()

  let remainderStr = remainder.toString().padStart(decimals, '0')
  remainderStr = remainderStr.replace(/0+$/, '')
  if (!remainderStr) return whole.toString()
  if (remainderStr.length > maxDecimals) {
    remainderStr = remainderStr.slice(0, maxDecimals)
  }

  return `${whole}.${remainderStr}`
}

const maxBuildTxAttempts = 2

export class AgentOrchestrator {
  readonly events = new AgentEventEmitter()
  readonly auth = new AgentAuthService()

  private backendClient = new AgentBackendClient()
  private deps: OrchestratorDeps
  private handlers: Record<string, ToolHandler>

  private busy = false
  private abortController: AbortController | null = null
  private pendingTx = new Map<string, TxReady>()
  private buildAttempts = new Map<string, number>()

  private passwordResolver: ((value: string) => void) | null = null
  private confirmResolver: ((value: boolean) => void) | null = null
  private bundleApprovalResolver: ((approved: boolean) => void) | null = null
  private autoApproveTransactions = false

  private preloadedCtx: MessageContext | null = null
  private preloadedPubKey: string | null = null
  private primedConversations = new Set<string>()

  constructor(deps: OrchestratorDeps) {
    this.deps = deps
    this.handlers = toolHandlers
  }

  async sendMessage(vaultPubKey: string, message: string): Promise<string> {
    if (this.busy) throw new Error('agent is busy processing another request')

    const token = await this.requireAuth(vaultPubKey)
    this.busy = true

    let conv: { id: string }
    try {
      conv = await this.backendClient.createConversation(vaultPubKey, token)
    } catch (err) {
      this.busy = false
      throw err
    }

    const ac = new AbortController()
    this.abortController = ac

    this.processMessageAsync(ac.signal, conv.id, vaultPubKey, message, token)

    return conv.id
  }

  async sendMessageToConversation(
    convId: string,
    vaultPubKey: string,
    message: string
  ): Promise<void> {
    if (this.busy) throw new Error('agent is busy processing another request')

    const token = await this.requireAuth(vaultPubKey)
    this.busy = true

    const ac = new AbortController()
    this.abortController = ac

    this.processMessageAsync(ac.signal, convId, vaultPubKey, message, token)
  }

  async createConversation(vaultPubKey: string): Promise<string> {
    const token = await this.requireAuth(vaultPubKey)
    const conv = await this.backendClient.createConversation(vaultPubKey, token)
    return conv.id
  }

  async getConversations(vaultPubKey: string): Promise<Conversation[]> {
    const token = await this.requireAuth(vaultPubKey)
    const resp = await this.backendClient.listConversations(
      vaultPubKey,
      0,
      50,
      token
    )
    return resp.conversations.map(c => ({
      id: c.id,
      public_key: c.public_key,
      title: c.title,
      created_at: c.created_at,
      updated_at: c.updated_at,
    }))
  }

  async getConversation(
    convId: string,
    vaultPubKey: string
  ): Promise<ConversationWithMessages> {
    const token = await this.requireAuth(vaultPubKey)
    const conv = await this.backendClient.getConversation(
      convId,
      vaultPubKey,
      token
    )
    return {
      id: conv.id,
      public_key: conv.public_key,
      title: conv.title,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      messages: conv.messages.map(m => ({
        id: m.id,
        conversation_id: m.conversation_id,
        role: m.role,
        content: m.content,
        content_type: m.content_type,
        created_at: m.created_at,
      })),
    }
  }

  async deleteConversation(convId: string, vaultPubKey: string): Promise<void> {
    const token = await this.requireAuth(vaultPubKey)
    this.pendingTx.delete(convId)
    await this.backendClient.deleteConversation(convId, vaultPubKey, token)
  }

  async getConversationStarters(vaultPubKey: string): Promise<string[]> {
    try {
      const token = this.auth.getCachedToken(vaultPubKey)
      if (!token) return []

      const msgCtx = await this.buildCtx(vaultPubKey)
      const resp = await this.backendClient.getStarters(
        { public_key: vaultPubKey, context: msgCtx },
        token.token
      )
      return resp.starters ?? []
    } catch {
      return []
    }
  }

  async preloadContext(vaultPubKey: string): Promise<void> {
    try {
      const ctx = await this.buildCtx(vaultPubKey)
      this.preloadedCtx = ctx
      this.preloadedPubKey = vaultPubKey
    } catch {
      // preload is best-effort
    }
  }

  resetPrimedState(convId: string): void {
    this.primedConversations.delete(convId)
  }

  cancelRequest(): void {
    const ac = this.abortController
    this.abortController = null
    if (ac) ac.abort()
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

  provideBundleApproval(approved: boolean, autoApprove: boolean): void {
    if (autoApprove) {
      this.autoApproveTransactions = true
    }
    const resolver = this.bundleApprovalResolver
    this.bundleApprovalResolver = null
    if (resolver) resolver(approved)
  }

  setAutoApproveTransactions(enabled: boolean): void {
    this.autoApproveTransactions = enabled
  }

  async addTokenToVault(
    vaultPubKey: string,
    chain: string,
    symbol: string,
    contractAddress: string,
    decimals: number,
    logo?: string
  ): Promise<{ success: boolean; error?: string }> {
    const token = await this.requireAuth(vaultPubKey)

    const action: BackendAction = {
      id: `add-token-${Date.now()}`,
      type: 'add_coin',
      title: `Add ${symbol} on ${chain}`,
      params: {
        chain,
        ticker: symbol,
        contract_address: contractAddress,
        decimals,
        ...(logo ? { logo } : {}),
      },
      auto_execute: true,
    }

    const result = await this.executeTool('', vaultPubKey, token, action)

    if (result.success) {
      this.deps.onVaultDataChanged()
    }

    return {
      success: result.success,
      error: result.error,
    }
  }

  async signIn(vaultPubKey: string, password: string): Promise<void> {
    if (!password) throw new Error('password required')

    console.log(
      '[agent:signIn] building vault meta for',
      vaultPubKey.slice(0, 8) + '...'
    )
    const vaultMeta = await this.buildVaultMeta(vaultPubKey, password)
    console.log('[agent:signIn] vault meta built:', {
      localPartyId: vaultMeta.localPartyId,
      libType: vaultMeta.libType,
      signers: vaultMeta.signers,
      keyShareCount: vaultMeta.keyShares.length,
    })

    try {
      await this.auth.signIn(vaultMeta)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      if (
        errMsg.includes('Fast vault sign failed') ||
        errMsg.includes('fast vault server returned status') ||
        errMsg.includes('failed to sign auth message') ||
        errMsg.includes('keysign failed')
      ) {
        throw new Error(
          'incorrect password or signing failed — please try again'
        )
      }
      throw err
    }

    this.events.emit('auth_connected')
  }

  isSignedIn(vaultPubKey: string): boolean {
    return this.auth.isSignedIn(vaultPubKey)
  }

  getTokenInfo(vaultPubKey: string): { connected: boolean; expiresAt: string } {
    return this.auth.getTokenInfo(vaultPubKey)
  }

  async disconnect(vaultPubKey: string): Promise<void> {
    await this.auth.disconnect(vaultPubKey)
  }

  invalidateToken(vaultPubKey: string): void {
    this.auth.invalidateToken(vaultPubKey)
  }

  async checkServices(vaultPubKey: string): Promise<ServiceStatus> {
    const authenticated = vaultPubKey
      ? await this.auth.validate(vaultPubKey)
      : false

    return { authenticated }
  }

  // --- private methods ---

  private async requireAuth(vaultPubKey: string): Promise<string> {
    let token = this.auth.getCachedToken(vaultPubKey)
    if (token) return token.token

    token = await this.auth.refreshIfNeeded(vaultPubKey)
    if (token) return token.token

    throw new Error('password required')
  }

  private takePreloadedContext(vaultPubKey: string): MessageContext | null {
    if (this.preloadedPubKey === vaultPubKey && this.preloadedCtx) {
      const ctx = this.preloadedCtx
      this.preloadedCtx = null
      this.preloadedPubKey = null
      return ctx
    }
    return null
  }

  private async buildCtx(vaultPubKey: string): Promise<MessageContext> {
    const [vault, coins, addressBookItems] = await Promise.all([
      this.deps.getVault(vaultPubKey),
      this.deps.getVaultCoins(vaultPubKey),
      this.deps.getAddressBookItems().catch(() => []),
    ])

    const balances = await this.fetchBalances(coins)

    return buildMessageContext({
      vaultPubKey,
      vaultName: vault.name,
      coins,
      balances,
      addressBookItems,
    })
  }

  private processMessageAsync(
    signal: AbortSignal,
    convId: string,
    vaultPubKey: string,
    message: string,
    token: string
  ): void {
    const run = async () => {
      try {
        await this.processMessage(signal, convId, vaultPubKey, message, token)
      } finally {
        this.busy = false
      }
    }
    run().catch(err => this.handleError(convId, vaultPubKey, err))
  }

  private async processMessage(
    signal: AbortSignal,
    convId: string,
    vaultPubKey: string,
    message: string,
    token: string
  ): Promise<void> {
    this.events.emit('loading', { conversationId: convId })

    const msgCtx =
      this.takePreloadedContext(vaultPubKey) ??
      (await this.buildCtx(vaultPubKey))

    let content = message
    if (!this.primedConversations.has(convId)) {
      const vault = await this.deps.getVault(vaultPubKey)
      content = buildSetVaultPrefix(vault) + message
      this.primedConversations.add(convId)
    }

    const req: SendMessageRequest = {
      public_key: vaultPubKey,
      content,
      context: msgCtx,
    }

    let resp: SendMessageResponse
    try {
      resp = await this.backendClient.sendMessageStream(
        convId,
        req,
        token,
        delta =>
          this.events.emit('text_delta', {
            conversationId: convId,
            delta,
          }),
        signal
      )
    } catch (err) {
      this.handleError(convId, vaultPubKey, err)
      return
    }

    await this.handleBackendResponse(signal, convId, vaultPubKey, token, resp)
  }

  private async handleBackendResponse(
    signal: AbortSignal,
    convId: string,
    vaultPubKey: string,
    token: string,
    resp: SendMessageResponse
  ): Promise<void> {
    if (resp.title?.trim()) {
      this.events.emit('title_updated', {
        conversationId: convId,
        title: resp.title.trim(),
      })
    }

    const allActions = resp.actions ?? []
    const [unprotectedActions, protectedActions] =
      filterProtectedActions(allActions)
    const nonAutoActions = filterNonAutoActions(unprotectedActions)

    if (resp.tokens?.length) {
      console.log(
        '[agent:orchestrator] response has tokens:',
        resp.tokens.length,
        JSON.stringify(resp.tokens).slice(0, 300)
      )
    }

    this.events.emit('response', {
      conversationId: convId,
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
      tokenResults: resp.tokens,
    })

    if (resp.transactions?.length) {
      await this.handleMpcTransactions(
        signal,
        convId,
        vaultPubKey,
        token,
        resp.transactions
      )
      return
    }

    if (resp.tx_ready) {
      this.pendingTx.set(convId, resp.tx_ready)
    }

    const [actionsAfterBuild, buildAction] = filterBuildTx(
      filterAutoActions(unprotectedActions)
    )
    const [autoActions, signAction] = filterSignTx(actionsAfterBuild)

    if (buildAction && !this.pendingTx.has(convId)) {
      let mode: 'swap' | 'send' | 'custom' = 'swap'
      if (buildAction.type === 'build_send_tx') mode = 'send'
      else if (buildAction.type === 'build_custom_tx') mode = 'custom'
      this.buildTxAsync(
        signal,
        convId,
        vaultPubKey,
        token,
        buildAction.params ?? {},
        mode
      )
    }

    const results: ActionResult[] = []
    for (const action of autoActions) {
      if (signal.aborted) return

      this.events.emit('tool_call', {
        conversationId: convId,
        actionId: action.id,
        actionType: action.type,
        title: action.title,
        params: action.params,
      })

      const result = await this.executeTool(convId, vaultPubKey, token, action)

      this.events.emit('action_result', {
        conversationId: convId,
        actionId: action.id,
        actionType: action.type,
        success: result.success,
        data: result.data,
        error: result.error,
      })

      results.push(result)
    }

    if (results.length > 0) {
      await this.reportBatchActionResults(
        signal,
        convId,
        vaultPubKey,
        token,
        results
      )
      return
    }

    if (signAction) {
      const pending = this.popPendingTx(convId)
      if (pending) {
        const fullAction = buildSignTxAction(pending)
        await this.executeAndReport(
          signal,
          convId,
          vaultPubKey,
          token,
          fullAction
        )
        return
      }
    }

    if (buildAction) return

    for (const action of protectedActions) {
      if (signal.aborted) return
      await this.executeAndReport(signal, convId, vaultPubKey, token, action)
    }

    if (protectedActions.length > 0) return

    this.events.emit('complete', {
      conversationId: convId,
      message: resp.message.content,
    })
  }

  private async executeTool(
    convId: string,
    vaultPubKey: string,
    token: string,
    action: BackendAction,
    password?: string
  ): Promise<ActionResult> {
    const toolName = resolveToolName(action.type)
    const handler = this.handlers[toolName]

    if (!handler) {
      return {
        action: action.type,
        action_id: action.id,
        success: false,
        error: `Unknown tool: ${toolName}`,
      }
    }

    const input: Record<string, unknown> = { ...(action.params ?? {}) }
    if (convId) input.conversation_id = convId

    const coins = await this.deps.getVaultCoins(vaultPubKey)
    const vault = await this.deps.getVault(vaultPubKey)

    const toolCtx: ToolContext = {
      vaultPubKey,
      vaultName: vault.name,
      authToken: token,
      coins: coins.map<CoinInfo>(c => ({
        chain: c.chain,
        ticker: c.ticker,
        address: c.address,
        contractAddress: c.contractAddress,
        decimals: c.decimals,
        logo: c.logo,
        priceProviderId: c.priceProviderId,
        isNativeToken: c.isNativeToken,
      })),
      conversationId: convId,
      emitEvent: (event: string, data: Record<string, unknown>) => {
        this.events.emit(event as 'tx_status', data as never)
      },
    }

    if (password !== undefined) {
      toolCtx.vault = this.buildVaultMetaFromData(vault, password)
    }

    try {
      const result = await handler(input, toolCtx)
      this.handleToolResult(result)

      return {
        action: action.type,
        action_id: action.id,
        success: true,
        data: result.data,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return {
        action: action.type,
        action_id: action.id,
        success: false,
        error: message,
      }
    }
  }

  private handleToolResult(result: ToolHandlerResult): void {
    const nav = result.data?.navigation as NavigationData | undefined
    if (nav?.id) {
      this.deps.onNavigate(nav)
    }
    if (result.vaultModified) {
      this.deps.onVaultDataChanged()
    }
  }

  private async buildTxAsync(
    signal: AbortSignal,
    convId: string,
    vaultPubKey: string,
    token: string,
    params: Record<string, unknown>,
    mode: 'swap' | 'send' | 'custom' = 'swap'
  ): Promise<void> {
    const actionType =
      mode === 'send'
        ? 'build_send_tx'
        : mode === 'custom'
          ? 'build_custom_tx'
          : 'build_tx'
    const toolName =
      mode === 'send'
        ? 'build_send_tx'
        : mode === 'custom'
          ? 'build_custom_tx'
          : 'build_swap_tx'
    const title =
      mode === 'send'
        ? 'Build Send Transaction'
        : mode === 'custom'
          ? 'Build Custom Transaction'
          : 'Build Swap Transaction'

    const run = async () => {
      const attempts = (this.buildAttempts.get(convId) ?? 0) + 1
      this.buildAttempts.set(convId, attempts)

      if (attempts > maxBuildTxAttempts) {
        this.buildAttempts.delete(convId)
        const result: ActionResult = {
          action: actionType,
          success: false,
          error: 'transaction build failed after multiple attempts',
        }
        await this.reportActionResult(
          signal,
          convId,
          vaultPubKey,
          token,
          result
        )
        return
      }

      const buildAction: BackendAction = {
        id: `build-tx-${Date.now()}`,
        type: toolName,
        title,
        params,
        auto_execute: true,
      }

      this.events.emit('tool_call', {
        conversationId: convId,
        actionId: buildAction.id,
        actionType,
        title: buildAction.title,
      })

      const toolResult = await this.executeTool(
        convId,
        vaultPubKey,
        token,
        buildAction
      )

      this.events.emit('action_result', {
        conversationId: convId,
        actionId: buildAction.id,
        actionType,
        success: toolResult.success,
        data: toolResult.data,
        error: toolResult.error,
      })

      if (!toolResult.success) {
        const result: ActionResult = {
          action: actionType,
          success: false,
          error: toolResult.error,
        }
        if (isRetryableBuildError(toolResult.error ?? '')) {
          result.data = { retryable: true }
        }
        await this.reportActionResult(
          signal,
          convId,
          vaultPubKey,
          token,
          result
        )
        return
      }

      this.buildAttempts.delete(convId)
      const txReady = toolResult.data as unknown as TxReady
      this.pendingTx.set(convId, txReady)

      const summary = buildTxResultSummary(txReady)

      const scanResult = await this.scanTxIfEvm(
        convId,
        vaultPubKey,
        token,
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
      await this.reportActionResult(signal, convId, vaultPubKey, token, result)
    }
    run().catch(err => this.handleError(convId, vaultPubKey, err))
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
    let value: string
    try {
      value = '0x' + BigInt(rawValue).toString(16)
    } catch {
      value = '0x0'
    }

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

    const result = await this.executeTool(
      convId,
      vaultPubKey,
      token,
      scanAction
    )

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

  private async reportActionResult(
    signal: AbortSignal,
    convId: string,
    vaultPubKey: string,
    token: string,
    result: ActionResult
  ): Promise<void> {
    const msgCtx = await this.buildQuickCtx(vaultPubKey)

    const req: SendMessageRequest = {
      public_key: vaultPubKey,
      action_result: result,
      context: msgCtx,
    }

    let resp: SendMessageResponse
    try {
      resp = await this.backendClient.sendMessageStream(
        convId,
        req,
        token,
        delta =>
          this.events.emit('text_delta', {
            conversationId: convId,
            delta,
          }),
        signal
      )
    } catch (err) {
      this.handleError(convId, vaultPubKey, err)
      return
    }

    await this.handleBackendResponse(signal, convId, vaultPubKey, token, resp)
  }

  private async reportBatchActionResults(
    signal: AbortSignal,
    convId: string,
    vaultPubKey: string,
    token: string,
    results: ActionResult[]
  ): Promise<void> {
    const msgCtx = await this.buildQuickCtx(vaultPubKey)

    for (let i = 0; i < results.length; i++) {
      if (signal.aborted) return

      const req: SendMessageRequest = {
        public_key: vaultPubKey,
        action_result: results[i],
        context: msgCtx,
      }

      const isLast = i === results.length - 1

      if (isLast) {
        let resp: SendMessageResponse
        try {
          resp = await this.backendClient.sendMessageStream(
            convId,
            req,
            token,
            delta =>
              this.events.emit('text_delta', {
                conversationId: convId,
                delta,
              }),
            signal
          )
        } catch {
          continue
        }
        await this.handleBackendResponse(
          signal,
          convId,
          vaultPubKey,
          token,
          resp
        )
      } else {
        try {
          await this.backendClient.sendMessage(convId, req, token, signal)
        } catch {
          continue
        }
      }
    }
  }

  private async executeAndReport(
    signal: AbortSignal,
    convId: string,
    vaultPubKey: string,
    token: string,
    action: BackendAction
  ): Promise<void> {
    if (action.type === 'sign_tx') {
      const pending = this.popPendingTx(convId)
      if (pending) {
        action = buildSignTxAction(pending)
      }
    }

    this.events.emit('loading', { conversationId: convId })

    this.events.emit('tool_call', {
      conversationId: convId,
      actionId: action.id,
      actionType: action.type,
      title: action.title,
      params: action.params,
    })

    let password: string | undefined
    if (needsPassword(action.type)) {
      try {
        password = await this.waitForPassword(
          signal,
          convId,
          action.type,
          action.title
        )
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        this.events.emit('error', { conversationId: convId, error: msg })
        return
      }
    }

    if (needsConfirmation(action.type)) {
      try {
        const confirmed = await this.waitForConfirmation(
          signal,
          convId,
          action.type,
          action.title,
          action.id
        )
        if (!confirmed) {
          this.events.emit('complete', {
            conversationId: convId,
            message: 'Action cancelled.',
          })
          return
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        this.events.emit('error', { conversationId: convId, error: msg })
        return
      }
    }

    const result = await this.executeTool(
      convId,
      vaultPubKey,
      token,
      action,
      password
    )

    this.events.emit('action_result', {
      conversationId: convId,
      actionId: action.id,
      actionType: action.type,
      success: result.success,
      data: result.data,
      error: result.error,
    })

    await this.reportActionResult(signal, convId, vaultPubKey, token, result)
  }

  private waitForPassword(
    signal: AbortSignal,
    convId: string,
    toolName: string,
    operation: string
  ): Promise<string> {
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

  private waitForConfirmation(
    signal: AbortSignal,
    convId: string,
    action: string,
    details: string,
    actionId: string
  ): Promise<boolean> {
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

  private async handleMpcTransactions(
    signal: AbortSignal,
    convId: string,
    vaultPubKey: string,
    token: string,
    transactions: MpcTransaction[]
  ): Promise<void> {
    if (!this.autoApproveTransactions) {
      const approved = await this.waitForBundleApproval(
        signal,
        convId,
        transactions
      )
      if (!approved) {
        const result: ActionResult = {
          action: 'mpc_sign_transactions',
          success: false,
          error: 'User rejected transaction bundle',
        }
        await this.reportActionResult(
          signal,
          convId,
          vaultPubKey,
          token,
          result
        )
        return
      }
    }

    let password: string
    try {
      password = await this.waitForPassword(
        signal,
        convId,
        'sign_tx',
        'Sign Transactions'
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      this.events.emit('error', { conversationId: convId, error: msg })
      return
    }

    const vault = await this.deps.getVault(vaultPubKey)
    const vaultMeta = this.buildVaultMetaFromData(vault, password)

    const sorted = [...transactions].sort((a, b) => a.sequence - b.sequence)
    const txResults: { sequence: number; tx_hash: string; chain: string }[] = []
    let failed = false

    for (const tx of sorted) {
      if (signal.aborted) return

      const label =
        tx.tx_details.description || tx.action || `Transaction ${tx.sequence}`

      this.events.emit('tool_call', {
        conversationId: convId,
        actionId: `mpc-tx-${tx.sequence}`,
        actionType: 'mpc_sign',
        title: label,
      })

      try {
        const evmChain = resolveEvmChainFromTx(tx)
        const txHash = await signAndBroadcastMpcTransaction(tx, vaultMeta)

        txResults.push({
          sequence: tx.sequence,
          tx_hash: txHash,
          chain: evmChain,
        })

        this.events.emit('action_result', {
          conversationId: convId,
          actionId: `mpc-tx-${tx.sequence}`,
          actionType: 'mpc_sign',
          success: true,
          data: { tx_hash: txHash, chain: evmChain },
        })

        this.events.emit('tx_status', {
          conversationId: convId,
          txHash,
          chain: evmChain,
          status: 'pending',
          label,
        })

        // Wait for receipt before proceeding to the next transaction
        const client = getEvmClient(evmChain)
        try {
          const receipt = await client.waitForTransactionReceipt({
            hash: txHash as `0x${string}`,
            timeout: 180_000,
          })
          const status = receipt.status === 'success' ? 'confirmed' : 'failed'
          this.events.emit('tx_status', {
            conversationId: convId,
            txHash,
            chain: evmChain,
            status,
            label,
          })
          if (status === 'failed') {
            failed = true
            break
          }
        } catch {
          this.events.emit('tx_status', {
            conversationId: convId,
            txHash,
            chain: evmChain,
            status: 'failed',
            label,
          })
          failed = true
          break
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)

        this.events.emit('action_result', {
          conversationId: convId,
          actionId: `mpc-tx-${tx.sequence}`,
          actionType: 'mpc_sign',
          success: false,
          error: errMsg,
        })

        txResults.push({
          sequence: tx.sequence,
          tx_hash: '',
          chain: tx.chain,
        })
        failed = true
        break
      }
    }

    const result: ActionResult = {
      action: 'mpc_sign_transactions',
      success: !failed,
      data: { transactions: txResults },
      error: failed ? 'One or more transactions failed' : undefined,
    }
    await this.reportActionResult(signal, convId, vaultPubKey, token, result)
  }

  private waitForBundleApproval(
    signal: AbortSignal,
    convId: string,
    transactions: MpcTransaction[]
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const requestId = uuidv4()

      const onAbort = () => {
        this.bundleApprovalResolver = null
        reject(new Error('context canceled'))
      }

      if (signal.aborted) {
        reject(new Error('context canceled'))
        return
      }

      signal.addEventListener('abort', onAbort, { once: true })
      this.bundleApprovalResolver = (approved: boolean) => {
        signal.removeEventListener('abort', onAbort)
        resolve(approved)
      }

      this.events.emit('tx_bundle_approval', {
        conversationId: convId,
        transactions,
        requestId,
      })
    })
  }

  private handleError(convId: string, vaultPubKey: string, err: unknown): void {
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

  private popPendingTx(convId: string): TxReady | null {
    const tx = this.pendingTx.get(convId) ?? null
    this.pendingTx.delete(convId)
    return tx
  }

  private async buildQuickCtx(vaultPubKey: string): Promise<MessageContext> {
    const [vault, coins] = await Promise.all([
      this.deps.getVault(vaultPubKey),
      this.deps.getVaultCoins(vaultPubKey),
    ])

    return buildMessageContext({
      vaultPubKey,
      vaultName: vault.name,
      coins,
    })
  }

  private async fetchBalances(coins: CoinData[]): Promise<BalanceInfo[]> {
    const tasks = coins.map(async (coin): Promise<BalanceInfo | null> => {
      try {
        const id =
          !coin.isNativeToken && coin.contractAddress
            ? coin.contractAddress
            : undefined

        const raw = await getCoinBalance({
          chain: coin.chain as Chain,
          address: coin.address,
          id,
        })

        return {
          chain: coin.chain,
          asset: coin.contractAddress ?? coin.ticker,
          symbol: coin.ticker,
          amount: formatBalance(raw, coin.decimals),
          decimals: coin.decimals,
        }
      } catch {
        return null
      }
    })

    const results = await Promise.all(tasks)
    return results.filter((b): b is BalanceInfo => b !== null)
  }

  private async buildVaultMeta(
    vaultPubKey: string,
    password: string
  ): Promise<VaultMeta> {
    const vault = await this.deps.getVault(vaultPubKey)
    return this.buildVaultMetaFromData(vault, password)
  }

  private buildVaultMetaFromData(
    vault: VaultData,
    password: string
  ): VaultMeta {
    return {
      password,
      localPartyId: vault.localPartyId,
      publicKeyEcdsa: vault.publicKeyEcdsa,
      publicKeyEddsa: vault.publicKeyEddsa,
      hexChainCode: vault.hexChainCode,
      resharePrefix: vault.resharePrefix,
      libType: vault.libType,
      signers: vault.signers,
      keyShares: vault.keyShares.map(ks => ({
        publicKey: ks.publicKey,
        keyShare: ks.keyShare,
      })),
    }
  }
}
