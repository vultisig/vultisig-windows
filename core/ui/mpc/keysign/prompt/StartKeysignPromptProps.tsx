import { CoreViewState } from '../../../navigation/CoreView'

type BaseStartKeysignPromptProps = Omit<
  CoreViewState<'keysign'>,
  'securityType' | 'keysignPayload'
>

export type StartKeysignPromptProps =
  | BaseStartKeysignPromptProps
  | (
      | { disabledMessage: string }
      | Pick<CoreViewState<'keysign'>, 'keysignPayload'>
      | {}
    )
