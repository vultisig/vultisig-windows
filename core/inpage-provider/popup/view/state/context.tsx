import { VaultAppSession } from '@core/extension/storage/appSessions'
import {
  AuthorizedCallContext,
  UnauthorizedCallContext,
} from '@core/inpage-provider/call/context'
import {
  AuthorizedPopupMethod,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { BridgeContext } from '@lib/extension/bridge/context'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

type PopupViewContext =
  | (BridgeContext & { appSession?: VaultAppSession })
  | undefined

type PopupContextFor<M extends PopupMethod = PopupMethod> =
  M extends AuthorizedPopupMethod
    ? AuthorizedCallContext
    : UnauthorizedCallContext

const { provider: PopupContextProvider, useValue } =
  getValueProviderSetup<PopupViewContext>('PopupContext')

export { PopupContextProvider }

export const usePopupContext = <
  M extends PopupMethod = PopupMethod,
>(): PopupContextFor<M> => {
  return useValue() as PopupContextFor<M>
}
