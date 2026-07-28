import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { CoinPillButton } from '@core/ui/chain/coin/inputs/CoinPillButton'
import { ChevronDownIcon } from '@lib/ui/icons/ChevronDownIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { useTranslation } from 'react-i18next'

import { getChainLogoSrc } from '../../../../chain/metadata/getChainLogoSrc'
import { CoinBalance } from '../CoinBalance'

type CoinInputContainerProps = ValueProp<
  Pick<Coin, 'id' | 'chain' | 'logo' | 'ticker'>
> & {
  onChainClick: () => void
  onCoinClick: () => void
}

export const SendCoinInputField = ({
  value,
  onChainClick,
  onCoinClick,
}: CoinInputContainerProps) => {
  const { chain } = value
  const { t } = useTranslation()

  return (
    <VStack justifyContent="center" gap={16} data-testid="coin-selector">
      <HStack justifyContent="space-between" alignItems="center">
        <HStack gap={6} alignItems="center">
          <Text size={12} color="shy">
            {t('from')}
          </Text>
          <HStack gap={4} alignItems="center">
            <ChainEntityIcon
              value={getChainLogoSrc(chain)}
              style={{ fontSize: 16 }}
            />
            <HStack
              style={{ cursor: 'pointer' }}
              onClick={onChainClick}
              role="button"
              tabIndex={0}
              gap={2}
              alignItems="center"
            >
              <Text weight="500" size={12} color="contrast">
                {chain}
              </Text>
              <ChevronDownIcon />
            </HStack>
          </HStack>
        </HStack>
      </HStack>
      <HStack flexGrow justifyContent="space-between" alignItems="center">
        <CoinPillButton
          value={value}
          onClick={onCoinClick}
          testId="coin-selector-trigger"
        />
        <CoinBalance value={value} />
      </HStack>
    </VStack>
  )
}
