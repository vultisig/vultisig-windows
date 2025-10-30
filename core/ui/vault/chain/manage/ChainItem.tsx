import { areEqualCoins, Coin } from '@core/chain/coin/Coin'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import {
  useCreateCoinMutation,
  useDeleteCoinMutation,
} from '@core/ui/storage/coins'
import { useCurrentVaultNativeCoins } from '@core/ui/vault/state/currentVaultCoins'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { vStack } from '@lib/ui/layout/Stack'
import { IsActiveProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useMemo } from 'react'
import styled from 'styled-components'
import { css } from 'styled-components'

export const ChainItem = ({ value: coin }: ValueProp<Coin>) => {
  const currentCoins = useCurrentVaultNativeCoins()
  const createCoin = useCreateCoinMutation()
  const deleteCoin = useDeleteCoinMutation()

  const currentCoin = useMemo(() => {
    return currentCoins.find(c => areEqualCoins(c, coin))
  }, [currentCoins, coin])

  const isSelected = !!currentCoin
  const isLoading = createCoin.isPending || deleteCoin.isPending

  const handleClick = () => {
    if (isLoading) return
    if (currentCoin) {
      deleteCoin.mutate(currentCoin)
    } else {
      createCoin.mutate(coin)
    }
  }

  return (
    <ChainCard
      onClick={handleClick}
      isSelected={isSelected}
      isLoading={isLoading}
    >
      <ChainIconWrapper isActive={isSelected}>
        <ChainEntityIcon
          value={getChainLogoSrc(coin.chain)}
          style={{ fontSize: 27.5 }}
        />
        {isSelected && (
          <CheckBadge color="primary" size={12}>
            <CheckmarkIcon />
          </CheckBadge>
        )}
      </ChainIconWrapper>
      <Text cropped color="contrast" size={12} weight={500}>
        {coin.chain}
      </Text>
    </ChainCard>
  )
}

const ChainCard = styled(UnstyledButton)<{
  isSelected: boolean
  isLoading: boolean
}>`
  ${vStack({
    gap: 11,
  })};

  width: 74px;
`

const ChainIconWrapper = styled.div<IsActiveProp>`
  ${vStack({
    alignItems: 'center',
    justifyContent: 'center',
  })};
  position: relative;
  border-radius: 24px;
  background: rgba(11, 26, 58, 0.5);
  height: 74px;
  padding: 17px;

  ${({ isActive }) =>
    isActive &&
    css`
      border: 1.5px solid ${getColor('foregroundSuper')};
      background: ${getColor('foreground')};
    `}
`

const CheckBadge = styled(IconWrapper)`
  position: absolute;
  bottom: 0;
  right: 0;
  height: 24px;
  padding: 8px;
  border-radius: 50%;
  border-radius: 40px 0 25px 0;
  background: ${getColor('foregroundSuper')};
  font-weight: 600;
`
