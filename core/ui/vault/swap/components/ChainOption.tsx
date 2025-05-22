import { Coin } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { ChainCoinIcon } from '@core/ui/chain/coin/icon/ChainCoinIcon'
import { getCoinLogoSrc } from '@core/ui/chain/coin/icon/utils/getCoinLogoSrc'
import { shouldDisplayChainLogo } from '@core/ui/chain/coin/icon/utils/shouldDisplayChainLogo'
import { useTransferDirection } from '@core/ui/state/transferDirection'
import { useToCoin } from '@core/ui/vault/swap/state/toCoin'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { panel } from '@lib/ui/panel/Panel'
import { IsActiveProp, OnClickProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { getChainLogoSrc } from '../../../chain/metadata/getChainLogoSrc'
import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'

export const ChainOption = ({
  value,
  onClick,
}: ValueProp<Coin> & OnClickProp & IsActiveProp) => {
  const { chain, logo, ticker, id } = value
  const [{ coin: fromCoinKey }] = useCoreViewState<'swap'>()
  const [currentToCoin] = useToCoin()
  const side = useTransferDirection()

  const isSelected =
    side === 'from'
      ? chain === fromCoinKey.chain
      : chain === currentToCoin.chain

  return (
    <Container
      isSelected={isSelected}
      tabIndex={0}
      role="button"
      onClick={onClick}
    >
      <HStack alignItems="center" justifyContent="space-between">
        <HStack fullWidth alignItems="center" gap={12}>
          <ChainCoinIcon
            coinSrc={logo ? getCoinLogoSrc(logo) : undefined}
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
          <VStack alignItems="start">
            <Text color="contrast" size={14} weight="500">
              {chain}
            </Text>
          </VStack>
        </HStack>
        {isSelected && (
          <IconWrapper>
            <CheckIcon />
          </IconWrapper>
        )}
      </HStack>
    </Container>
  )
}

const Container = styled('div')<{
  isSelected?: boolean
}>`
  ${panel()};
  padding: 12px 20px;
  border-radius: 0px;
  position: relative;
  cursor: pointer;
  border-bottom: 1px solid ${getColor('foregroundExtra')};
  background: ${({ isSelected }) =>
    getColor(isSelected ? 'foregroundExtra' : 'foreground')};

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  font-size: 16px;
  border-radius: 99px;
  color: ${getColor('primary')};
  background-color: ${getColor('foreground')};
`
