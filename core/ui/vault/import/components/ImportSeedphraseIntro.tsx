import { useImportSeedphraseAnimation } from '@core/ui/vault/import/hooks/useImportSeedphraseAnimation'
import { Button } from '@lib/ui/buttons/Button'
import { SeedphraseIcon } from '@lib/ui/icons/SeedphraseIcon'
import { TabletSmartphoneIcon } from '@lib/ui/icons/TabletSmartphoneIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { VStack } from '@lib/ui/layout/Stack'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { OnFinishProp } from '@lib/ui/props'
import { GradientText, Text } from '@lib/ui/text'
import { Trans, useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { ImportRequirementRow } from './ImportRequirementRow'

const AnimationContainer = styled.div<{ showContent: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
  z-index: 1;

  ${({ showContent }) =>
    showContent
      ? css`
          top: 32px;
        `
      : css`
          top: 50%;
          transform: translateY(-50%);
        `}

  & > * {
    width: 263px !important;
    height: 186px !important;
  }
`

const ContentArea = styled(VStack)`
  flex-grow: 1;
  padding-top: 250px; // top 32 + height 186 + gap 32
  width: 100%;
  max-width: 576px;
  align-self: center;
`

export const ImportSeedphraseIntro = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()
  const { RiveComponent, showContent } = useImportSeedphraseAnimation()

  return (
    <>
      <FitPageContent>
        <VStack style={{ position: 'relative' }} flexGrow>
          <AnimationContainer showContent={showContent}>
            <RiveComponent />
          </AnimationContainer>

          <ContentArea>
            <AnimatedVisibility isOpen={showContent}>
              <VStack gap={32}>
                <VStack gap={12}>
                  <Text color="shy" size={12} weight={500}>
                    {t('before_you_start')}
                  </Text>
                  <Text size={22} weight={500} height="large">
                    <Trans
                      i18nKey="import_seedphrase_onboarding_title"
                      components={{ g: <GradientText /> }}
                    />
                  </Text>
                </VStack>

                <VStack gap={24}>
                  <ImportRequirementRow
                    icon={<SeedphraseIcon />}
                    title={t('your_seedphrase')}
                    description={t('your_seedphrase_subtitle')}
                  />
                  <ImportRequirementRow
                    icon={<TabletSmartphoneIcon />}
                    title={t('at_least_one_device')}
                    description={t('at_least_one_device_subtitle')}
                  />
                </VStack>
              </VStack>
            </AnimatedVisibility>
          </ContentArea>
        </VStack>
      </FitPageContent>

      <PageFooter alignItems="center">
        <AnimatedVisibility isOpen={showContent}>
          <VStack maxWidth={576} fullWidth>
            <Button onClick={onFinish}>{t('next')}</Button>
          </VStack>
        </AnimatedVisibility>
      </PageFooter>
    </>
  )
}
