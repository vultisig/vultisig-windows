import { MemoSection } from '@core/inpage-provider/popup/view/resolvers/sendTx/components/MemoSection'
import {
  NetworkFeeSection,
  NetworkFeeSectionProps,
} from '@core/inpage-provider/popup/view/resolvers/sendTx/components/NetworkFeeSection'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import type { BlockaidEvmBalanceChange } from '@core/ui/chain/security/blockaid/tx/blockaidEvmSimulationView'
import { ArrowUpRightIcon } from '@lib/ui/icons/ArrowUpRightIcon'
import { TransactionReceiveIcon } from '@lib/ui/icons/TransactionReceiveIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { Chain } from '@vultisig/core-chain/Chain'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { match } from '@vultisig/lib-utils/match'
import { formatUnits } from 'ethers'
import { useTranslation } from 'react-i18next'

type BlockaidBalanceChangesProps = {
  changes: BlockaidEvmBalanceChange[]
  memo: string | undefined
  chain: Chain
  networkFeeProps: NetworkFeeSectionProps
}

export const BlockaidBalanceChanges = ({
  changes,
  memo,
  chain,
  networkFeeProps,
}: BlockaidBalanceChangesProps) => {
  const { t } = useTranslation()

  return (
    <>
      <VStack bgColor="foreground" gap={16} padding={24} radius={16}>
        <Text color="supporting" size={15}>
          {t('balance_changes')}
        </Text>
        <VStack gap={12}>
          {changes.map((change, index) => (
            <BalanceChangeRow key={index} change={change} />
          ))}
        </VStack>
      </VStack>
      <MemoSection memo={memo} chain={chain} />
      <NetworkFeeSection {...networkFeeProps} />
    </>
  )
}

type BalanceChangeRowProps = {
  change: BlockaidEvmBalanceChange
}

const BalanceChangeRow = ({ change }: BalanceChangeRowProps) => {
  const { t } = useTranslation()
  const { coin, direction, amount, usdValue } = change

  const formattedAmount = formatAmount(
    Number(formatUnits(amount, coin.decimals)),
    coin
  )
  const directionIcon = match(direction, {
    send: () => <Text as={ArrowUpRightIcon} color="danger" size={16} />,
    receive: () => (
      <Text as={TransactionReceiveIcon} color="success" size={16} />
    ),
  })
  const directionLabel = match(direction, {
    send: () => t('send'),
    receive: () => t('receive'),
  })
  const amountColor = match(direction, {
    send: () => 'danger' as const,
    receive: () => 'success' as const,
  })

  return (
    <HStack alignItems="center" gap={12} fullWidth>
      <HStack alignItems="center" gap={8}>
        {directionIcon}
        <Text color="shy" size={13}>
          {directionLabel}
        </Text>
      </HStack>
      <HStack alignItems="center" gap={8} flexGrow>
        <CoinIcon coin={coin} style={{ fontSize: 20 }} />
        <Text color={amountColor} size={15} weight="500">
          {direction === 'send' ? '−' : '+'}
          {formattedAmount}
        </Text>
      </HStack>
      {usdValue !== undefined ? (
        <Text color="shy" size={13}>
          ~{formatAmount(usdValue, { currency: 'usd' })}
        </Text>
      ) : null}
    </HStack>
  )
}
