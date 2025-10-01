import { StartKeysignView } from '@core/extension/keysign/start/StartKeysignView'
import {
  PopupResolver,
  ResolvePopupInput,
} from '@core/inpage-provider/popup/view/resolver'
import { Overview } from '@core/inpage-provider/popup/view/resolvers/pluginConnectSign/Overview'
import { Result } from '@core/inpage-provider/popup/view/resolvers/pluginConnectSign/Result'
import {
  KeysignMutationListener,
  KeysignMutationListenerProvider,
} from '@core/ui/mpc/keysign/action/state/keysignMutationListener'
import { CoreView } from '@core/ui/navigation/CoreView'
import { ActiveView } from '@lib/ui/navigation/ActiveView'
import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'
import { NavigationProvider } from '@lib/ui/navigation/state'
import { Views } from '@lib/ui/navigation/Views'
import { OnFinishProp } from '@lib/ui/props'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useMemo } from 'react'

type PluginConnectSignView =
  | { id: 'overview' }
  | Extract<CoreView, { id: 'keysign' }>
  | {
      id: 'result'
      state: { signature: string }
    }

const views: Views<PluginConnectSignView['id']> = {
  overview: Overview,
  keysign: StartKeysignView,
  result: Result,
}

export const PluginConnectSign: PopupResolver<'pluginConnectSign'> = ({
  onFinish,
}) => {
  return (
    <NavigationProvider
      initialValue={{
        history: [{ id: 'overview' }],
      }}
    >
      <NavigationWrapper onFinish={onFinish} />
    </NavigationProvider>
  )
}

const NavigationWrapper = ({
  onFinish,
}: OnFinishProp<ResolvePopupInput<'pluginConnectSign'>>) => {
  const navigate = useNavigate<PluginConnectSignView>()
  const keysignMutationListener: KeysignMutationListener = useMemo(
    () => ({
      onSuccess: result => {
        onFinish({
          result: {
            data: getRecordUnionValue(result, 'signature'),
          },
          shouldClosePopup: false,
        })
        navigate(
          {
            id: 'result',
            state: { signature: getRecordUnionValue(result, 'signature') },
          },
          { replace: true }
        )
      },
    }),
    [onFinish, navigate]
  )

  return (
    <KeysignMutationListenerProvider value={keysignMutationListener}>
      <ActiveView views={views} />
    </KeysignMutationListenerProvider>
  )
}
