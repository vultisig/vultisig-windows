import { setupValueProvider } from '@lib/ui/state/setupValueProvider'
import { TransferDirection } from '@vultisig/lib-utils/TransferDirection'

export const [TransferDirectionProvider, useTransferDirection] =
  setupValueProvider<TransferDirection>('TransferDirectionProvider')
