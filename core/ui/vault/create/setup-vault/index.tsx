import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useSetupVaultPageAnimation } from '@core/ui/vault/create/setup-vault/hooks/useSetupVaultPageAnimation'
import { useVaultSecurityType } from '@core/ui/vault/state/vaultSecurityType'
import { getVaultSecurityProperties } from '@core/ui/vault/VaultSecurityType'
import { Match } from '@lib/ui/base/Match'
import { Button } from '@lib/ui/buttons/Button'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { ShieldIcon } from '@lib/ui/icons/ShieldIcon'
import { ZapIcon } from '@lib/ui/icons/ZapIcon'
import { ToggleSwitch } from '@lib/ui/inputs/toggle-switch/ToggleSwitch'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { GradientText, Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { match } from '@lib/utils/match'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const DescriptionWrapper = styled(VStack)`
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 16px;
`

const DescriptionContentWrapper = styled(VStack)`
  background-color: ${getColor('foreground')};
  /* One off color, please add it in the theme if reusing it */
  border-top: 1px dotted hsl(217, 91, 9);
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  padding: 16px;
`

export const SetupVaultPage = () => {
  const { RiveComponent, isPlaying, onPlay } = useSetupVaultPageAnimation()
  const { t } = useTranslation()
  const [value, setValue] = useVaultSecurityType()
  const navigate = useCoreNavigate()

  const handleStart = () => {
    match(value, {
      fast: () => navigate({ id: 'setupFastVault' }),
      secure: () => navigate({ id: 'setupSecureVault' }),
    })
  }

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('chooseSetup')}
        hasBorder
      />
      <PageContent alignItems="center" scrollable>
        <VStack gap={20} maxWidth={576} fullSize>
          <RiveComponent />
          <ToggleSwitch
            options={[
              {
                label: t('fast'),
                value: 'fast',
                icon: <ZapIcon fontSize={24} gradient={value === 'fast'} />,
              },
              {
                label: t('secure'),
                value: 'secure',
                icon: (
                  <ShieldIcon
                    color={value === 'secure' ? 'primary' : undefined}
                    fontSize={24}
                  />
                ),
              },
            ]}
            disabled={isPlaying}
            value={value}
            onChange={newValue => {
              if (isPlaying) return
              onPlay()
              setValue(newValue)
            }}
          />
          <DescriptionWrapper>
            <VStack
              alignItems="center"
              justifyContent="center"
              style={{ height: 50 }}
            >
              <Match
                value={value}
                fast={() => (
                  <GradientText as="span" size={15} weight="500">
                    {t(`vault_setup_prop.fast.title`)}
                  </GradientText>
                )}
                secure={() => (
                  <Text as="span" color="primary" size={15} weight="500">
                    {t(`vault_setup_prop.secure.title`)}
                  </Text>
                )}
              />
            </VStack>
            <DescriptionContentWrapper gap={8}>
              {getVaultSecurityProperties(value, t).map(prop => (
                <HStack key={prop} alignItems="center" gap={6}>
                  <CheckIcon color="primary" fontSize={24} />
                  <Text color="contrast" size={14} weight="500">
                    {prop}
                  </Text>
                </HStack>
              ))}
            </DescriptionContentWrapper>
          </DescriptionWrapper>
        </VStack>
      </PageContent>
      <PageFooter alignItems="center">
        <VStack maxWidth={576} fullWidth>
          <Button onClick={handleStart}>{t('next')}</Button>
        </VStack>
      </PageFooter>
    </>
  )
}
