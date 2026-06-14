import { VaultAppSession } from '@core/extension/storage/appSessions'
import { MethodBasedContext } from '@core/inpage-provider/call/context'
import {
  AuthorizedPopupMethod,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { BridgeContext } from '@lib/extension/bridge/context'
import { setupValueProvider } from '@lib/ui/state/setupValueProvider'
import { useContext } from 'react'

type PopupViewContext =
  | (BridgeContext & { appSession?: VaultAppSession })
  | undefined

const [PopupContextProvider, useValue, PopupValueContext] =
  setupValueProvider<PopupViewContext>('PopupContext')

export { PopupContextProvider }

export const usePopupContext = <
  M extends PopupMethod = PopupMethod,
>(): MethodBasedContext<M, AuthorizedPopupMethod> => {
  return useValue() as MethodBasedContext<M, AuthorizedPopupMethod>
}

/**
 * Reads the dApp request origin if present, returning `undefined` outside the
 * popup context instead of throwing. Use from hooks that may run both inside
 * the dApp signing popup and in non-popup (in-app) flows.
 */
export const useOptionalRequestOrigin = (): string | undefined => {
  return useContext(PopupValueContext)?.requestOrigin
}
