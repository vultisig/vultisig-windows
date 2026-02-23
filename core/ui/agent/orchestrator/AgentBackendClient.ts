import { attempt, withFallback } from '@lib/utils/attempt'
import { z } from 'zod'

import { agentBackendUrl } from '../config'
import type {
  BackendConversation,
  BackendConversationWithMessages,
  GetStartersRequest,
  GetStartersResponse,
  ListConversationsResponse,
  SendMessageRequest,
  SendMessageResponse,
} from './types'

export class UnauthorizedError extends Error {
  constructor() {
    super('unauthorized')
    this.name = 'UnauthorizedError'
  }
}

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

const backendActionSchema = z
  .object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    description: z.string().optional(),
    params: z.record(z.string(), z.unknown()).optional(),
    auto_execute: z.boolean(),
  })
  .passthrough()

const backendSuggestionSchema = z
  .object({
    id: z.string(),
    plugin_id: z.string(),
    title: z.string(),
    description: z.string(),
  })
  .passthrough()

const backendMessageSchema = z
  .object({
    id: z.string(),
    conversation_id: z.string(),
    role: z.string(),
    content: z.string(),
    content_type: z.string(),
    created_at: z.string(),
  })
  .passthrough()

const policyReadySchema = z
  .object({
    plugin_id: z.string(),
    configuration: z.record(z.string(), z.unknown()),
    policy_suggest: z.unknown().optional(),
  })
  .passthrough()

const installRequiredSchema = z
  .object({
    plugin_id: z.string(),
    title: z.string(),
    description: z.string(),
  })
  .passthrough()

const errorResponseSchema = z
  .object({
    error: z.string(),
  })
  .passthrough()

type SSEResult = Partial<SendMessageResponse>

const sseHandlers: Record<
  string,
  (
    parsed: Record<string, unknown>,
    result: SSEResult,
    onTextDelta: (d: string) => void
  ) => void
> = {
  text_delta: (parsed, _result, onTextDelta) => {
    if (typeof parsed.delta === 'string') {
      onTextDelta(parsed.delta)
    }
  },
  title: (parsed, result) => {
    if (typeof parsed.title === 'string') {
      result.title = parsed.title
    }
  },
  actions: (parsed, result) => {
    const validated = z.array(backendActionSchema).safeParse(parsed.actions)
    if (validated.success) {
      result.actions = validated.data
    }
  },
  suggestions: (parsed, result) => {
    const validated = z
      .array(backendSuggestionSchema)
      .safeParse(parsed.suggestions)
    if (validated.success) {
      result.suggestions = validated.data
    }
  },
  tx_ready: (parsed, result) => {
    const validated = txReadySchema.safeParse(parsed)
    if (validated.success) {
      result.tx_ready = validated.data
    }
  },
  policy_ready: (parsed, result) => {
    const validated = policyReadySchema.safeParse(parsed)
    if (validated.success) {
      result.policy_ready = validated.data
    }
  },
  install_required: (parsed, result) => {
    const validated = installRequiredSchema.safeParse(parsed)
    if (validated.success) {
      result.install_required = validated.data
    }
  },
  message: (parsed, result) => {
    const validated = backendMessageSchema.safeParse(parsed.message)
    if (validated.success) {
      result.message = validated.data
    }
  },
  error: parsed => {
    throw new Error((parsed.error as string) ?? 'stream error')
  },
  done: () => {},
}

export class AgentBackendClient {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? agentBackendUrl
  }

  getBaseUrl(): string {
    return this.baseUrl
  }

  async createConversation(params: {
    publicKey: string
    token: string
    title?: string
    signal?: AbortSignal
  }): Promise<BackendConversation> {
    const { publicKey, token, title, signal } = params
    return this.doRequest({
      method: 'POST',
      path: '/agent/conversations',
      token,
      body: { public_key: publicKey, title },
      signal,
    })
  }

  async sendMessage(params: {
    convId: string
    req: SendMessageRequest
    token: string
    signal?: AbortSignal
  }): Promise<SendMessageResponse> {
    const { convId, req, token, signal } = params
    return this.doRequest({
      method: 'POST',
      path: `/agent/conversations/${convId}/messages`,
      token,
      body: req,
      signal,
    })
  }

  async sendMessageStream(params: {
    convId: string
    req: SendMessageRequest
    token: string
    onTextDelta: (delta: string) => void
    signal?: AbortSignal
  }): Promise<SendMessageResponse> {
    const { convId, req, token, onTextDelta, signal } = params
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    }
    if (token) {
      headers['Authorization'] = 'Bearer ' + token
    }

    const resp = await fetch(
      this.baseUrl + `/agent/conversations/${convId}/messages`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(req),
        signal,
      }
    )

    if (resp.status === 401) {
      throw new UnauthorizedError()
    }

    if (resp.status >= 400) {
      const text = await resp.text()
      const errMsg = withFallback(
        attempt(() => {
          const parsed = JSON.parse(text)
          const validated = errorResponseSchema.safeParse(parsed)
          if (validated.success) {
            return validated.data.error ?? text
          }
          return text
        }),
        text
      )
      throw new Error(`status ${resp.status}: ${errMsg}`)
    }

    const contentType = resp.headers.get('content-type') ?? ''
    if (!contentType.includes('text/event-stream') || !resp.body) {
      const text = await resp.text()
      return JSON.parse(text) as SendMessageResponse
    }

    return this.readSSEResponse(resp.body, onTextDelta)
  }

  private async readSSEResponse(
    body: ReadableStream<Uint8Array>,
    onTextDelta: (delta: string) => void
  ): Promise<SendMessageResponse> {
    const reader = body.getReader()
    const decoder = new TextDecoder()
    const result: Partial<SendMessageResponse> = {}

    let buffer = ''
    let currentEvent = ''

    for (;;) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7).trim()
          continue
        }
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).replace(/\r$/, '')
          this.processSSEEvent(currentEvent, jsonStr, result, onTextDelta)
          currentEvent = ''
          continue
        }
      }
    }

    if (!result.message) {
      throw new Error('stream ended without message event')
    }

    return result as SendMessageResponse
  }

  private processSSEEvent(
    event: string,
    jsonStr: string,
    result: Partial<SendMessageResponse>,
    onTextDelta: (delta: string) => void
  ): void {
    const parseResult = attempt(
      () => JSON.parse(jsonStr) as Record<string, unknown>
    )
    if ('error' in parseResult) return

    const handler = sseHandlers[event]
    if (handler) {
      handler(parseResult.data, result, onTextDelta)
    }
  }

  async listConversations(params: {
    publicKey: string
    skip: number
    take: number
    token: string
    signal?: AbortSignal
  }): Promise<ListConversationsResponse> {
    const { publicKey, skip, take, token, signal } = params
    return this.doRequest({
      method: 'POST',
      path: '/agent/conversations/list',
      token,
      body: { public_key: publicKey, skip, take },
      signal,
    })
  }

  async getConversation(params: {
    convId: string
    publicKey: string
    token: string
    signal?: AbortSignal
  }): Promise<BackendConversationWithMessages> {
    const { convId, publicKey, token, signal } = params
    return this.doRequest({
      method: 'POST',
      path: `/agent/conversations/${convId}`,
      token,
      body: { public_key: publicKey },
      signal,
    })
  }

  async deleteConversation(params: {
    convId: string
    publicKey: string
    token: string
    signal?: AbortSignal
  }): Promise<void> {
    const { convId, publicKey, token, signal } = params
    await this.doRequest({
      method: 'DELETE',
      path: `/agent/conversations/${convId}`,
      token,
      body: { public_key: publicKey },
      signal,
    })
  }

  async getStarters(params: {
    req: GetStartersRequest
    token: string
    signal?: AbortSignal
  }): Promise<GetStartersResponse> {
    const { req, token, signal } = params
    return this.doRequest({
      method: 'POST',
      path: '/agent/starters',
      token,
      body: req,
      signal,
    })
  }

  private async doRequest<T>(params: {
    method: string
    path: string
    token: string
    body: unknown
    signal?: AbortSignal
  }): Promise<T> {
    const { method, path, token, body, signal } = params
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = 'Bearer ' + token
    }

    const resp = await fetch(this.baseUrl + path, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
      signal,
    })

    const text = await resp.text()

    if (resp.status === 401) {
      throw new UnauthorizedError()
    }

    if (resp.status >= 400) {
      const errMsg = withFallback(
        attempt(() => {
          const parsed = JSON.parse(text)
          const validated = errorResponseSchema.safeParse(parsed)
          if (validated.success) {
            return validated.data.error ?? text
          }
          return text
        }),
        text
      )
      throw new Error(`status ${resp.status}: ${errMsg}`)
    }

    if (!text.trim()) {
      return undefined as T
    }

    return JSON.parse(text) as T
  }
}
