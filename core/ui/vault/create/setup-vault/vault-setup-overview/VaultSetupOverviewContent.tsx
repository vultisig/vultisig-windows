import { getVaultSetupVariant } from '@core/ui/vault/create/setup-vault/vault-setup-overview/getVaultSetupVariant'
import { useVaultSetupAnimation } from '@core/ui/vault/create/setup-vault/vault-setup-overview/useVaultSetupAnimation'
import { VaultSetupBadge } from '@core/ui/vault/create/setup-vault/vault-setup-overview/VaultSetupBadge'
import { Button } from '@lib/ui/buttons/Button'
import { CoSignIcon } from '@lib/ui/icons/CoSignIcon'
import { PadlockIcon } from '@lib/ui/icons/PadlockIcon'
import { ShieldIcon } from '@lib/ui/icons/ShieldIcon'
import { ShieldVerifiedIcon } from '@lib/ui/icons/ShieldVerifiedIcon'
import { ZapIcon } from '@lib/ui/icons/ZapIcon'
import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type VaultSetupOverviewContentProps = {
  selectedDeviceCount: number
  onBack: () => void
  onGetStarted: () => void
}

const badgeIconRecord = {
  fast: <ZapIcon />,
  secure: <ShieldIcon />,
} as const

export const VaultSetupOverviewContent = ({
  selectedDeviceCount,
  onBack,
  onGetStarted,
}: VaultSetupOverviewContentProps) => {
  const { t } = useTranslation()
  const { key, securityType } = getVaultSetupVariant(selectedDeviceCount)

  const { RiveComponent, isLoading } =
    useVaultSetupAnimation(selectedDeviceCount)

  return (
    <ScreenLayout
      title={t('vaultSetupOverview.title')}
      onBack={onBack}
      footer={
        <Button
          style={{ width: '100%' }}
          onClick={onGetStarted}
          loading={isLoading}
        >
          {t('get_started')}
        </Button>
      }
    >
      <VStack gap={24}>
        <VaultSetupBadge
          icon={badgeIconRecord[securityType]}
          title={t(`vaultSetupOverview.${key}.badgeTitle`)}
          subtitle={t(`vaultSetupOverview.${key}.badgeSubtitle`)}
        />
        <AnimationWrapper>
          <AnimationContainer>
            <RiveComponent />
          </AnimationContainer>
        </AnimationWrapper>
        <VStack gap={16}>
          <FeatureRow>
            <FeatureIconContainer>
              <CoSignIcon style={{ fontSize: 24 }} />
            </FeatureIconContainer>
            <VStack gap={8} style={{ paddingTop: 2, flex: 1 }}>
              <Text size={15} weight={500} color="contrast">
                {t(`vaultSetupOverview.${key}.feature1Title`)}
              </Text>
              <Text variant="footnote" color="shy">
                {t(`vaultSetupOverview.${key}.feature1Description`)}
              </Text>
            </VStack>
          </FeatureRow>
          <FeatureRow>
            <FeatureIconContainer>
              <ShieldVerifiedIcon style={{ fontSize: 20 }} />
            </FeatureIconContainer>
            <VStack gap={8} style={{ paddingTop: 2, flex: 1 }}>
              <Text size={15} weight={500} color="contrast">
                {t(`vaultSetupOverview.${key}.feature2Title`)}
              </Text>
              <Text variant="footnote" color="shy">
                {t(`vaultSetupOverview.${key}.feature2Description`)}
              </Text>
            </VStack>
          </FeatureRow>
          <FeatureRow>
            <FeatureIconContainer>
              <PadlockIcon style={{ fontSize: 20 }} />
            </FeatureIconContainer>
            <VStack gap={8} style={{ paddingTop: 2, flex: 1 }}>
              <Text size={15} weight={500} color="contrast">
                {t(`vaultSetupOverview.${key}.feature3Title`)}
              </Text>
              <Text variant="footnote" color="shy">
                {t(`vaultSetupOverview.${key}.feature3Description`)}
              </Text>
            </VStack>
          </FeatureRow>
        </VStack>
      </VStack>
    </ScreenLayout>
  )
}

const AnimationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: hidden;
`

const AnimationContainer = styled.div`
  width: 100%;
  max-width: 400px;
  aspect-ratio: 350 / 240;
  position: relative;
  overflow: hidden;

  canvas {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain;
  }
`

const FeatureRow = styled(HStack)`
  gap: 16px;
  align-items: flex-start;
`

const FeatureIconContainer = styled.div`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${getColor('info')};
`
