import { StartKeysignView } from '@core/extension/keysign/start/StartKeysignView'
import {
  PopupResolver,
  ResolvePopupInput,
} from '@core/inpage-provider/popup/view/resolver'
import { Overview } from '@core/inpage-provider/popup/view/resolvers/signMessage/overview'
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

type SignMessageView =
  | { id: 'overview'; state: { signature?: string } }
  | Extract<CoreView, { id: 'keysign' }>

const views: Views<SignMessageView['id']> = {
  keysign: StartKeysignView,
  overview: Overview,
}

const NavigationWrapper = ({
  onFinish,
}: OnFinishProp<ResolvePopupInput<'signMessage'>>) => {
  const navigate = useNavigate<SignMessageView>()
  const keysignMutationListener: KeysignMutationListener = useMemo(
    () => ({
      onSuccess: signature => {
        onFinish({
          result: {
            data: getRecordUnionValue(signature, 'signature'),
          },
          shouldClosePopup: false,
        })
        navigate(
          {
            id: 'overview',
            state: { signature: getRecordUnionValue(signature, 'signature') },
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

export const SignMessage: PopupResolver<'signMessage'> = ({ onFinish }) => (
  <NavigationProvider
    initialValue={{ history: [{ id: 'overview', state: {} }] }}
  >
    <NavigationWrapper onFinish={onFinish} />
  </NavigationProvider>
)
