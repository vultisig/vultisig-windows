import { Spinner } from '@lib/ui/loaders/Spinner'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import styled, { css } from 'styled-components'

const StyledSpinner = styled(Spinner)`
  left: 4px;
  top: 4px;
`

const StyledSlider = styled.span<{
  hoverable?: boolean
}>`
  background-color: ${getColor('neutralSix')};
  border-radius: 24px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: 0.2s;

  &:before {
    background-color: ${getColor('neutralOne')};
    border-radius: 50%;
    content: '';
    height: 20px;
    left: 2px;
    position: absolute;
    top: 2px;
    transition: all 0.2s;
    width: 20px;
  }

  ${({ hoverable }) => {
    return hoverable
      ? css`
          cursor: pointer;

          &:hover {
            background-color: ${getColor('neutralSeven')};
          }
        `
      : css``
  }}
`

const StyledInput = styled.input<{
  hoverable?: boolean
}>`
  height: 0;
  opacity: 0;
  width: 0;

  &:checked {
    + ${StyledSlider} {
      background-color: ${getColor('primaryAccentFour')};

      ${StyledSpinner} {
        transform: translateX(16px);
      }

      &:before {
        transform: translateX(16px);
      }

      ${({ hoverable }) => {
        return hoverable
          ? css`
              &:hover {
                background-color: ${getColor('primaryAccentThree')};
              }
            `
          : css``
      }}
    }
  }

  &:disabled {
    + ${StyledSlider} {
      background-color: ${getColor('neutralSix')};
      cursor: not-allowed;
      opacity: 0.6;
    }
  }
`

const StyledSwitch = styled.div`
  display: flex;
  height: 24px;
  position: relative;
  width: 40px;
`

interface SwitchProps {
  checked?: boolean
  disabled?: boolean
  loading?: boolean
  onChange?: (value: boolean) => void
}

export const Switch: FC<SwitchProps> = ({
  checked = false,
  disabled = false,
  loading = false,
  onChange,
}) => {
  const handleClick = () => {
    if (onChange && !disabled && !loading) onChange(!checked)
  }

  return (
    <StyledSwitch>
      <StyledInput
        checked={checked}
        disabled={disabled || loading}
        hoverable={!!onChange}
        type="checkbox"
      />
      <StyledSlider hoverable={!!onChange} onClick={handleClick}>
        {loading && <StyledSpinner size={16} />}
      </StyledSlider>
    </StyledSwitch>
  )
}
