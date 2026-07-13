import { StartKeysignView } from '@core/extension/keysign/start/StartKeysignView'
import { PopupResolver } from '@core/inpage-provider/popup/view/resolver'
import { FlowErrorCloseProvider } from '@core/ui/flow/FlowErrorCloseContext'
import {
  KeysignMutationListener,
  KeysignMutationListenerProvider,
} from '@core/ui/mpc/keysign/action/state/keysignMutationListener'
import { CoreView } from '@core/ui/navigation/CoreView'
import { ActiveView } from '@lib/ui/navigation/ActiveView'
import { NavigationProvider } from '@lib/ui/navigation/state'
import { Views } from '@lib/ui/navigation/Views'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'
import { useMemo } from 'react'

import { VerifyTx } from './VerifyTx'

type SendTxView =
  | {
      id: 'overview'
    }
  | Extract<CoreView, { id: 'keysign' }>

const views: Views<SendTxView['id']> = {
  overview: VerifyTx,
  keysign: StartKeysignView,
}

export const SendTx: PopupResolver<'sendTx'> = ({ onFinish }) => {
  const keysignMutationListener: KeysignMutationListener = useMemo(
    () => ({
      onSuccess: result => {
        const txs = getRecordUnionValue(result, 'txs')
        const transactionsData = txs.map(({ hash, data }) => ({
          hash,
          data: data.toJSON(),
        }))
        onFinish({
          result: {
            data: transactionsData,
          },
          shouldClosePopup: false,
        })
      },
    }),
    [onFinish]
  )

  return (
    <NavigationProvider initialValue={{ history: [{ id: 'overview' }] }}>
      <KeysignMutationListenerProvider value={keysignMutationListener}>
        <FlowErrorCloseProvider
          value={() =>
            onFinish({
              result: { error: new Error('Signing failed') },
              shouldClosePopup: true,
            })
          }
        >
          <ActiveView views={views} />
        </FlowErrorCloseProvider>
      </KeysignMutationListenerProvider>
    </NavigationProvider>
  )
}
