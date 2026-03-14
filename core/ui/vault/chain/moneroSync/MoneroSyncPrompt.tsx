import { getMoneroVaultData } from '@core/chain/chains/monero/moneroVaultData'
import { ClockIcon } from '@lib/ui/icons/ClockIcon'
import { SparklesIcon } from '@lib/ui/icons/SparklesIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import {
  AttentionActionWrapper,
  SecondaryActionWrapper,
} from '../../components/PrimaryActions.styled'
import { useMoneroBalanceScanStatus } from './useMoneroBalanceScanStatus'

type MoneroSyncPromptProps = {
  onClick: () => void
}

export const MoneroSyncPrompt = ({ onClick }: MoneroSyncPromptProps) => {
  const { t } = useTranslation()
  const vaultData = getMoneroVaultData()
  const { isSyncing, requiresFinalise, confirmingOutputs } =
    useMoneroBalanceScanStatus({
      publicKeyEcdsa: vaultData?.publicKeyEcdsa,
    })

  const isConfirming = confirmingOutputs.length > 0

  const ActionWrapper =
    requiresFinalise || isConfirming
      ? AttentionActionWrapper
      : SecondaryActionWrapper
  const label = isConfirming
    ? t('confirming')
    : requiresFinalise
      ? t('finalise')
      : t('sync')

  return (
    <VStack alignItems="center" gap={8}>
      <ActionWrapper onClick={onClick}>
        {isSyncing || isConfirming ? (
          <Spinner size={20} />
        ) : requiresFinalise ? (
          <SparklesIcon />
        ) : (
          <ClockIcon />
        )}
      </ActionWrapper>
      <Text color="shyExtra" size={12}>
        {label}
      </Text>
    </VStack>
  )
}
