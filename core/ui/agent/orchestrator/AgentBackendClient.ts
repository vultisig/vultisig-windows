import { agentBackendUrl } from '../config'
import type {
  BackendAction,
  BackendConversation,
  BackendConversationWithMessages,
  BackendMessage,
  BackendSuggestion,
  ErrorResponse,
  GetStartersRequest,
  GetStartersResponse,
  InstallRequired,
  ListConversationsResponse,
  PolicyReady,
  SendMessageRequest,
  SendMessageResponse,
  TokenSearchResult,
  TokenSearchResultWrapper,
  TxReady,
} from './types'

export class UnauthorizedError extends Error {
  constructor() {
    super('unauthorized')
    this.name = 'UnauthorizedError'
  }
}

function unwrapTokens(raw: unknown): TokenSearchResult[] | undefined {
  if (!raw) return undefined
  if (Array.isArray(raw)) return raw as TokenSearchResult[]
  if (typeof raw === 'object' && raw !== null) {
    const wrapper = raw as TokenSearchResultWrapper
    if (Array.isArray(wrapper.tokens)) return wrapper.tokens
  }
  return undefined
}

export class AgentBackendClient {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? agentBackendUrl
  }

  getBaseUrl(): string {
    return this.baseUrl
  }

  async createConversation(
    publicKey: string,
    token: string,
    title?: string,
    signal?: AbortSignal
  ): Promise<BackendConversation> {
    return this.doRequest<BackendConversation>(
      'POST',
      '/agent/conversations',
      token,
      { public_key: publicKey, title },
      signal
    )
  }

  async sendMessage(
    convId: string,
    req: SendMessageRequest,
    token: string,
    signal?: AbortSignal
  ): Promise<SendMessageResponse> {
    return this.doRequest<SendMessageResponse>(
      'POST',
      `/agent/conversations/${convId}/messages`,
      token,
      req,
      signal
    )
  }

  async sendMessageStream(
    convId: string,
    req: SendMessageRequest,
    token: string,
    onTextDelta: (delta: string) => void,
    signal?: AbortSignal
  ): Promise<SendMessageResponse> {
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
      let errMsg = text
      try {
        const parsed = JSON.parse(text) as ErrorResponse
        if (parsed.error) errMsg = parsed.error
      } catch {
        // use raw text
      }
      throw new Error(`status ${resp.status}: ${errMsg}`)
    }

    const contentType = resp.headers.get('content-type') ?? ''
    if (!contentType.includes('text/event-stream') || !resp.body) {
      console.log(
        '[agent:stream] fallback to JSON, content-type:',
        contentType,
        'body:',
        !!resp.body
      )
      const text = await resp.text()
      const jsonResult = JSON.parse(text) as SendMessageResponse
      jsonResult.tokens = unwrapTokens(jsonResult.tokens)
      if (jsonResult.tokens?.length) {
        console.log(
          '[agent:stream] JSON response has tokens:',
          jsonResult.tokens.length
        )
      }
      return jsonResult
    }

    console.log('[agent:stream] SSE streaming active')
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

    let chunkCount = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      chunkCount++

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

    console.log('[agent:stream] done, received', chunkCount, 'chunks')

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
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(jsonStr)
    } catch {
      return
    }

    switch (event) {
      case 'text_delta':
        if (typeof parsed.delta === 'string') {
          onTextDelta(parsed.delta)
        }
        break
      case 'title':
        if (typeof parsed.title === 'string') {
          result.title = parsed.title
        }
        break
      case 'actions':
        result.actions = parsed.actions as BackendAction[]
        break
      case 'suggestions':
        result.suggestions = parsed.suggestions as BackendSuggestion[]
        break
      case 'tx_ready':
        result.tx_ready = parsed as unknown as TxReady
        break
      case 'policy_ready':
        result.policy_ready = parsed as unknown as PolicyReady
        break
      case 'install_required':
        result.install_required = parsed as unknown as InstallRequired
        break
      case 'tokens':
        result.tokens = unwrapTokens(parsed.tokens ?? parsed)
        console.log(
          '[agent:stream] tokens event received:',
          result.tokens?.length ?? 0,
          'tokens'
        )
        break
      case 'message':
        result.message = parsed.message as BackendMessage
        break
      case 'error':
        throw new Error((parsed.error as string) ?? 'stream error')
      case 'done':
        break
      default:
        console.log(
          '[agent:stream] unhandled SSE event:',
          event,
          JSON.stringify(parsed).slice(0, 200)
        )
        break
    }
  }

  async listConversations(
    publicKey: string,
    skip: number,
    take: number,
    token: string,
    signal?: AbortSignal
  ): Promise<ListConversationsResponse> {
    return this.doRequest<ListConversationsResponse>(
      'POST',
      '/agent/conversations/list',
      token,
      { public_key: publicKey, skip, take },
      signal
    )
  }

  async getConversation(
    convId: string,
    publicKey: string,
    token: string,
    signal?: AbortSignal
  ): Promise<BackendConversationWithMessages> {
    return this.doRequest<BackendConversationWithMessages>(
      'POST',
      `/agent/conversations/${convId}`,
      token,
      { public_key: publicKey },
      signal
    )
  }

  async deleteConversation(
    convId: string,
    publicKey: string,
    token: string,
    signal?: AbortSignal
  ): Promise<void> {
    await this.doRequest<void>(
      'DELETE',
      `/agent/conversations/${convId}`,
      token,
      { public_key: publicKey },
      signal
    )
  }

  async getStarters(
    req: GetStartersRequest,
    token: string,
    signal?: AbortSignal
  ): Promise<GetStartersResponse> {
    return this.doRequest<GetStartersResponse>(
      'POST',
      '/agent/starters',
      token,
      req,
      signal
    )
  }

  private async doRequest<T>(
    method: string,
    path: string,
    token: string,
    body: unknown,
    signal?: AbortSignal
  ): Promise<T> {
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
      let errMsg = text
      try {
        const parsed = JSON.parse(text) as ErrorResponse
        if (parsed.error) {
          errMsg = parsed.error
        }
      } catch {
        // use raw text
      }
      throw new Error(`status ${resp.status}: ${errMsg}`)
    }

    if (!text.trim()) {
      return undefined as T
    }

    return JSON.parse(text) as T
  }
}
