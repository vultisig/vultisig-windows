import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { CoinPillButton } from '@core/ui/chain/coin/inputs/CoinPillButton'
import { useTransferDirection } from '@core/ui/state/transferDirection'
import { ManageFromAmount } from '@core/ui/vault/swap/form/amount/ManageFromAmount'
import { ToAmount } from '@core/ui/vault/swap/form/amount/ToAmount'
import { ChevronDownIcon } from '@lib/ui/icons/ChevronDownIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { match } from '@vultisig/lib-utils/match'
import { useTranslation } from 'react-i18next'

import { getChainLogoSrc } from '../../../../chain/metadata/getChainLogoSrc'
import { CoinBalance } from '../CoinBalance'
import { Container } from './SwapCoinInputField.styled'

type CoinInputContainerProps = ValueProp<
  Pick<Coin, 'id' | 'chain' | 'logo' | 'ticker'>
> & {
  onChainClick: () => void
  onCoinClick: () => void
}

export const SwapCoinInputField = ({
  value,
  onChainClick,
  onCoinClick,
}: CoinInputContainerProps) => {
  const { chain } = value
  const { t } = useTranslation()
  const side = useTransferDirection()

  return (
    <Container
      side={side}
      justifyContent="center"
      gap={16}
      data-testid={`swap-${side}-section`}
    >
      <HStack justifyContent="space-between" alignItems="center">
        <HStack gap={6} alignItems="center">
          <Text weight="500" size={12} color="shy">
            {t(side)}
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
              data-testid={`swap-${side}-chain-selector`}
            >
              <Text weight="500" size={12} color="contrast">
                {chain}
              </Text>
              <ChevronDownIcon />
            </HStack>
          </HStack>
        </HStack>
        <CoinBalance value={value} />
      </HStack>
      <HStack flexGrow justifyContent="space-between" alignItems="flex-start">
        <CoinPillButton
          value={value}
          onClick={onCoinClick}
          testId={`swap-${side}-coin-selector`}
        />
        {match(side, {
          to: () => <ToAmount />,
          from: () => <ManageFromAmount />,
        })}
      </HStack>
    </Container>
  )
}
