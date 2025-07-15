import { IsDisabledProp } from '@lib/ui/props'

import { CoreViewState } from '../../../navigation/CoreView'

export type StartKeysignPromptProps = Omit<
  CoreViewState<'keysign'>,
  'securityType'
> &
  IsDisabledProp
