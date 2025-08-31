import { StartKeysignView } from '@core/extension/keysign/start/StartKeysignView'
import { PopupResolver } from '@core/inpage-provider/popup/view/resolver'
import {
  KeysignMutationListener,
  KeysignMutationListenerProvider,
} from '@core/ui/mpc/keysign/action/state/keysignMutationListener'
import { CoreView } from '@core/ui/navigation/CoreView'
import { ActiveView } from '@lib/ui/navigation/ActiveView'
import { NavigationProvider } from '@lib/ui/navigation/state'
import { Views } from '@lib/ui/navigation/Views'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useMemo } from 'react'

import { SendTxOverview } from './SendTxOverview'

type SendTxView =
  | {
      id: 'overview'
    }
  | Extract<CoreView, { id: 'keysign' }>

const views: Views<SendTxView['id']> = {
  overview: SendTxOverview,
  keysign: StartKeysignView,
}

export const SendTx: PopupResolver<'sendTx'> = ({ onFinish }) => {
  const keysignMutationListener: KeysignMutationListener = useMemo(
    () => ({
      onSuccess: result => {
        const [{ hash, data }] = getRecordUnionValue(result, 'txs')
        onFinish({
          data: {
            hash,
            data: data.toJSON(),
          },
        })
      },
    }),
    [onFinish]
  )

  return (
    <NavigationProvider initialValue={{ history: [{ id: 'overview' }] }}>
      <KeysignMutationListenerProvider value={keysignMutationListener}>
        <ActiveView views={views} />
      </KeysignMutationListenerProvider>
    </NavigationProvider>
  )
}
