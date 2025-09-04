import { BackgroundEvent } from './interface'

type BackgroundEventSubscriptions = Record<
  string,
  Partial<Record<BackgroundEvent, string>>
>

const key = 'backgroundEventSubscriptions'

const getAllSubscriptions = async (): Promise<BackgroundEventSubscriptions> =>
  (await chrome.storage.session.get(key)) ?? {}

export const getAppSubscriptions = async (
  appId: string
): Promise<Partial<Record<BackgroundEvent, string>>> => {
  const all = (await chrome.storage.session.get(key)) ?? {}
  return all[appId] ?? {}
}

type AddAppSubscriptionInput = {
  appId: string
  event: BackgroundEvent
}

export const addAppSubscription = async ({
  appId,
  event,
}: AddAppSubscriptionInput): Promise<string> => {
  const all = await getAllSubscriptions()
  const appSubs = all[appId] ?? {}

  const existing = appSubs[event]
  if (existing) return existing

  const id = crypto.randomUUID()

  await chrome.storage.session.set({
    [key]: {
      ...all,
      [appId]: {
        ...appSubs,
        [event]: crypto.randomUUID(),
      },
    },
  })

  return id
}
