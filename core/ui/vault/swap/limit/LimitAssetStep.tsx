import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { RefreshCwIcon } from '@lib/ui/icons/RefreshCwIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'
import { LimitManageFromCoin } from './LimitManageFromCoin'
import { LimitManageToCoin } from './LimitManageToCoin'

/**
 * Pair and amount selection.
 *
 * Reuses the market form's coin inputs — each already renders its own amount
 * field — so the two swap modes stay identical where they overlap. The reverse
 * control is local rather than the market `ReverseSwap`, which drives a market
 * quote this screen has no use for.
 */
export const LimitAssetStep = () => {
  const { t } = useTranslation()
  const [fromCoinKey, setFromCoinKey] = useSwapFromCoin()
  const [toCoinKey, setToCoinKey] = useSwapToCoin()

  return (
    <Card gap={12}>
      <VStack gap={12}>
        <Text size={14} weight={500} color="contrast">
          {t('swap_limit_asset')}
        </Text>
        <Divider />
      </VStack>
      <VStack gap={8}>
        <LimitManageFromCoin />
        {/* Sits on the seam between the two cards, as in the design — anchoring
            it to the middle of the whole stack drops it onto the sell card's
            amount-suggestion row. */}
        <Seam>
          <ReverseWrapper>
            <ReverseButton
              type="button"
              onClick={() => {
                setFromCoinKey(toCoinKey)
                setToCoinKey(fromCoinKey)
              }}
              data-testid="limit-reverse"
            >
              <RefreshCwIcon />
            </ReverseButton>
          </ReverseWrapper>
        </Seam>
        <LimitManageToCoin />
      </VStack>
    </Card>
  )
}

const Card = styled(VStack)`
  border: 1px solid ${({ theme }) => theme.colors.foregroundExtra.toCssValue()};
  border-radius: 12px;
  padding: 16px;
`

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.foregroundExtra.toCssValue()};
`

const Seam = styled.div`
  position: relative;
  height: 0;
  z-index: 1;
`

// Mirrors the market form's reverse control: the button sits in a notch punched
// out of both cards, with the two curved border segments drawn as pseudo
// elements so the card outlines appear to wrap around it.
const ReverseWrapper = styled.div`
  ${centerContent};
  background-color: ${getColor('background')};
  border-radius: 25.5px;
  padding: 7px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  &::before {
    content: '';
    position: absolute;
    width: 54px;
    top: 0;
    height: 19px;
    border-radius: 50px;
    border: 1px solid ${getColor('foregroundExtra')};
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    border-bottom: none;
  }

  &::after {
    content: '';
    position: absolute;
    width: 54px;
    bottom: 0;
    height: 19px;
    border-radius: 50px;
    border: 1px solid ${getColor('foregroundExtra')};
    border-top-right-radius: 0;
    border-top-left-radius: 0;
    border-top: none;
  }
`

const ReverseButton = styled(UnstyledButton)`
  ${sameDimensions(40)};
  ${centerContent};
  border-radius: 1000px;
  border: 2px solid ${getColor('background')};
  background: ${({ theme }) => theme.colors.buttonPrimary.toCssValue()};
  color: ${({ theme }) => theme.colors.contrast.toCssValue()};
  cursor: pointer;
`
