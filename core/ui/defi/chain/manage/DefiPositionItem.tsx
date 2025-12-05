import { getCoinLogoSrc } from '@core/ui/chain/coin/icon/utils/getCoinLogoSrc'
import { DefiPosition } from '@core/ui/storage/defiPositions'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled, { css } from 'styled-components'

type DefiPositionItemProps = {
  position: DefiPosition
  isSelected: boolean
  onToggle: () => void
  isLoading?: boolean
}

export const DefiPositionItem = ({
  position,
  isSelected,
  onToggle,
  isLoading,
}: DefiPositionItemProps) => {
  return (
    <Container onClick={onToggle} disabled={isLoading}>
      <VStack gap={8} alignItems="center">
        <IconWrapper isSelected={isSelected}>
          {position.logo ? (
            <SafeImage
              src={getCoinLogoSrc(position.logo)}
              render={props => <CoinLogo {...props} />}
              fallback={
                <Text size={16} weight="600" color="contrast">
                  {position.ticker.charAt(0)}
                </Text>
              }
            />
          ) : (
            <Text size={16} weight="600" color="contrast">
              {position.ticker.charAt(0)}
            </Text>
          )}
          {isSelected && (
            <CheckBadge>
              <CheckIcon />
            </CheckBadge>
          )}
        </IconWrapper>
        <Text size={12} weight="500" color="contrast">
          {position.ticker}
        </Text>
      </VStack>
    </Container>
  )
}

const Container = styled(UnstyledButton)`
  padding: 12px;
  border-radius: 12px;
  background: ${getColor('foreground')};
  transition: opacity 0.15s ease-in-out;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const IconWrapper = styled.div<{ isSelected: boolean }>`
  ${sameDimensions(48)};
  border-radius: 50%;
  background: ${getColor('foregroundExtra')};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  ${({ isSelected }) =>
    isSelected &&
    css`
      border: 2px solid ${getColor('primary')};
    `};
`

const CheckBadge = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  ${sameDimensions(18)};
  border-radius: 50%;
  background: ${getColor('primary')};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 10px;
    height: 10px;
    color: ${getColor('background')};
  }
`

const CoinLogo = styled.img`
  ${sameDimensions(32)};
  border-radius: 50%;
`
