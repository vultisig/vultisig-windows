import {
  formatMoneroAtomicAmount,
  isMoneroBalanceFinalisePayload,
  parseMoneroBalanceFinaliseMessage,
} from '@core/chain/chains/monero/balanceFinaliseMessage'
import { CustomMessagePayload } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { TxOverviewRow } from '@core/ui/chain/tx/TxOverviewRow'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { attempt, withFallback } from '@lib/utils/attempt'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const KeysignCustomMessageInfo = ({
  value,
}: ValueProp<CustomMessagePayload>) => {
  const { t } = useTranslation()

  const moneroBalanceFinalise = isMoneroBalanceFinalisePayload(value)
    ? parseMoneroBalanceFinaliseMessage(value.message)
    : null

  const formattedMessage = withFallback(
    attempt(() => JSON.stringify(JSON.parse(value.message), null, 2)),
    value.message
  )

  if (moneroBalanceFinalise) {
    return (
      <>
        <TxOverviewRow>
          <span>{t('outputs_found')}</span>
          {moneroBalanceFinalise.outputCount.toLocaleString()}
        </TxOverviewRow>
        <TxOverviewRow>
          <span>{t('current_scanned_balance')}</span>
          {formatMoneroAtomicAmount(moneroBalanceFinalise.balanceAtomic)}
        </TxOverviewRow>
      </>
    )
  }

  return (
    <>
      <HStack alignItems="center" gap={4} justifyContent="space-between">
        <Text color="shy" weight="500">
          {t('method')}
        </Text>
        <Text>{value.method}</Text>
      </HStack>
      <VStack gap={4}>
        <Text color="shy" weight="500">
          {t('message')}
        </Text>
        <MessageContent>{formattedMessage}</MessageContent>
      </VStack>
    </>
  )
}

const MessageContent = styled(Text).attrs({
  family: 'mono',
  size: 14,
})`
  white-space: pre-wrap;
  word-break: break-word;
`
