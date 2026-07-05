import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { BodyPortal } from '@lib/ui/dom/BodyPortal'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Text, text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCore } from '../../../../state/core'
import { BlockaidLogo } from '../BlockaidLogo'

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1;
  padding: 24px;
  ${centerContent};
  background: ${getColor('overlay')};
  backdrop-filter: blur(4px);
`

const Card = styled(VStack)`
  width: 100%;
  max-width: 400px;
  padding: 24px;
  ${borderRadius.m};
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
`

const ContinueButton = styled(UnstyledButton)`
  ${text({ color: 'supporting', size: 12, weight: 500 })}
  align-self: center;

  &:hover {
    color: ${getColor('danger')};
  }
`

type BlockaidSiteScanMaliciousOverlayProps = {
  domain: string
  onAcknowledgeRisk?: () => void
}

export const BlockaidSiteScanMaliciousOverlay = ({
  domain,
  onAcknowledgeRisk,
}: BlockaidSiteScanMaliciousOverlayProps) => {
  const { t } = useTranslation()
  const { goBack } = useCore()
  const [isDismissed, { set: dismiss }] = useBoolean(false)

  if (isDismissed) return null

  return (
    <BodyPortal>
      <Backdrop>
        <Card gap={24} alignItems="center">
          <TriangleAlertIcon color="danger" fontSize={24} />
          <VStack gap={12} alignItems="center">
            <Text size={22} color="danger" centerHorizontally>
              {t('malicious_dapp_detected')}
            </Text>
            <Text size={14} color="supporting" centerHorizontally>
              {t('malicious_dapp_detected_description', { dapp: domain })}
            </Text>
          </VStack>
          <Text color="supporting" size={14} centerVertically={{ gap: 4 }}>
            <Trans
              i18nKey="powered_by"
              components={{ provider: <BlockaidLogo /> }}
            />
          </Text>
          <VStack fullWidth gap={20}>
            <Button onClick={goBack}>{t('go_back')}</Button>
            <ContinueButton
              onClick={() => {
                onAcknowledgeRisk?.()
                dismiss()
              }}
            >
              {t('continue_anyway')}
            </ContinueButton>
          </VStack>
        </Card>
      </Backdrop>
    </BodyPortal>
  )
}
