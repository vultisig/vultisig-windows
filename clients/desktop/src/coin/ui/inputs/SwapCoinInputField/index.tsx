import { Coin } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { ChevronDownIcon } from '@lib/ui/icons/ChevronDownIcon'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { match } from '@lib/utils/match'
import { useTranslation } from 'react-i18next'

import { ChainCoinIcon } from '../../../../chain/ui/ChainCoinIcon'
import { ChainEntityIcon } from '../../../../chain/ui/ChainEntityIcon'
import { getChainEntityIconSrc } from '../../../../chain/utils/getChainEntityIconSrc'
import { shouldDisplayChainLogo } from '../../../../vault/chain/utils'
import { ManageFromAmount } from '../../../../vault/swap/form/amount/ManageFromAmount'
import { ToAmount } from '../../../../vault/swap/form/amount/ToAmount'
import { SwapCoinBalance } from '../../../../vault/swap/form/SwapCoinBalance'
import { useSide } from '../../../../vault/swap/providers/SideProvider'
import { getCoinLogoSrc } from '../../../logo/getCoinLogoSrc'
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
  const { ticker, chain, id } = value
  const { t } = useTranslation()
  const side = useSide()

  return (
    <Container side={side} justifyContent="center" gap={16}>
      <HStack justifyContent="space-between" alignItems="center">
        <HStack gap={6} alignItems="center">
          <Text weight="500" size={12} color="shy">
            {t('from')}
          </Text>
          <HStack gap={4} alignItems="center">
            <ChainEntityIcon
              value={getChainEntityIconSrc(chain)}
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
        <SwapCoinBalance value={value} />
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
            coinSrc={getCoinLogoSrc(value.logo)}
            chainSrc={
              shouldDisplayChainLogo({
                ticker,
                chain,
                isNative: isFeeCoin({ id, chain }),
              })
                ? getChainEntityIconSrc(chain)
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
        {match(side, {
          to: () => <ToAmount />,
          from: () => <ManageFromAmount />,
        })}
      </HStack>
    </Container>
  )
}
