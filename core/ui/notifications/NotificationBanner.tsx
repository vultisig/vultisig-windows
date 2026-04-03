import { IconButton } from '@lib/ui/buttons/IconButton'
import { CloseIcon } from '@lib/ui/icons/CloseIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { type TransitionEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const autoDismissMs = 30_000

const BannerRoot = styled.div<{ $isShown: boolean }>`
  background-color: ${getColor('foreground')};
  border-bottom: 1px solid ${getColor('foregroundExtra')};
  border-radius: 0 0 16px 16px;
  box-shadow: 0 8px 24px ${getColor('overlay')};
  left: 0;
  padding: 12px 8px 12px 16px;
  position: fixed;
  right: 0;
  top: 0;
  transform: translateY(${({ $isShown }) => ($isShown ? 0 : '-100%')});
  transition: transform 0.3s ease-out;
  z-index: 1000;
`

const BannerBody = styled.button`
  align-items: flex-start;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  display: flex;
  flex: 1;
  gap: 12px;
  margin: 0;
  min-width: 0;
  padding: 0;
  text-align: left;
`

const TitleText = styled(Text)`
  color: ${getColor('text')};
  font-weight: 600;
`

const SubtitleText = styled(Text)`
  color: ${getColor('textSupporting')};
  font-size: 14px;
  line-height: 18px;
`

/** Foreground-style banner: slide-in, action tap, dismiss, auto-hide. */
type NotificationBannerProps = {
  title: string
  subtitle: string
  onAction: () => void
  onDismiss: () => void
}

/**
 * Fixed top overlay banner (foreground notification style) with slide animation,
 * tap-to-action, dismiss control, and auto-dismiss.
 */
export const NotificationBanner = ({
  title,
  subtitle,
  onAction,
  onDismiss,
}: NotificationBannerProps) => {
  const { t } = useTranslation()
  const [isShown, setIsShown] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setIsShown(true)
    })
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const startDismiss = () => {
      setIsShown(false)
    }

    const timeoutId = window.setTimeout(startDismiss, autoDismissMs)
    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [title, subtitle])

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'transform') return
    if (!isShown) {
      onDismiss()
    }
  }

  return (
    <BannerRoot
      $isShown={isShown}
      onTransitionEnd={handleTransitionEnd}
      role="alert"
    >
      <HStack alignItems="flex-start" gap={4} fullWidth>
        <BannerBody type="button" onClick={onAction} aria-label={title}>
          <VStack alignItems="stretch" gap={4} fullWidth>
            <TitleText as="span" size={16}>
              {title}
            </TitleText>
            <SubtitleText as="span" size={14}>
              {subtitle}
            </SubtitleText>
          </VStack>
        </BannerBody>
        <IconButton
          kind="secondary"
          size="sm"
          aria-label={t('close')}
          onClick={event => {
            event.stopPropagation()
            setIsShown(false)
          }}
        >
          <CloseIcon />
        </IconButton>
      </HStack>
    </BannerRoot>
  )
}
