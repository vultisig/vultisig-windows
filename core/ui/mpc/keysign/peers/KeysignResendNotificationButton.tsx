import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { ResendNotificationBellIcon } from '@lib/ui/icons/ResendNotificationBellIcon'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled, { css, DefaultTheme } from 'styled-components'

import { formatResendCooldownTime } from './useKeysignDiscoveryNotify'

/** Figma `backgrounds/disabled` — navy fill without adding tokens to mirrored `lib/ui/theme`. */
const resendBadgeBackground = ({ theme }: { theme: DefaultTheme }) =>
  theme.colors.foregroundDark.withAlpha(0.5).toCssValue()

const BadgeButton = styled(UnstyledButton)<{ $interactive: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-sizing: border-box;
  min-height: 32px;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid
    ${({ theme }) => theme.colors.white.withAlpha(0.03).toCssValue()};
  background: ${resendBadgeBackground};
  flex-shrink: 0;
  max-width: 100%;
  cursor: ${({ $interactive }) => ($interactive ? 'pointer' : 'default')};

  ${({ $interactive }) =>
    $interactive &&
    css`
      &:hover {
        filter: brightness(1.07);
      }

      &:active {
        filter: brightness(0.97);
      }
    `}
`

const BellWrap = styled.span`
  display: flex;
  flex-shrink: 0;
  font-size: 16px;
  color: ${getColor('info')};
`

type KeysignResendNotificationButtonProps = {
  cooldownSec: number
  disabled: boolean
  onResend: () => void
}

export const KeysignResendNotificationButton = ({
  cooldownSec,
  disabled,
  onResend,
}: KeysignResendNotificationButtonProps) => {
  const { t } = useTranslation()
  const interactive = !disabled
  const label =
    cooldownSec > 0
      ? t('resend_notification_in', {
          time: formatResendCooldownTime(cooldownSec),
        })
      : t('resend_notification')

  return (
    <BadgeButton
      type="button"
      $interactive={interactive}
      disabled={disabled}
      onClick={onResend}
    >
      <BellWrap aria-hidden>
        <ResendNotificationBellIcon />
      </BellWrap>
      <Text
        as="span"
        color="info"
        nowrap
        size={12}
        weight="500"
        height={16 / 12}
      >
        {label}
      </Text>
    </BadgeButton>
  )
}
