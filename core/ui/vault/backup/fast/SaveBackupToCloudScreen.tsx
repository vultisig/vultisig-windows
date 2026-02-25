import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { Button } from '@lib/ui/buttons/Button'
import { CloudUploadIcon } from '@lib/ui/icons/CloudUploadIcon'
import { Checkbox } from '@lib/ui/inputs/checkbox/Checkbox'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

type SaveBackupToCloudScreenProps = {
  onContinue: () => void
  onBack?: () => void
  ctaLoading?: boolean
}

export const SaveBackupToCloudScreen = ({
  onContinue,
  onBack,
  ctaLoading = false,
}: SaveBackupToCloudScreenProps) => {
  const { t } = useTranslation()
  const [isAgreed, setIsAgreed] = useState(false)

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          onBack ? <PageHeaderBackButton onClick={onBack} /> : undefined
        }
      />
      <PageContent flexGrow scrollable>
        <CenteredContent gap={32}>
          <VStack gap={16} alignItems="center">
            <IconWrapper>
              <CloudUploadIcon style={{ fontSize: 20 }} />
            </IconWrapper>
            <Text
              size={22}
              weight={500}
              color="contrast"
              centerHorizontally
            >
              {t('save_backup_to_cloud')}
            </Text>
            <Text size={14} color="shy" centerHorizontally>
              <Trans
                i18nKey="save_backup_description"
                components={{
                  b: <Text as="span" size={14} color="contrast" weight={700} />,
                }}
              />
            </Text>
            <Text size={14} color="shy" centerHorizontally>
              {t('save_backup_description_2')}
            </Text>
          </VStack>
          <VStack gap={16}>
            <Checkbox
              value={isAgreed}
              onChange={() => setIsAgreed(prev => !prev)}
              label={t('i_understand_save_backup')}
            />
            <Button
              onClick={onContinue}
              disabled={!isAgreed || ctaLoading}
              loading={ctaLoading}
            >
              {t('save_backup')}
            </Button>
          </VStack>
        </CenteredContent>
      </PageContent>
    </VStack>
  )
}

const IconWrapper = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #03132c;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.25) inset;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2561ff;

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 8px;
    background: radial-gradient(
      ellipse at center,
      rgba(37, 97, 255, 0.4) 0%,
      transparent 70%
    );
    border-radius: 50%;
    pointer-events: none;
  }
`

const CenteredContent = styled(VStack)`
  align-items: center;
  padding-top: 40px;
`
