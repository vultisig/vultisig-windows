import { attempt, withFallback } from '@lib/utils/attempt'

import { toolHandlers } from '../tools'
import type {
  Conversation,
  ConversationWithMessages,
  ServiceStatus,
} from '../types'
import { AgentAuthService } from './AgentAuthService'
import { AgentBackendClient } from './AgentBackendClient'
import {
  type AddressBookItem,
  AgentContextService,
  type CoinData,
  type VaultData,
} from './AgentContextService'
import { AgentEventEmitter } from './AgentEventEmitter'
import { AgentHealthService } from './AgentHealthService'
import { AgentMessageProcessor } from './AgentMessageProcessor'
import { AgentPromptService } from './AgentPromptService'
import { AgentToolExecutor } from './AgentToolExecutor'
import { AgentTxService } from './AgentTxService'

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

type SendMessageInput = {
  vaultPubKey: string
  message: string
}

type SendMessageToConversationInput = {
  convId: string
  vaultPubKey: string
  message: string
}

type ConversationInput = {
  convId: string
  vaultPubKey: string
}

type SignInInput = {
  vaultPubKey: string
  password: string
}

export class AgentOrchestrator {
  readonly events = new AgentEventEmitter()
  readonly auth = new AgentAuthService()

  private backendClient = new AgentBackendClient()
  private contextService: AgentContextService
  private healthService: AgentHealthService
  private promptService: AgentPromptService
  private toolExecutor: AgentToolExecutor
  private txService: AgentTxService
  private messageProcessor: AgentMessageProcessor

  constructor(deps: OrchestratorDeps) {
    this.contextService = new AgentContextService({
      getVault: deps.getVault,
      getVaultCoins: deps.getVaultCoins,
      getAddressBookItems: deps.getAddressBookItems,
    })
    this.healthService = new AgentHealthService(this.auth, this.backendClient)
    this.promptService = new AgentPromptService(this.events)
    this.toolExecutor = new AgentToolExecutor(
      toolHandlers,
      {
        onNavigate: deps.onNavigate,
        onVaultDataChanged: deps.onVaultDataChanged,
      },
      this.contextService,
      this.events
    )
    this.txService = new AgentTxService(
      this.events,
      this.toolExecutor,
      this.contextService,
      this.backendClient
    )
    this.messageProcessor = new AgentMessageProcessor(
      this.events,
      this.backendClient,
      this.auth,
      this.contextService,
      this.toolExecutor,
      this.txService,
      this.promptService
    )
    this.txService.setReportCallback((ctx, result) =>
      this.messageProcessor.reportActionResult(ctx, result)
    )
    this.txService.setErrorCallback((convId, vaultPubKey, err) =>
      this.messageProcessor.handleError(convId, vaultPubKey, err)
    )
  }

  async sendMessage({
    vaultPubKey,
    message,
  }: SendMessageInput): Promise<string> {
    if (this.messageProcessor.busy)
      throw new Error('agent is busy processing another request')

    const token = await this.requireAuth(vaultPubKey)
    this.messageProcessor.busy = true

    let conv: { id: string }
    try {
      conv = await this.backendClient.createConversation({
        publicKey: vaultPubKey,
        token,
      })
    } catch (err) {
      this.messageProcessor.busy = false
      throw err
    }

    const ac = new AbortController()
    this.messageProcessor.abortController = ac

    this.messageProcessor.processMessageAsync(
      {
        signal: ac.signal,
        convId: conv.id,
        vaultPubKey,
        token,
      },
      message
    )

    return conv.id
  }

  async sendMessageToConversation({
    convId,
    vaultPubKey,
    message,
  }: SendMessageToConversationInput): Promise<void> {
    if (this.messageProcessor.busy)
      throw new Error('agent is busy processing another request')

    const token = await this.requireAuth(vaultPubKey)
    this.messageProcessor.busy = true

    const ac = new AbortController()
    this.messageProcessor.abortController = ac

    this.messageProcessor.processMessageAsync(
      {
        signal: ac.signal,
        convId,
        vaultPubKey,
        token,
      },
      message
    )
  }

  async createConversation(vaultPubKey: string): Promise<string> {
    const token = await this.requireAuth(vaultPubKey)
    const conv = await this.backendClient.createConversation({
      publicKey: vaultPubKey,
      token,
    })
    return conv.id
  }

  async getConversations(vaultPubKey: string): Promise<Conversation[]> {
    const token = await this.requireAuth(vaultPubKey)
    const resp = await this.backendClient.listConversations({
      publicKey: vaultPubKey,
      skip: 0,
      take: 50,
      token,
    })
    return resp.conversations.map(c => ({
      id: c.id,
      public_key: c.public_key,
      title: c.title,
      created_at: c.created_at,
      updated_at: c.updated_at,
    }))
  }

  async getConversation({
    convId,
    vaultPubKey,
  }: ConversationInput): Promise<ConversationWithMessages> {
    const token = await this.requireAuth(vaultPubKey)
    const conv = await this.backendClient.getConversation({
      convId,
      publicKey: vaultPubKey,
      token,
    })
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

  async deleteConversation({
    convId,
    vaultPubKey,
  }: ConversationInput): Promise<void> {
    const token = await this.requireAuth(vaultPubKey)
    this.txService.deletePendingTx(convId)
    await this.backendClient.deleteConversation({
      convId,
      publicKey: vaultPubKey,
      token,
    })
  }

  async getConversationStarters(vaultPubKey: string): Promise<string[]> {
    const token = this.auth.getCachedToken(vaultPubKey)
    if (!token) return []

    return withFallback(
      attempt(async () => {
        const msgCtx = await this.contextService.buildCtx(vaultPubKey)
        const resp = await this.backendClient.getStarters({
          req: { public_key: vaultPubKey, context: msgCtx },
          token: token.token,
        })
        return resp.starters ?? []
      }),
      []
    )
  }

  async preloadContext(vaultPubKey: string): Promise<void> {
    await this.contextService.preloadContext(vaultPubKey)
  }

  cancelRequest(): void {
    this.messageProcessor.cancelRequest()
  }

  providePassword(password: string): void {
    this.promptService.providePassword(password)
  }

  provideConfirmation(confirmed: boolean): void {
    this.promptService.provideConfirmation(confirmed)
  }

  async signIn({ vaultPubKey, password }: SignInInput): Promise<void> {
    if (!password) throw new Error('password required')

    const vaultMeta = await this.contextService.buildVaultMeta(
      vaultPubKey,
      password
    )
    const result = await attempt(() => this.auth.signIn(vaultMeta))
    if ('error' in result) {
      const errMsg =
        result.error instanceof Error
          ? result.error.message
          : String(result.error)
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
      throw result.error
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
    return this.healthService.checkServices(vaultPubKey)
  }

  private async requireAuth(vaultPubKey: string): Promise<string> {
    let token = this.auth.getCachedToken(vaultPubKey)
    if (token) return token.token

    token = await this.auth.refreshIfNeeded(vaultPubKey)
    if (token) return token.token

    throw new Error('password required')
  }
}
