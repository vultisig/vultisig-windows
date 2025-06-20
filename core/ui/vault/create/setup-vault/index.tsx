import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useSetupVaultPageAnimation } from '@core/ui/vault/create/setup-vault/hooks/useSetupVaultPageAnimation'
import {
  ArtContainer,
  ContentWrapper,
  DescriptionContentWrapper,
  DescriptionTitleWrapper,
  DescriptionWrapper,
  IconWrapper,
} from '@core/ui/vault/create/setup-vault/SetupVaultPage.styled'
import { useVaultSecurityType } from '@core/ui/vault/state/vaultSecurityType'
import { getVaultSecurityProperties } from '@core/ui/vault/VaultSecurityType'
import { Match } from '@lib/ui/base/Match'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { LightningGradientIcon } from '@lib/ui/icons/LightningGradientIcon'
import { LightningIcon } from '@lib/ui/icons/LightningIcon'
import { ShieldIcon } from '@lib/ui/icons/ShieldIcon'
import { ToggleSwitch } from '@lib/ui/inputs/toggle-switch/ToggleSwitch'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { GradientText, Text } from '@lib/ui/text'
import { match } from '@lib/utils/match'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

export const SetupVaultPage = () => {
  const { RiveComponent, isPlaying, onPlay } = useSetupVaultPageAnimation()
  const { t } = useTranslation()
  const [value, setValue] = useVaultSecurityType()
  const navigate = useCoreNavigate()
  const theme = useTheme()

  const onStart = useCallback(() => {
    match(value, {
      fast: () => navigate({ id: 'setupFastVault' }),
      secure: () => navigate({ id: 'setupSecureVault' }),
    })
  }, [navigate, value])

  return (
    <VStack as="form" {...getFormProps({ onSubmit: onStart })} fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('chooseSetup')}
        hasBorder
      />
      <PageContent flexGrow>
        <ContentWrapper alignItems="center" gap={20} flexGrow>
          <ArtContainer data-testid="SetupVaultPage-ArtContainer">
            <RiveComponent />
          </ArtContainer>
          <div
            style={{
              alignSelf: 'stretch',
            }}
          >
            <ToggleSwitch
              options={[
                {
                  disabled: value === 'fast',
                  label: t('fast'),
                  value: 'fast',
                  icon: match(value, {
                    fast: () => (
                      <LightningGradientIconWrapper>
                        <LightningGradientIcon />
                      </LightningGradientIconWrapper>
                    ),
                    secure: () => (
                      <LightningIconWrapper>
                        <LightningIcon
                          color={theme.colors.contrast.toCssValue()}
                        />
                      </LightningIconWrapper>
                    ),
                  }),
                },
                {
                  disabled: value == 'secure',
                  label: t('secure'),
                  value: 'secure',
                  icon: (
                    <VStack
                      alignItems="center"
                      style={{
                        fontSize: '24px',
                        color:
                          value === 'fast'
                            ? theme.colors.contrast.toCssValue()
                            : theme.colors.success.toCssValue(),
                      }}
                    >
                      <ShieldIcon />
                    </VStack>
                  ),
                },
              ]}
              disabled={isPlaying}
              selected={value}
              onChange={newValue => {
                if (isPlaying) return
                onPlay()
                setValue(newValue)
              }}
            />
          </div>
          <DescriptionWrapper alignItems="flex-start">
            <DescriptionTitleWrapper>
              <Match
                value={value}
                fast={() => (
                  <GradientText weight={500}>
                    {t(`vault_setup_prop.fast.title`)}
                  </GradientText>
                )}
                secure={() => (
                  <Text color="primary" weight={500}>
                    {t(`vault_setup_prop.secure.title`)}
                  </Text>
                )}
              />
            </DescriptionTitleWrapper>
            <DescriptionContentWrapper>
              {getVaultSecurityProperties(value, t).map(prop => (
                <HStack key={prop} alignItems="center" gap={6}>
                  <IconWrapper>
                    <CheckIcon />
                  </IconWrapper>
                  <Text size={14} weight="600" color="contrast">
                    {prop}
                  </Text>
                </HStack>
              ))}
            </DescriptionContentWrapper>
          </DescriptionWrapper>
        </ContentWrapper>
      </PageContent>
      <PageFooter>
        <Button type="submit">{t('next')}</Button>
      </PageFooter>
    </VStack>
  )
}

const LightningGradientIconWrapper = styled.div`
  position: relative;
  font-size: 24px;
  margin-top: -1px;
`

const LightningIconWrapper = styled.div`
  font-size: 20px;
  margin-right: 3px;
`
