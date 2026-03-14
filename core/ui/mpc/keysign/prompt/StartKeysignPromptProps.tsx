import { CoreViewState } from '../../../navigation/CoreView'

type BaseStartKeysignPromptProps = Partial<
  Omit<CoreViewState<'keysign'>, 'securityType' | 'keysignPayload'>
>

type StartKeysignPromptActionProps = {
  disabledMessage?: string
  keysignPayload?: CoreViewState<'keysign'>['keysignPayload']
}

type LabelProps = {
  fastLabel?: string
  secureLabel?: string
  holdLabel?: string
}

export type StartKeysignPromptProps = BaseStartKeysignPromptProps &
  StartKeysignPromptActionProps &
  LabelProps
