import { StartKeysignView } from '@core/extension/keysign/start/StartKeysignView'
import { PopupResolver } from '@core/inpage-provider/popup/view/resolver'
import { Overview } from '@core/inpage-provider/popup/view/resolvers/pluginConnectSign/Overview'
import { Result } from '@core/inpage-provider/popup/view/resolvers/pluginConnectSign/Result'
import {
  KeysignMutationListener,
  KeysignMutationListenerProvider,
} from '@core/ui/mpc/keysign/action/state/keysignMutationListener'
import { KeysignResultProvider } from '@core/ui/mpc/keysign/result/KeysignResultProvider'
import { CoreView } from '@core/ui/navigation/CoreView'
import { ActiveView } from '@lib/ui/navigation/ActiveView'
import { NavigationProvider } from '@lib/ui/navigation/state'
import { Views } from '@lib/ui/navigation/Views'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useMemo } from 'react'

type PluginSignView = { id: 'overview' } | Extract<CoreView, { id: 'keysign' }>

const views: Views<PluginSignView['id']> = {
  overview: Overview,
  keysign: StartKeysignView,
}

export const PluginConnectSign: PopupResolver<'pluginConnectSign'> = ({
  onFinish,
}) => {
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
    <KeysignResultProvider
      value={{
        customResultRenderer(result) {
          return <Result result={result} />
        },
      }}
    >
      <NavigationProvider
        initialValue={{
          history: [{ id: 'overview' }],
        }}
      >
        <KeysignMutationListenerProvider value={keysignMutationListener}>
          <ActiveView views={views} />
        </KeysignMutationListenerProvider>
      </NavigationProvider>
    </KeysignResultProvider>
  )
}
