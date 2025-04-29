import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useVaultSecurityType } from '@core/ui/vault/state/vaultSecurityType'
import { getVaultSecurityProperties } from '@core/ui/vault/VaultSecurityType'
import { Match } from '@lib/ui/base/Match'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { LightningGradientIcon } from '@lib/ui/icons/LightningGradientIcon'
import { LightningIcon } from '@lib/ui/icons/LightningIcon'
import { ShieldIcon } from '@lib/ui/icons/ShieldIcon'
import { ToggleSwitch } from '@lib/ui/inputs/toggle-switch/ToggleSwitch'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { GradientText, Text } from '@lib/ui/text'
import { match } from '@lib/utils/match'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { useSetupVaultPageAnimation } from './hooks/useSetupVaultPageAnimation'
import {
  ArtContainer,
  ConfirmButton,
  ContentWrapper,
  DescriptionContentWrapper,
  DescriptionTitleWrapper,
  DescriptionWrapper,
  IconWrapper,
} from './SetupVaultPage.styled'

export const SetupVaultPage = () => {
  const { RiveComponent, isPlaying, onPlay } = useSetupVaultPageAnimation()
  const { t } = useTranslation()
  const [value, setValue] = useVaultSecurityType()
  const navigate = useCoreNavigate()
  const theme = useTheme()

  const onStart = useCallback(() => {
    navigate(
      match(value, {
        fast: () => 'setupFastVault',
        secure: () => 'setupSecureVault',
      })
    )
  }, [navigate, value])

  return (
    <VStack
      style={{
        minHeight: '100%',
      }}
    >
      <PageHeader
        title={<PageHeaderTitle>{t('chooseSetup')}</PageHeaderTitle>}
        primaryControls={<PageHeaderBackButton />}
      />
      <PageContent flexGrow as="form" onSubmit={onStart}>
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
          <ConfirmButton type="submit">{t('next')}</ConfirmButton>
        </ContentWrapper>
      </PageContent>
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
