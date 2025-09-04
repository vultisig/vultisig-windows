import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'

import { callBackground } from '..'
import { BackgroundEvent, BackgroundEventsInterface } from './interface'

const subscriptions: Record<string, (value: any) => void> = {}

export const addBackgroundEventListener = async <T extends BackgroundEvent>(
  event: T,
  handler: (value: BackgroundEventsInterface[T]) => void
) => {
  const subscriptionId = await callBackground({ addEventListener: { event } })
  subscriptions[subscriptionId] = handler
}

export const runBackgroundEventsInpageRouter = () => {
  const topic = '> backgroundEvents:emit'

  window.addEventListener('message', event => {
    const data = (event as MessageEvent).data as {
      topic?: string
      payload?: { id?: string; value?: unknown; host?: string }
      id?: string | number
    }

    if (!data || data.topic !== topic) return
    if (event.source !== window) return

    const { id, value, host } = data.payload ?? {}

    const currentHost = getUrlBaseDomain(window.location.href)
    if (host && host !== currentHost) {
      // Always reply to satisfy the messenger, even if host doesn't match
      window.postMessage(
        {
          topic: '< backgroundEvents:emit',
          payload: { response: null, error: undefined },
          id: data.id,
        },
        '*'
      )
      return
    }

    const handler = id ? subscriptions[id] : undefined
    if (handler) {
      handler(value as any)
    }

    // Acknowledge to complete the messenger round-trip
    window.postMessage(
      {
        topic: '< backgroundEvents:emit',
        payload: { response: null, error: undefined },
        id: data.id,
      },
      '*'
    )
  })
}
