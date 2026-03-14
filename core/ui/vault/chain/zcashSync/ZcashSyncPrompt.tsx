import { isNativeGrpcAvailable } from '@core/chain/chains/zcash/lightwalletd/grpcWeb'
import { getZcashVaultData } from '@core/chain/chains/zcash/zcashVaultData'
import { ClockIcon } from '@lib/ui/icons/ClockIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import {
  AttentionActionWrapper,
  SecondaryActionWrapper,
} from '../../components/PrimaryActions.styled'
import { useZcashBalanceScanStatus } from './useZcashBalanceScanStatus'

type ZcashSyncPromptProps = {
  onClick: () => void
}

const ZcashSyncPromptContent = ({ onClick }: ZcashSyncPromptProps) => {
  const { t } = useTranslation()
  const vaultData = getZcashVaultData()
  const { isSyncing, confirmingNotes } = useZcashBalanceScanStatus({
    publicKeyEcdsa: vaultData?.publicKeyEcdsa,
  })

  const isConfirming = confirmingNotes.length > 0

  const ActionWrapper = isConfirming
    ? AttentionActionWrapper
    : SecondaryActionWrapper
  const label = isConfirming ? t('confirming') : t('sync')

  return (
    <VStack alignItems="center" gap={8}>
      <ActionWrapper onClick={onClick}>
        {isSyncing || isConfirming ? <Spinner size={20} /> : <ClockIcon />}
      </ActionWrapper>
      <Text color="shyExtra" size={12}>
        {label}
      </Text>
    </VStack>
  )
}

export const ZcashSyncPrompt = (props: ZcashSyncPromptProps) => {
  if (!isNativeGrpcAvailable()) return null

  return <ZcashSyncPromptContent {...props} />
}
