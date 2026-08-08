import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ReshareDevicesGraphic } from './ReshareDevicesGraphic'
import { ReshareOptionCard } from './ReshareOptionCard'

type ReshareVaultIntroStepProps = {
  onBack: () => void
  onStartReshare: () => void
  onJoinReshare: () => void
}

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  position: relative;
`

const GlowLayer = styled.div`
  background: radial-gradient(
    circle 260px at 50% 44%,
    rgba(72, 121, 253, 0.18),
    rgba(4, 57, 199, 0.06) 45%,
    transparent 72%
  );
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: 0;
`

const Foreground = styled(VStack)`
  flex: 1;
  position: relative;
  z-index: 1;
`

const GraphicWrapper = styled.div`
  width: 100%;
  max-width: 300px;
`

export const ReshareVaultIntroStep = ({
  onBack,
  onStartReshare,
  onJoinReshare,
}: ReshareVaultIntroStepProps) => {
  const { t } = useTranslation()

  return (
    <ScreenLayout
      onBack={onBack}
      footer={
        <VStack gap={12}>
          <ReshareOptionCard
            title={t('start_reshare')}
            description={t('start_reshare_description')}
            onClick={onStartReshare}
          />
          <ReshareOptionCard
            title={t('join_reshare')}
            description={t('join_reshare_description')}
            onClick={onJoinReshare}
          />
        </VStack>
      }
    >
      <Wrapper>
        <GlowLayer />
        <Foreground gap={12}>
          <VStack gap={8}>
            <Text as="h1" color="contrast" size={28} weight={500}>
              {t('reshare_your_vault')}
            </Text>
            <Text color="shyExtra" size={13} weight={500}>
              {t('reshare_vault_subtitle')}
            </Text>
          </VStack>
          <VStack flexGrow alignItems="center" justifyContent="center">
            <GraphicWrapper>
              <ReshareDevicesGraphic />
            </GraphicWrapper>
          </VStack>
        </Foreground>
      </Wrapper>
    </ScreenLayout>
  )
}
