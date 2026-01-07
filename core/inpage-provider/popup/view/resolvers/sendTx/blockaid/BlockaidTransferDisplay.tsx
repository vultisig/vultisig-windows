import { Chain } from '@core/chain/Chain'
import { Coin } from '@core/chain/coin/Coin'
import { MemoSection } from '@core/inpage-provider/popup/view/resolvers/sendTx/components/MemoSection'
import {
  NetworkFeeSection,
  NetworkFeeSectionProps,
} from '@core/inpage-provider/popup/view/resolvers/sendTx/components/NetworkFeeSection'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { formatUnits } from 'ethers'
import { useTranslation } from 'react-i18next'

type BlockaidTransferDisplayProps = {
  transfer: {
    fromCoin: Coin
    fromAmount: bigint
  }
  fromAddress: string
  toAddress: string | undefined
  memo: string | undefined
  chain: Chain
  networkFeeProps: NetworkFeeSectionProps
}

export const BlockaidTransferDisplay = ({
  transfer,
  fromAddress,
  toAddress,
  memo,
  chain,
  networkFeeProps,
}: BlockaidTransferDisplayProps) => {
  const { t } = useTranslation()

  const transferCoin = transfer.fromCoin
  const transferAmountDecimal = formatAmount(
    Number(formatUnits(transfer.fromAmount, transferCoin.decimals)),
    transferCoin
  )

  return (
    <>
      <VStack bgColor="foreground" gap={24} padding={24} radius={16}>
        <Text color="supporting" size={15}>
          {t('you_are_sending')}
        </Text>
        <VStack gap={16}>
          <HStack gap={8} alignItems="center">
            <CoinIcon coin={transferCoin} style={{ fontSize: 24 }} />
            <VStack gap={4}>
              <Text weight="500" size={17} color="contrast">
                {transferAmountDecimal}{' '}
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </VStack>
      <ListItem description={fromAddress} title={t('from')} />
      {toAddress && <ListItem description={toAddress} title={t('to')} />}
      <MemoSection memo={memo} chain={chain} />
      <NetworkFeeSection {...networkFeeProps} />
    </>
  )
}
