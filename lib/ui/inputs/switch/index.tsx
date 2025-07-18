import { Spinner } from '@lib/ui/loaders/Spinner'
import { getColor } from '@lib/ui/theme/getters'
import { FC, isValidElement, KeyboardEvent, ReactNode } from 'react'
import styled, { css } from 'styled-components'

const StyledLabel = styled.span`
  opacity: 1;
  transition: 0.2s;
`

const StyledSpinner = styled(Spinner)`
  left: 4px;
  top: 4px;
`

const StyledSlider = styled.span<{ checked?: boolean }>`
  background-color: ${getColor('mistExtra')};
  border-radius: 24px;
  height: 24px;
  position: relative;
  transition: 0.2s;
  width: 40px;

  &:before {
    background-color: ${getColor('white')};
    border-radius: 50%;
    content: '';
    height: 20px;
    left: 2px;
    position: absolute;
    top: 2px;
    transition: all 0.2s;
    width: 20px;
  }

  ${({ checked }) => {
    return checked
      ? css`
          background-color: ${getColor('buttonPrimary')};

          ${StyledSpinner} {
            transform: translateX(16px);
          }

          &:before {
            transform: translateX(16px);
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
  border-radius: 24px;
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
}

export const Switch: FC<SwitchProps> = ({
  checked = false,
  disabled = false,
  label,
  loading = false,
  onChange,
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
        checked={checked}
        disabled={disabled || loading}
        hoverable={!!onChange}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <StyledSlider checked={checked}>
          {loading && <StyledSpinner size={16} />}
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
