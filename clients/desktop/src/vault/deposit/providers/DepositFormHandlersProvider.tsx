import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'
import {
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'

import { FormData } from '../DepositForm'

type DepositFormHandlers = {
  setValue: UseFormSetValue<FormData>
  getValues: UseFormGetValues<FormData>
  watch: UseFormWatch<FormData>
}

export const {
  useState: useDepositFormHandlers,
  provider: DepositFormHandlersProvider,
} = getStateProviderSetup<DepositFormHandlers>('DepositFormHandlers')
