import { handleOpenPanel } from '../window/windowManager'

export const handlePluginRequest = async (request: any, sender: string) => {
  handleOpenPanel({ id: 'pluginTab' }).then(createdWindowId => {
    const timeoutId = setTimeout(() => {
      console.warn('User did not respond in time for plugin request.')
      chrome.windows.onRemoved.removeListener(onRemoved)
    }, 30000) // 30 seconds timeout

    function onRemoved(closedWindowId: number) {
      if (closedWindowId === createdWindowId) {
        clearTimeout(timeoutId)
        chrome.windows.onRemoved.removeListener(onRemoved)
      }
    }

    chrome.windows.onRemoved.addListener(onRemoved)
  })

  return
}
