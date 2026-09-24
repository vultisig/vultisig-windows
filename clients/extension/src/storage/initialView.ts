import { AppView } from '@clients/extension/src/navigation/AppView'

const initialViewKey = 'initialView'

// Session storage stays in memory: the handed-off view can carry key import
// input, which must never be written to disk.

/** Reads the view an expanded tab should open on, handed off from the popup. */
export const getInitialView = async (): Promise<AppView | null> => {
  const result = await chrome.storage.session.get<{
    [initialViewKey]?: AppView
  }>(initialViewKey)
  return result[initialViewKey] ?? null
}

/** Hands a view off to the next extension page that opens. */
export const setInitialView = async (view: AppView) => {
  await chrome.storage.session.set({ [initialViewKey]: view })
}

/** Clears the handed-off view once it has been consumed. */
export const removeInitialView = async () => {
  await chrome.storage.session.remove(initialViewKey)
}
