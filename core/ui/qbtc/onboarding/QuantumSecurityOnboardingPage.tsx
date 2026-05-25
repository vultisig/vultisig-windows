import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVaultSecurityType } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { ChainLinkIcon3 } from '@lib/ui/icons/ChainLinkIcon3'
import { CoinsIcon } from '@lib/ui/icons/CoinsIcon'
import { LockKeyholeIcon } from '@lib/ui/icons/LockKeyholeIcon'
import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { HStack } from '@lib/ui/layout/Stack'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { Text } from '@lib/ui/text'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import {
  FeatureIcon,
  FeatureList,
  FeatureText,
  HeroFrame,
  PageBody,
  TitleStack,
} from './QuantumSecurityOnboardingPage.styles'

const features = [
  {
    key: 'generate',
    icon: <LockKeyholeIcon />,
    titleKey: 'qbtc_onboarding_feature_generate_title',
    descriptionKey: 'qbtc_onboarding_feature_generate_description',
  },
  {
    key: 'link',
    icon: <ChainLinkIcon3 />,
    titleKey: 'qbtc_onboarding_feature_link_title',
    descriptionKey: 'qbtc_onboarding_feature_link_description',
  },
  {
    key: 'claim',
    icon: <CoinsIcon />,
    titleKey: 'qbtc_onboarding_feature_claim_title',
    descriptionKey: 'qbtc_onboarding_feature_claim_description',
  },
] as const satisfies {
  key: string
  icon: ReactNode
  titleKey: string
  descriptionKey: string
}[]

/** Onboarding screen shown before MLDSA key generation. Explains why a new
 * post-quantum key is needed, what will happen during the MPC ceremony, and
 * what the user gains afterwards. The "Get started" CTA drops the user into
 * the existing single-keygen flow (Fast or Secure depending on vault type). */
export const QuantumSecurityOnboardingPage = () => {
  const { t } = useTranslation()
  const goBack = useNavigateBack()
  const navigate = useCoreNavigate()
  const securityType = useCurrentVaultSecurityType()
  const isFastVault = securityType === 'fast'

  const startKeygen = () => {
    navigate({ id: isFastVault ? 'singleKeygenFast' : 'singleKeygenSecure' })
  }

  return (
    <ScreenLayout
      onBack={goBack}
      footer={
        <Button kind="primary" onClick={startKeygen}>
          {t('qbtc_onboarding_get_started')}
        </Button>
      }
    >
      <PageBody>
        <TitleStack>
          <Text size={22} weight={500} height={24 / 22} color="contrast">
            {t('qbtc_onboarding_title')}
          </Text>
          <Text size={13} weight={500} height={18 / 13} color="shyExtra">
            {t('qbtc_onboarding_subtitle')}
          </Text>
        </TitleStack>

        <HeroFrame aria-hidden />

        <FeatureList>
          {features.map(feature => (
            <HStack key={feature.key} gap={16} alignItems="flex-start">
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureText>
                <Text size={15} weight={500} height={17 / 15} color="contrast">
                  {t(feature.titleKey)}
                </Text>
                <Text size={13} weight={500} height={18 / 13} color="shy">
                  {t(feature.descriptionKey)}
                </Text>
              </FeatureText>
            </HStack>
          ))}
        </FeatureList>
      </PageBody>
    </ScreenLayout>
  )
}
