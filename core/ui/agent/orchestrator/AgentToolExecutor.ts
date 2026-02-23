import { attempt } from '@lib/utils/attempt'
import { z } from 'zod'

import type {
  CoinInfo,
  ToolContext,
  ToolHandler,
  ToolHandlerResult,
} from '../tools/types'
import type { TxStatusEvent } from '../types'
import { resolveToolName } from './actionClassification'
import type { AgentContextService } from './AgentContextService'
import type { AgentEventEmitter } from './AgentEventEmitter'
import type { ActionResult, BackendAction } from './types'

type NavigationData = {
  id: string
  state?: Record<string, unknown>
}

const navigationDataSchema = z
  .object({
    id: z.string(),
    state: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough()

type ToolExecutorDeps = {
  onNavigate: (nav: NavigationData) => void
  onVaultDataChanged: () => void
}

export class AgentToolExecutor {
  private handlers: Record<string, ToolHandler>
  private deps: ToolExecutorDeps
  private contextService: AgentContextService
  private events: AgentEventEmitter

  constructor(
    handlers: Record<string, ToolHandler>,
    deps: ToolExecutorDeps,
    contextService: AgentContextService,
    events: AgentEventEmitter
  ) {
    this.handlers = handlers
    this.deps = deps
    this.contextService = contextService
    this.events = events
  }

  async executeTool(params: {
    convId: string
    vaultPubKey: string
    token: string
    action: BackendAction
    password?: string
  }): Promise<ActionResult> {
    const { convId, vaultPubKey, token, action, password } = params
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

    const coins = await this.contextService.getVaultCoins(vaultPubKey)
    const vault = await this.contextService.getVault(vaultPubKey)

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
        if (event === 'tx_status') {
          this.events.emit('tx_status', data as TxStatusEvent)
        }
      },
    }

    if (password !== undefined) {
      toolCtx.vault = this.contextService.buildVaultMetaFromData(
        vault,
        password
      )
    }

    const result = await attempt(() => handler(input, toolCtx))

    if ('error' in result) {
      const message =
        result.error instanceof Error
          ? result.error.message
          : String(result.error)
      return {
        action: action.type,
        action_id: action.id,
        success: false,
        error: message,
      }
    }

    this.handleToolResult(result.data)

    return {
      action: action.type,
      action_id: action.id,
      success: true,
      data: result.data.data,
    }
  }

  private handleToolResult(result: ToolHandlerResult): void {
    if (result.data?.navigation) {
      const validated = navigationDataSchema.safeParse(result.data.navigation)
      if (validated.success && validated.data.id) {
        this.deps.onNavigate(validated.data)
      }
    }
    if (result.vaultModified) {
      this.deps.onVaultDataChanged()
    }
  }
}
