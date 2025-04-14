import { getVaultSecurityProperties } from '@core/ui/vault/VaultSecurityType'
import { Match } from '@lib/ui/base/Match'
import { Button } from '@lib/ui/buttons/Button'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { LightningGradientIcon } from '@lib/ui/icons/LightningGradientIcon'
import { LightningIcon } from '@lib/ui/icons/LightningIcon'
import ShieldCheckIcon from '@lib/ui/icons/ShieldCheckIcon'
import { ToggleSwitch } from '@lib/ui/inputs/toggle-switch/ToggleSwitch'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { GradientText, Text } from '@lib/ui/text'
import { match } from '@lib/utils/match'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { PageContent } from '../../../../components/shared/Page/PageContent'
import { PageHeader } from '../../../../components/shared/Page/PageHeader'
import { PageHeaderBackButton } from '../../../../components/shared/Page/PageHeaderBackButton'
import { useAppNavigate } from '../../../../navigation/hooks/useAppNavigate'
import { useSetupVaultPageAnimation } from './hooks/useSetupVaultPageAnimation'
import {
  ArtContainer,
  ContentWrapper,
  DescriptionContentWrapper,
  DescriptionTitleWrapper,
  DescriptionWrapper,
  IconWrapper,
} from './SetupVaultPage.styled'
import { useVaultSecurityType } from './type/state/vaultSecurityType'

export const SetupVaultPage = () => {
  const { RiveComponent, stateMachineInput, isPlaying, onPlay } =
    useSetupVaultPageAnimation()
  const { t } = useTranslation()
  const [value, setValue] = useVaultSecurityType()
  const navigate = useAppNavigate()
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
        title={
          <Text color="contrast" size={16}>
            {t('chooseSetup')}
          </Text>
        }
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
                  disabled: value == 'secure',
                  label: 'Secure',
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
                      <ShieldCheckIcon />
                    </VStack>
                  ),
                },
                {
                  disabled: value == 'fast',
                  label: 'Fast',
                  value: 'fast',
                  icon:
                    value === 'fast' ? (
                      <LightningGradientIconWrapper>
                        <LightningGradientIcon />
                      </LightningGradientIconWrapper>
                    ) : (
                      <LightningIconWrapper>
                        <LightningIcon
                          color={theme.colors.contrast.toCssValue()}
                        />
                      </LightningIconWrapper>
                    ),
                },
              ]}
              disabled={isPlaying}
              selected={value}
              onChange={newValue => {
                if (isPlaying) return
                onPlay()
                setValue(newValue)
                stateMachineInput?.fire()
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
          <Button
            style={{
              alignSelf: 'stretch',
            }}
            type="submit"
          >
            {t('next')}
          </Button>
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
