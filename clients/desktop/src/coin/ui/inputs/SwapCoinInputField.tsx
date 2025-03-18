import { Coin } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { match } from '@lib/utils/match'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ChainCoinIcon } from '../../../chain/ui/ChainCoinIcon'
import { getChainEntityIconSrc } from '../../../chain/utils/getChainEntityIconSrc'
import { borderRadius } from '../../../lib/ui/css/borderRadius'
import { textInputBackground } from '../../../lib/ui/css/textInput'
import { ChevronDownIcon } from '../../../lib/ui/icons/ChevronDownIcon'
import { HStack, VStack } from '../../../lib/ui/layout/Stack'
import { OnClickProp, ValueProp } from '../../../lib/ui/props'
import { Text, text } from '../../../lib/ui/text'
import { getColor } from '../../../lib/ui/theme/getters'
import { shouldDisplayChainLogo } from '../../../vault/chain/utils'
import { ManageFromAmount } from '../../../vault/swap/form/amount/ManageFromAmount'
import { ToAmount } from '../../../vault/swap/form/amount/ToAmount'
import { SwapCoinBalance } from '../../../vault/swap/form/SwapCoinBalance'
import { SwapSide } from '../../../vault/swap/form/SwapCoinInput'
import { getCoinLogoSrc } from '../../logo/getCoinLogoSrc'

const Container = styled(VStack)`
  ${textInputBackground};
  ${text({
    color: 'contrast',
    size: 16,
    weight: 700,
  })}
  padding: 16px;
  ${borderRadius.l};

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`

type CoinInputContainerProps = ValueProp<
  Pick<Coin, 'id' | 'chain' | 'logo' | 'ticker'>
> &
  OnClickProp & {
    side: SwapSide
  }

export const SwapCoinInputField = ({
  value,
  onClick,
  side,
}: CoinInputContainerProps) => {
  const { ticker, chain, id } = value
  const { t } = useTranslation()

  return (
    <Container justifyContent="center" gap={16}>
      <HStack justifyContent="space-between" alignItems="center">
        <HStack gap={6} alignItems="center">
          <Text weight="700" size={12} color="shy">
            {t('from')}
          </Text>
          <HStack gap={4} alignItems="center">
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
              style={{ fontSize: 16 }}
            />
            <HStack
              style={{ cursor: 'pointer' }}
              onClick={onClick}
              role="button"
              tabIndex={0}
              gap={2}
              alignItems="center"
            >
              <Text weight="700" size={12} color="contrast">
                {chain}
              </Text>
              <ChevronDownIcon />
            </HStack>
          </HStack>
        </HStack>
        <SwapCoinBalance value={value} />
      </HStack>
      <HStack justifyContent="space-between" alignItems="center">
        <HStack alignItems="center" gap={8}>
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
          <Text weight="700" size={16} color="contrast">
            {value.ticker}
          </Text>
        </HStack>
        {match(side, {
          to: () => <ToAmount />,
          from: () => <ManageFromAmount />,
        })}
      </HStack>
    </Container>
  )
}
