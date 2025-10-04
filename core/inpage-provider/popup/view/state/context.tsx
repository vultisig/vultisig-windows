import { VaultAppSession } from '@core/extension/storage/appSessions'
import { MethodBasedContext } from '@core/inpage-provider/call/context'
import {
  AuthorizedPopupMethod,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { BridgeContext } from '@lib/extension/bridge/context'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

type PopupViewContext =
  | (BridgeContext & { appSession?: VaultAppSession })
  | undefined

const { provider: PopupContextProvider, useValue } =
  getValueProviderSetup<PopupViewContext>('PopupContext')

export { PopupContextProvider }

export const usePopupContext = <
  M extends PopupMethod = PopupMethod,
>(): MethodBasedContext<M, AuthorizedPopupMethod> => {
  return useValue() as MethodBasedContext<M, AuthorizedPopupMethod>
}
