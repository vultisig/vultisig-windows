import {
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { setupValueProvider } from '@lib/ui/state/setupValueProvider'

const [PopupInputProvider, usePopupInputValue] =
  setupValueProvider<PopupInterface[PopupMethod]['input']>('PopupInput')

export { PopupInputProvider }

export const usePopupInput = <
  M extends PopupMethod,
>(): PopupInterface[M]['input'] => {
  const value = usePopupInputValue()
  return value as PopupInterface[M]['input']
}
