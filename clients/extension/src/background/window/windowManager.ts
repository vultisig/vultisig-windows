import { AppViewId } from '../../navigation/AppView'
import { calculateWindowPosition } from '../../utils/functions'

export const handleOpenPanel = (path: AppViewId): Promise<number> => {
  return new Promise(resolve => {
    chrome.windows.getCurrent({ populate: true }, currentWindow => {
      const { height, left, top, width } =
        calculateWindowPosition(currentWindow)

      chrome.windows.create(
        {
          url: chrome.runtime.getURL(`index.html#${path}`),
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
