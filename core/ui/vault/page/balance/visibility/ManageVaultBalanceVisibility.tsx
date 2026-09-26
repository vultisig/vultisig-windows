import {
  useIsBalanceVisible,
  useSetIsBalanceVisibleMutation,
} from '@core/ui/storage/balanceVisibility'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { EyeClosedIcon } from '@lib/ui/icons/EyeClosedIcon'
import { EyeIcon } from '@lib/ui/icons/EyeIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

/**
 * Pill that flips the global balance-visibility flag. The eye icon and label
 * crossfade into their counterparts in place, and the pill is always as wide
 * as its longer label, so it doesn't resize mid-swap.
 */
export const ManageVaultBalanceVisibility = () => {
  const { t } = useTranslation()
  const isVisible = useIsBalanceVisible()
  const { mutateAsync: setIsBalanceVisible } = useSetIsBalanceVisibleMutation()

  return (
    <Wrapper
      role="button"
      tabIndex={0}
      onClick={() => setIsBalanceVisible(!isVisible)}
    >
      <IconStack color="primaryAlt" size={16}>
        <IconLayer $isActive={isVisible}>
          <EyeIcon />
        </IconLayer>
        <IconLayer $isActive={!isVisible}>
          <EyeClosedIcon />
        </IconLayer>
      </IconStack>
      <LabelStack>
        <Label $isActive={isVisible} size={12} color="primaryAlt" nowrap>
          {t('hide_balance')}
        </Label>
        <Label $isActive={!isVisible} size={12} color="primaryAlt" nowrap>
          {t('show_balance')}
        </Label>
      </LabelStack>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  padding: 4px 6px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  ${borderRadius.sm};
  background: rgba(81, 128, 252, 0.12);
  cursor: pointer;
`

type LayerProps = {
  $isActive: boolean
}

const swapDuration = '0.3s'
const swapEasing = 'cubic-bezier(0.25, 1, 0.5, 1)'

// Both states stay mounted in one grid cell: the swap is a crossfade between
// them, and the cell always fits the larger one. The outgoing layer turns
// `visibility: hidden` only once it has faded out.
const layer = ({ $isActive }: LayerProps) => css`
  grid-area: 1 / 1;
  transition:
    opacity ${swapDuration} ${swapEasing},
    filter ${swapDuration} ${swapEasing},
    visibility 0s linear ${$isActive ? '0s' : swapDuration};

  ${!$isActive &&
  css`
    opacity: 0;
    visibility: hidden;
  `}
`

const IconStack = styled(IconWrapper)`
  display: inline-grid;
  place-items: center;
`

const IconLayer = styled.span<LayerProps>`
  display: inline-flex;
  ${layer};
`

const LabelStack = styled.div`
  display: grid;
  place-items: center;
`

// The outgoing label also blurs, so the two words morph into each other
// rather than plainly fading.
const Label = styled(Text)<LayerProps>`
  ${layer};

  ${({ $isActive }) =>
    !$isActive &&
    css`
      filter: blur(2px);
    `}
`
