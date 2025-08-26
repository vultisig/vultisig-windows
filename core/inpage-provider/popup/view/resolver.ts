import { VaultAppSession } from '@core/extension/storage/appSessions'
import {
  authorizedMethods,
  PopupInterface,
  PopupMethod,
} from '@core/inpage-provider/popup/interface'
import { BridgeContext } from '@lib/extension/bridge/context'
import { OnFinishProp } from '@lib/ui/props'
import { Resolver } from '@lib/utils/types/Resolver'
import { Result } from '@lib/utils/types/Result'
import { ReactNode } from 'react'

type AuthorizedPopupContext = BridgeContext & {
  appSession: VaultAppSession
}

export type PopupResolver<K extends PopupMethod> = Resolver<
  {
    input: PopupInterface[K]['input']
  } & OnFinishProp<Result<PopupInterface[K]['output']>> &
    (K extends (typeof authorizedMethods)[number]
      ? { context: AuthorizedPopupContext }
      : { context?: BridgeContext }),
  ReactNode
>
