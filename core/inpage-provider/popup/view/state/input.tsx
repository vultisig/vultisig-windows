import {
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

const { provider: PopupInputProvider, useValue: usePopupInputValue } =
  getValueProviderSetup<PopupInterface[PopupMethod]['input']>('PopupInput')

export { PopupInputProvider }

export const usePopupInput = <
  M extends PopupMethod,
>(): PopupInterface[M]['input'] => {
  const value = usePopupInputValue()
  return value as PopupInterface[M]['input']
}
