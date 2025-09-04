import { BackgroundEvent } from './interface'

type BackgroundEventSubscriptions = Record<
  string,
  Partial<Record<BackgroundEvent, string>>
>

const key = 'backgroundEventSubscriptions'

const getAllSubscriptions = async (): Promise<BackgroundEventSubscriptions> => {
  const result = await chrome.storage.session.get(key)

  const value = result[key]
  if (value === undefined) {
    return {}
  }

  return value
}

export const getAppSubscriptions = async (
  appId: string
): Promise<Partial<Record<BackgroundEvent, string>>> =>
  (await getAllSubscriptions())[appId] ?? {}

type AddAppSubscriptionInput = {
  appId: string
  event: BackgroundEvent
}

export const addAppSubscription = async ({
  appId,
  event,
}: AddAppSubscriptionInput): Promise<string> => {
  const allSubscriptions = await getAllSubscriptions()
  const appSubscriptions = allSubscriptions[appId] ?? {}

  const existing = appSubscriptions[event]
  if (existing) return existing

  const id = crypto.randomUUID()

  await chrome.storage.session.set({
    [key]: {
      ...allSubscriptions,
      [appId]: {
        ...appSubscriptions,
        [event]: id,
      },
    },
  })

  return id
}
