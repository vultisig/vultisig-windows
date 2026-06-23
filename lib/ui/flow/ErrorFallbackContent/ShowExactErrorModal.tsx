import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { CopyIcon } from '@lib/ui/icons/CopyIcon'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { OnCloseProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCopyToClipboard } from 'react-use'
import styled from 'styled-components'

type ShowExactErrorModalProps = OnCloseProp & {
  message: string
  onReportBug?: () => void
}

/**
 * Full-screen "Error message" sheet that surfaces the raw technical error
 * behind the friendly error screen. Reuses the shared ResponsiveModal so it
 * slides up on mobile and centers on desktop. Provides Copy and Report Bug
 * (copy + open Discord) actions.
 */
export const ShowExactErrorModal = ({
  message,
  onClose,
  onReportBug,
}: ShowExactErrorModalProps) => {
  const { t } = useTranslation()
  const [, copyToClipboard] = useCopyToClipboard()
  const [copied, setCopied] = useState(false)

  const copy = () => {
    copyToClipboard(message)
    setCopied(true)
  }

  return (
    <ResponsiveModal
      isOpen
      onClose={onClose}
      modalProps={{ withDefaultStructure: false }}
    >
      <Wrapper gap={16}>
        <HStack alignItems="center" justifyContent="space-between" gap={12}>
          <Text size={22} weight={500} color="contrast">
            {t('error_message')}
          </Text>
          <IconButton
            aria-label={t('close')}
            kind="secondary"
            size="lg"
            onClick={onClose}
          >
            <CrossIcon />
          </IconButton>
        </HStack>
        <ErrorBox>
          <Text size={13} weight={500} color="shy" height={1.4}>
            {message}
          </Text>
        </ErrorBox>
        <HStack gap={12}>
          <Action
            kind="secondary"
            icon={copied ? <CheckIcon /> : <CopyIcon />}
            onClick={copy}
          >
            {copied ? t('copied') : t('copy')}
          </Action>
          {onReportBug ? (
            <Action
              kind="secondary"
              onClick={() => {
                copyToClipboard(message)
                onReportBug()
              }}
            >
              {t('report_bug')}
            </Action>
          ) : null}
        </HStack>
      </Wrapper>
    </ResponsiveModal>
  )
}

const Wrapper = styled(VStack)`
  width: 100%;
  background: ${getColor('background')};
  ${borderRadius.m};
  padding: 20px;

  @media ${mediaQuery.tabletDeviceAndUp} {
    width: min(420px, 100% - 32px);
  }
`

const ErrorBox = styled.div`
  border-radius: 24px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  padding: 20px;
  max-height: 320px;
  overflow: auto;
  overflow-wrap: anywhere;
  word-break: break-word;
`

const Action = styled(Button)`
  flex: 1;
`
