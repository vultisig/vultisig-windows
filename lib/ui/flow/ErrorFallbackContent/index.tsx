import { ChevronDownIcon } from '@lib/ui/icons/ChevronDownIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { TitleProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ErrorStatusIcon, ErrorStatusVariant } from './ErrorStatusIcon'
import { ShowExactErrorModal } from './ShowExactErrorModal'

/**
 * Props for {@link ErrorFallbackContent}.
 *
 * @property title - Human-readable error name shown as the primary message.
 * @property error - Raw error surfaced behind the "Show exact error" sheet. When
 *   omitted, the disclosure card is hidden.
 * @property description - Plain-language explanation and the action to take,
 *   rendered under the title.
 * @property variant - Status icon variant: `error` (red ✕, hard failure) or
 *   `warning` (amber ⚠, recoverable / precondition error). Defaults to `warning`.
 * @property onReportBug - Invoked from the "Report Bug" action in the exact-error
 *   sheet; typically opens the Vultisig Discord support channel. When omitted, the
 *   "Report Bug" action is hidden.
 */
export type ErrorFallbackContentProps = TitleProp & {
  error?: unknown
  description?: ReactNode
  variant?: ErrorStatusVariant
  onReportBug?: () => void
}

/**
 * Friendly, actionable error screen. Renders the concentric-circle hero graphic
 * with a red ✕ / amber ⚠ status badge, the error title and description, and—when
 * a raw error is provided—a "Show exact error" card that opens
 * {@link ShowExactErrorModal} with Copy / Report Bug actions. Leads with the
 * human-readable message instead of dumping the raw exception.
 */
export const ErrorFallbackContent = ({
  error,
  title,
  description,
  variant = 'warning',
  onReportBug,
}: ErrorFallbackContentProps) => {
  const { t } = useTranslation()
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)

  const exactError = error ? extractErrorMsg(error) : undefined

  return (
    <VStack alignItems="center" gap={30} justifyContent="center" flexGrow>
      <ErrorStatusIcon variant={variant} />
      <VStack alignItems="center" gap={24} fullWidth>
        <VStack alignItems="center" gap={14} maxWidth={320}>
          <Text size={17} weight={500} color="contrast" centerHorizontally>
            {title}
          </Text>
          {description ? (
            <Text size={13} weight={500} color="shyExtra" centerHorizontally>
              {description}
            </Text>
          ) : null}
        </VStack>
        {exactError ? (
          <ShowExactErrorCard
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            onClick={() => setIsErrorModalOpen(true)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setIsErrorModalOpen(true)
              }
            }}
            alignItems="center"
            justifyContent="space-between"
            gap={4}
          >
            <Text size={14} weight={500} color="shyExtra">
              {t('show_exact_error')}
            </Text>
            <ChevronDownIcon />
          </ShowExactErrorCard>
        ) : null}
      </VStack>
      {isErrorModalOpen && exactError ? (
        <ShowExactErrorModal
          message={exactError}
          onReportBug={onReportBug}
          onClose={() => setIsErrorModalOpen(false)}
        />
      ) : null}
    </VStack>
  )
}

const ShowExactErrorCard = styled(HStack)`
  width: 100%;
  border-radius: 16px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  padding: 20px;
  cursor: pointer;
  color: ${getColor('contrast')};
  font-size: 20px;

  &:hover {
    background: ${getColor('foregroundDark')};
  }

  &:focus-visible {
    outline: 2px solid ${getColor('contrast')};
    outline-offset: 2px;
  }
`
