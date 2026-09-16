import { borderRadius } from '@lib/ui/css/borderRadius'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { match } from '@vultisig/lib-utils/match'
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
      data-testid="vault-list-row"
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
      <MainContent gap={14} alignItems="center">
        {leading && <LeadingSlot>{leading}</LeadingSlot>}
        <TextContent gap={4}>
          <Text size={16} weight={600} color="contrast" cropped>
            {title}
          </Text>
          {subtitle && (
            <Text size={13} weight={500} color="shy" cropped>
              {subtitle}
            </Text>
          )}
        </TextContent>
      </MainContent>
      {meta || trailing ? (
        <TrailingContent gap={12} alignItems="center">
          {meta}
          {trailing}
        </TrailingContent>
      ) : null}
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
  ${borderRadius.lg};
  border: 1px solid
    ${({ theme }) => theme.colors.foregroundExtra.withAlpha(0.7).toCssValue()};
  display: flex;
  gap: 12px;
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

// The title side owns the leftover width and is allowed to shrink so a long
// vault name ellipsizes instead of pushing the trailing control out of the row.
const MainContent = styled(HStack)`
  flex: 1;
  min-width: 0;
`

const TextContent = styled(VStack)`
  min-width: 0;
`

const TrailingContent = styled(HStack)`
  flex-shrink: 0;
`

const LeadingSlot = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`

type LeadingIconProps = {
  children: ReactNode
  tone?: 'primary' | 'warning' | 'neutral' | 'info'
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
  ${borderRadius.pill};
  display: flex;
  font-size: 16px;
  height: 40px;
  justify-content: center;
  width: 40px;
  color: ${({ tone, theme }) =>
    match(tone ?? 'neutral', {
      primary: () => theme.colors.success.toCssValue(),
      warning: () => theme.colors.idle.toCssValue(),
      info: () => theme.colors.info.toCssValue(),
      neutral: () => theme.colors.textSupporting.toCssValue(),
    })};
  background: ${({ tone, theme }) => {
    const base = match(tone ?? 'neutral', {
      primary: () => theme.colors.success,
      warning: () => theme.colors.idle,
      info: () => theme.colors.info,
      neutral: () => theme.colors.foregroundExtra,
    })

    return base.withAlpha(tone === 'neutral' ? 0.18 : 0.16).toCssValue()
  }};
`
