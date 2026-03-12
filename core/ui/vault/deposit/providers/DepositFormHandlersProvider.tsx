import { Chain } from '@core/chain/Chain'
import { TronResourceType } from '@core/chain/chains/tron/resources'
import { setupStateProvider } from '@lib/ui/state/setupStateProvider'
import {
  Control,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'

import { FormData } from '../DepositForm/types'

type DepositFormHandlers = {
  setValue: UseFormSetValue<FormData>
  getValues: UseFormGetValues<FormData>
  watch: UseFormWatch<FormData>
  chain: Chain
  register: UseFormRegister<FormData>
  control: Control<FormData, any>
  tronResourceType?: TronResourceType
  setTronResourceType?: (type: TronResourceType) => void
}

export const [DepositFormHandlersProvider, useDepositFormHandlers] =
  setupStateProvider<DepositFormHandlers>('DepositFormHandlers')
