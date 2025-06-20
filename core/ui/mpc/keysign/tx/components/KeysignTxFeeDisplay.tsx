import { EvmChain } from '@core/chain/Chain'
import { HStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useTranslation } from 'react-i18next'

import { useActualFeeQuery } from '../queries/useActualFeeQuery'

type KeysignTxFeeDisplayInput = {
  txHash: string
  chain: string
  decimals: number
  ticker: string
  networkFeesFormatted: string | null
}

export const KeysignTxFeeDisplay = ({
  txHash,
  chain,
  decimals,
  ticker,
  networkFeesFormatted,
}: KeysignTxFeeDisplayInput) => {
  const { t } = useTranslation()
  const query = useActualFeeQuery({ txHash, chain, decimals })

  // For non-EVM chains, use the estimated fee
  if (!isOneOf(chain, Object.values(EvmChain))) {
    return (
      <HStack alignItems="center" gap={4} justifyContent="space-between">
        <Text color="shy" weight="500">
          {t('est_network_fee')}
        </Text>
        <Text>{networkFeesFormatted}</Text>
      </HStack>
    )
  }

  // For EVM chains, use the actual fee query
  return (
    <MatchQuery
      value={query}
      error={() => (
        <HStack alignItems="center" gap={4} justifyContent="space-between">
          <Text color="shy" weight="500">
            {t('est_network_fee')}
          </Text>
          <Text>{networkFeesFormatted}</Text>
        </HStack>
      )}
      pending={() => (
        <HStack alignItems="center" gap={4} justifyContent="space-between">
          <Text color="shy" weight="500">
            {t('network_fee')}
          </Text>
          <Spinner size="1em" />
        </HStack>
      )}
      success={actualFee => (
        <HStack alignItems="center" gap={4} justifyContent="space-between">
          <Text color="shy" weight="500">
            {t('network_fee')}
          </Text>
          <Text>
            {actualFee} {ticker}
          </Text>
        </HStack>
      )}
    />
  )
}
