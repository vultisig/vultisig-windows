import { HSLA } from '@lib/ui/colors/HSLA'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { getColor } from '@lib/ui/theme/getters'
import { FC, isValidElement, KeyboardEvent, ReactNode } from 'react'
import styled, { css } from 'styled-components'

import { borderRadius } from '../../css/borderRadius'

type SwitchSize = 'medium' | 'large'

type SwitchDimensions = {
  width: number
  height: number
  inset: number
}

const switchDimensions: Record<SwitchSize, SwitchDimensions> = {
  medium: { width: 40, height: 24, inset: 2 },
  large: { width: 56, height: 30, inset: 3 },
}

const getKnobSize = ({ height, inset }: SwitchDimensions) => height - 2 * inset

const getKnobTravel = (dimensions: SwitchDimensions) =>
  dimensions.width - getKnobSize(dimensions) - 2 * dimensions.inset

// Figma neutrals/500, the large toggle's off track; no theme token carries it.
const largeTrackOffColor = new HSLA(205.5, 14.5, 55.5)

const StyledLabel = styled.span`
  opacity: 1;
  transition: 0.2s;
`

const StyledSpinner = styled(Spinner)<{ $inset: number }>`
  left: ${({ $inset }) => $inset}px;
  top: ${({ $inset }) => $inset}px;
`

const StyledSlider = styled.span<{ checked?: boolean; $size: SwitchSize }>`
  ${borderRadius.pill};
  position: relative;
  transition: 0.2s;

  ${({ $size }) => {
    const dimensions = switchDimensions[$size]
    const knobSize = getKnobSize(dimensions)

    return css`
      height: ${dimensions.height}px;
      width: ${dimensions.width}px;

      &:before {
        height: ${knobSize}px;
        left: ${dimensions.inset}px;
        top: ${dimensions.inset}px;
        width: ${knobSize}px;
      }
    `
  }}

  background-color: ${({ $size }) =>
    $size === 'large'
      ? largeTrackOffColor.toCssValue()
      : getColor('mistExtra')};

  &:before {
    background-color: ${getColor('white')};
    ${borderRadius.pill};
    content: '';
    position: absolute;
    transition: all 0.2s;
  }

  ${({ checked, $size }) => {
    const travel = getKnobTravel(switchDimensions[$size])

    return checked
      ? css`
          background-color: ${getColor(
            $size === 'large' ? 'primaryAccentFour' : 'buttonPrimary'
          )};

          ${StyledSpinner} {
            transform: translateX(${travel}px);
          }

          &:before {
            transform: translateX(${travel}px);
          }
        `
      : css``
  }}
`

const StyledSwitch = styled.div<{
  checked?: boolean
  disabled?: boolean
  hoverable?: boolean
}>`
  align-items: center;
  ${borderRadius.pill};
  display: flex;
  gap: 8px;
  position: relative;

  ${({ checked, disabled, hoverable }) => {
    return disabled
      ? css`
          ${StyledSlider} {
            background-color: ${getColor('mistExtra')};
            cursor: not-allowed;
            opacity: 0.6;
          }
        `
      : hoverable
        ? css`
            cursor: pointer;

            &:focus,
            &:hover {
              ${StyledLabel} {
                opacity: 0.8;
              }

              ${StyledSlider} {
                background-color: ${checked
                  ? 'hsl(224, 75, 50)'
                  : getColor('textSupporting')};
              }
            }
          `
        : css``
  }}
`

const StyledContainer = styled.div`
  display: flex;
`

type SwitchProps = {
  checked?: boolean
  disabled?: boolean
  label?: ReactNode
  loading?: boolean
  onChange?: (value: boolean) => void
  /** `large` is the 56x30 toggle of the settings rows. */
  size?: SwitchSize
}

export const Switch: FC<SwitchProps> = ({
  checked = false,
  disabled = false,
  label,
  loading = false,
  onChange,
  size = 'medium',
}) => {
  const handleClick = () => {
    if (onChange && !disabled && !loading) onChange(!checked)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <StyledContainer>
      <StyledSwitch
        aria-busy={loading}
        aria-checked={checked}
        // The switch is a div, so the `disabled` prop only drives styling and the
        // handlers' own guard; assistive technology needs to be told separately.
        // It stays in the tab order on purpose, so the control is still findable.
        aria-disabled={disabled || loading}
        checked={checked}
        disabled={disabled || loading}
        hoverable={!!onChange}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="switch"
        tabIndex={0}
      >
        <StyledSlider checked={checked} $size={size}>
          {loading && (
            <StyledSpinner
              $inset={switchDimensions[size].inset}
              size={getKnobSize(switchDimensions[size])}
            />
          )}
        </StyledSlider>
        {label ? (
          isValidElement(label) ? (
            label
          ) : (
            <StyledLabel>{label}</StyledLabel>
          )
        ) : null}
      </StyledSwitch>
    </StyledContainer>
  )
}
