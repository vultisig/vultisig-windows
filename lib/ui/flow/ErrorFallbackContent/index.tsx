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

export type ErrorFallbackContentProps = TitleProp & {
  error?: unknown
  description?: ReactNode
  variant?: ErrorStatusVariant
  onReportBug?: () => void
}

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
            onClick={() => setIsErrorModalOpen(true)}
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
`
