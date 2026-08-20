import { StartKeysignView } from '@core/extension/keysign/start/StartKeysignView'
import {
  broadcastFailedPopupResult,
  signingFailedPopupResult,
} from '@core/inpage-provider/popup/error'
import { PopupResolver } from '@core/inpage-provider/popup/view/resolver'
import { FlowErrorCloseProvider } from '@core/ui/flow/FlowErrorCloseContext'
import {
  KeysignMutationListener,
  KeysignMutationListenerProvider,
} from '@core/ui/mpc/keysign/action/state/keysignMutationListener'
import { BroadcastError } from '@core/ui/mpc/keysign/broadcastKeysignTx'
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
          value={error =>
            onFinish({
              // A broadcast failure means the transaction was signed and only
              // the network rejected it, so the dApp must not be told signing
              // never happened.
              result:
                error instanceof BroadcastError
                  ? broadcastFailedPopupResult
                  : signingFailedPopupResult,
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
