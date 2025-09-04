export const runBackgroundEventsEmitter = () => {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      // todo
    }
  })
}
