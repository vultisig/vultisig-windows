import { agentBackendUrl } from '../config'
import type {
  BackendConversation,
  BackendConversationWithMessages,
  ErrorResponse,
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
