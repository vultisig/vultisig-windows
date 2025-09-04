import { callBackground } from '..'
import { isBackgroundEventMessage } from './core'
import { BackgroundEvent, BackgroundEventsInterface } from './interface'

const subscriptions: Record<string, (value: any) => void> = {}

export const addBackgroundEventListener = async <T extends BackgroundEvent>(
  event: T,
  handler: (value: BackgroundEventsInterface[T]) => void
) => {
  const subscriptionId = await callBackground({ addEventListener: { event } })
  subscriptions[subscriptionId] = handler
}

export const runBackgroundEventsInpageAgent = () => {
  window.addEventListener('message', ({ source, origin, data }) => {
    if (source !== window || origin !== window.origin) return

    if (!isBackgroundEventMessage(data)) return

    const handler = subscriptions[data.subscriptionId]
    if (handler) {
      handler(data.value as any)
    }
  })
}
