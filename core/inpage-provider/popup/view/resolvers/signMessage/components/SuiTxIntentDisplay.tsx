import { SwapAmountDisplay } from '@core/inpage-provider/popup/view/resolvers/sendTx/components/SwapAmountDisplay'
import {
  HorizontalLine,
  IconWrapper,
} from '@core/ui/vault/swap/verify/SwapVerify/SwapVerify.styled'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { OtherChain } from '@vultisig/core-chain/Chain'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import {
  BlockaidSuiAsset,
  BlockaidSuiSimulationInfo,
} from '@vultisig/core-chain/security/blockaid/tx/simulation/core'
import { formatUnits } from 'ethers'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

const suiNativeCoinType = '0x2::sui::SUI'

// Native SUI must be modelled as a fee coin (no `id`), otherwise `CoinIcon`
// renders the chain-badge overlay on top of the token logo via
// `shouldDisplayChainLogo`.
const toCoin = (asset: BlockaidSuiAsset): Coin => {
  const base = {
    chain: OtherChain.Sui,
    ticker: asset.symbol,
    decimals: asset.decimals,
    logo: asset.logo,
  }
  if (asset.coinType === suiNativeCoinType) {
    return base as Coin
  }
  return { ...base, id: asset.coinType } as Coin
}

const formatAmount = (amount: bigint, decimals: number): string =>
  Number(formatUnits(amount, decimals)).toString()

type SuiTxIntentDisplayProps = { intent: BlockaidSuiSimulationInfo }

export const SuiTxIntentDisplay: FC<SuiTxIntentDisplayProps> = ({ intent }) => {
  const { t } = useTranslation()
  if ('swap' in intent) {
    const { from, to, fromAmount, toAmount } = intent.swap
    return (
      <VStack bgColor="foreground" gap={16} padding={24} radius={16}>
        <Text color="supporting" size={15}>
          {t('youre_swapping')}
        </Text>
        <SwapAmountDisplay
          coin={toCoin(from)}
          amount={formatAmount(fromAmount, from.decimals)}
        />
        <HStack alignItems="center" gap={21}>
          <IconWrapper>
            <ArrowDownIcon />
          </IconWrapper>
          <HorizontalLine />
        </HStack>
        <SwapAmountDisplay
          coin={toCoin(to)}
          amount={formatAmount(toAmount, to.decimals)}
        />
      </VStack>
    )
  }
  const { from, fromAmount } = intent.transfer
  return (
    <VStack bgColor="foreground" gap={16} padding={24} radius={16}>
      <Text color="supporting" size={15}>
        {t('you_are_sending')}
      </Text>
      <SwapAmountDisplay
        coin={toCoin(from)}
        amount={formatAmount(fromAmount, from.decimals)}
      />
    </VStack>
  )
}
