import { Coin } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { ChainCoinIcon } from '@core/ui/chain/coin/icon/ChainCoinIcon'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getCoinLogoSrc } from '@core/ui/chain/coin/icon/utils/getCoinLogoSrc'
import { shouldDisplayChainLogo } from '@core/ui/chain/coin/icon/utils/shouldDisplayChainLogo'
import { ChevronDownIcon } from '@lib/ui/icons/ChevronDownIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'

import { getChainLogoSrc } from '../../../../chain/metadata/getChainLogoSrc'
import { CoinBalance } from '../CoinBalance'
import { CoinWrapper, Container } from './SendCoinInputField.styled'

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
  const { ticker, chain, id } = value

  return (
    <Container justifyContent="center" gap={16}>
      <HStack justifyContent="space-between" alignItems="center">
        <HStack gap={6} alignItems="center">
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
        <CoinWrapper
          role="button"
          tabIndex={0}
          onClick={onCoinClick}
          alignItems="center"
          gap={8}
        >
          <ChainCoinIcon
            coinSrc={value.logo ? getCoinLogoSrc(value.logo) : undefined}
            chainSrc={
              shouldDisplayChainLogo({
                ticker,
                chain,
                isNative: isFeeCoin({ id, chain }),
              })
                ? getChainLogoSrc(chain)
                : undefined
            }
            style={{ fontSize: 32 }}
          />
          <HStack gap={4}>
            <Text weight="500" size={16} color="contrast">
              {value.ticker}
            </Text>
            <ChevronRightIcon />
          </HStack>
        </CoinWrapper>
        <CoinBalance value={value} />
      </HStack>
    </Container>
  )
}
