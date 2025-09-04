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
