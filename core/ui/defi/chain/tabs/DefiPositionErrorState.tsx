import { Button } from '@lib/ui/buttons/Button'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type DefiPositionErrorStateProps = {
  onRetry: () => Promise<unknown>
}

/**
 * Styled error state for the DeFi position tabs (Bonded / Staked / LPs). Shows a
 * friendly message and a Retry button instead of dumping the raw error string
 * (which previously leaked the failing endpoint URL into the UI).
 */
export const DefiPositionErrorState = ({
  onRetry,
}: DefiPositionErrorStateProps) => {
  const { t } = useTranslation()
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <ErrorWrapper>
      <VStack gap={12} alignItems="center">
        <IconWrapper size={24} color="danger">
          <TriangleAlertIcon />
        </IconWrapper>
        <Text centerHorizontally size={17} weight="600">
          {t('failed_to_load')}
        </Text>
      </VStack>
      <CtaWrapper>
        <Button loading={isRetrying} onClick={handleRetry}>
          {t('retry')}
        </Button>
      </CtaWrapper>
    </ErrorWrapper>
  )
}

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px 20px;
  background-color: ${getColor('foreground')};
  border-radius: 12px;
`

const CtaWrapper = styled.div`
  width: fit-content;
`
