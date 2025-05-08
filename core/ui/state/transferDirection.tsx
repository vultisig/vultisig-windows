import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { TransferDirection } from '@lib/utils/TransferDirection'

export const {
  useValue: useTransferDirection,
  provider: TransferDirectionProvider,
} = getValueProviderSetup<TransferDirection>('TransferDirectionProvider')
