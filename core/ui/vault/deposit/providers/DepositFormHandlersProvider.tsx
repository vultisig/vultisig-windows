import { Chain } from '@core/chain/Chain'
import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'
import {
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'

import { FormData } from '../DepositForm'

type DepositFormHandlers = {
  setValue: UseFormSetValue<FormData>
  getValues: UseFormGetValues<FormData>
  watch: UseFormWatch<FormData>
  chain: Chain
  register: UseFormRegister<FormData>
}

export const {
  useState: useDepositFormHandlers,
  provider: DepositFormHandlersProvider,
} = getStateProviderSetup<DepositFormHandlers>('DepositFormHandlers')
