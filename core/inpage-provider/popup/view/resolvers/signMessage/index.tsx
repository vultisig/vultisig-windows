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

import { Overview } from './Overview'

type SignMessageView =
  | {
      id: 'overview'
    }
  | Extract<CoreView, { id: 'keysign' }>

const views: Views<SignMessageView['id']> = {
  overview: Overview,
  keysign: StartKeysignView,
}

export const SignMessage: PopupResolver<'signMessage'> = ({ onFinish }) => {
  const keysignMutationListener: KeysignMutationListener = useMemo(
    () => ({
      onSuccess: result => {
        onFinish({
          result: {
            data: getRecordUnionValue(result, 'signature'),
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
        <ActiveView views={views} />
      </KeysignMutationListenerProvider>
    </NavigationProvider>
  )
}
