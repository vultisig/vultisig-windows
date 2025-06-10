import { Coin } from '@core/chain/coin/Coin'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useTransferDirection } from '@core/ui/state/transferDirection'
import { ManageFromAmount } from '@core/ui/vault/swap/form/amount/ManageFromAmount'
import { ToAmount } from '@core/ui/vault/swap/form/amount/ToAmount'
import { ChevronDownIcon } from '@lib/ui/icons/ChevronDownIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { match } from '@lib/utils/match'
import { useTranslation } from 'react-i18next'

import { getChainLogoSrc } from '../../../../chain/metadata/getChainLogoSrc'
import { CoinBalance } from '../CoinBalance'
import { CoinWrapper, Container } from './SwapCoinInputField.styled'

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
    <Container side={side} justifyContent="center" gap={16}>
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
      <HStack flexGrow justifyContent="space-between" alignItems="center">
        <CoinWrapper
          role="button"
          tabIndex={0}
          onClick={onCoinClick}
          alignItems="center"
          gap={8}
        >
          <CoinIcon coin={value} style={{ fontSize: 32 }} />
          <HStack gap={4}>
            <Text weight="500" size={16} color="contrast">
              {value.ticker}
            </Text>
            <ChevronRightIcon />
          </HStack>
        </CoinWrapper>
        {match(side, {
          to: () => <ToAmount />,
          from: () => <ManageFromAmount />,
        })}
      </HStack>
    </Container>
  )
}
