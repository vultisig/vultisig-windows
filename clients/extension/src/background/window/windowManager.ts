import { AppView } from '@clients/extension/src/navigation/AppView'
import { setInitialView } from '@clients/extension/src/navigation/state'
import { calculateWindowPosition } from '@clients/extension/src/utils/functions'
import { CoreView } from '@core/ui/navigation/CoreView'

export const handleOpenPanel = async (
  view: AppView | CoreView
): Promise<number> => {
  await setInitialView(view)

  return new Promise(resolve => {
    chrome.windows.getCurrent({ populate: true }, currentWindow => {
      const { height, left, top, width } =
        calculateWindowPosition(currentWindow)

      chrome.windows.create(
        {
          url: chrome.runtime.getURL(`index.html`),
          type: 'panel',
          height,
          left,
          top,
          width,
        },
        window => {
          resolve(window?.id ?? 0)
        }
      )
    })
  })
}
