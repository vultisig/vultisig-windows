import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled, { css } from 'styled-components'

type VaultListRowProps = {
  title: ReactNode
  subtitle?: ReactNode
  meta?: ReactNode
  trailing?: ReactNode
  leading?: ReactNode
  onClick?: () => void
  selected?: boolean
  disabled?: boolean
  dimmed?: boolean
}

export const VaultListRow = ({
  leading,
  title,
  subtitle,
  meta,
  trailing,
  onClick,
  selected = false,
  disabled = false,
  dimmed = false,
}: VaultListRowProps) => {
  return (
    <Row
      clickable={!!onClick}
      selected={selected}
      disabled={disabled}
      dimmed={dimmed}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onClick={disabled ? undefined : onClick}
      onKeyDown={
        disabled || !onClick
          ? undefined
          : event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onClick()
              }
            }
      }
    >
      <RowContent gap={14} alignItems="center">
        {leading && <LeadingSlot>{leading}</LeadingSlot>}
        <VStack gap={4} alignItems="flex-start">
          <Text size={16} weight={600} color="contrast" cropped>
            {title}
          </Text>
          {subtitle && (
            <Text size={13} weight={500} color="shy" cropped>
              {subtitle}
            </Text>
          )}
        </VStack>
      </RowContent>
      <RowContent gap={12} alignItems="center">
        {meta}
        {trailing}
      </RowContent>
    </Row>
  )
}

type RowStyleProps = {
  clickable?: boolean
  selected?: boolean
  disabled?: boolean
  dimmed?: boolean
}

const Row = styled.div.withConfig({
  shouldForwardProp: prop =>
    !['clickable', 'selected', 'disabled', 'dimmed'].includes(prop as string),
})<RowStyleProps>`
  align-items: center;
  background: ${({ theme, selected }) =>
    selected && theme.colors.foregroundDark.withAlpha(0.65).toCssValue()};
  border-radius: 18px;
  border: 1px solid
    ${({ theme }) => theme.colors.foregroundExtra.withAlpha(0.7).toCssValue()};
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s ease,
    opacity 0.25s ease;

  ${({ clickable, disabled }) =>
    clickable &&
    css`
      cursor: ${disabled ? 'not-allowed' : 'pointer'};
      ${!disabled &&
      css`
        &:hover {
          background: ${getColor('foreground')};
        }

        &:focus-visible {
          outline: none;
          border-color: ${getColor('primary')};
        }
      `}
    `}

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.4;
    `}

  ${({ dimmed }) =>
    dimmed &&
    css`
      opacity: 0.6;
    `}
`

const RowContent = styled(HStack)`
  flex-shrink: 0;
`

const LeadingSlot = styled.div`
  display: flex;
  align-items: center;
`

type LeadingIconProps = {
  children: ReactNode
  tone?: 'primary' | 'warning' | 'neutral'
}

export const LeadingIconBadge = ({
  children,
  tone = 'neutral',
}: LeadingIconProps) => {
  return <IconBadge tone={tone}>{children}</IconBadge>
}

const IconBadge = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'tone',
})<{ tone: LeadingIconProps['tone'] }>`
  align-items: center;
  border-radius: 99px;
  display: flex;
  font-size: 16px;
  height: 40px;
  justify-content: center;
  width: 40px;
  color: ${({ tone, theme }) => {
    switch (tone) {
      case 'primary':
        return theme.colors.success.toCssValue()
      case 'warning':
        return theme.colors.idle.toCssValue()
      default:
        return theme.colors.textSupporting.toCssValue()
    }
  }};
  background: ${({ tone, theme }) => {
    const base = (() => {
      switch (tone) {
        case 'primary':
          return theme.colors.success
        case 'warning':
          return theme.colors.idle
        default:
          return theme.colors.foregroundExtra
      }
    })()

    return base.withAlpha(tone === 'neutral' ? 0.18 : 0.16).toCssValue()
  }};
`

export const SelectionIndicator = () => {
  return (
    <SelectionBadge>
      <CheckmarkIcon />
    </SelectionBadge>
  )
}

const SelectionBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary.withAlpha(0.4).toCssValue()} 0%,
    ${({ theme }) => theme.colors.primary.toCssValue()} 100%
  );
  color: ${getColor('contrast')};
  font-size: 18px;
`
