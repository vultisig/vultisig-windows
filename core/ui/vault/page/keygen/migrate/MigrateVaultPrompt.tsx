import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { hStack, VStack } from '@lib/ui/layout/Stack'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useRive } from '@rive-app/react-canvas'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const MigrateVaultPrompt = () => {
  const [isOpen, { toggle }] = useBoolean(true)

  const { RiveComponent } = useRive({
    src: '/core/animations/upgrade_animation.riv',
    autoplay: true,
  })

  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  if (!isOpen) return null

  return (
    <Container onClick={() => navigate({ id: 'migrateVault' })}>
      <VStack gap={16}>
        <VStack gap={2}>
          <Text size={12} color="shy">
            {t('sign_faster')}
          </Text>
          <Text size={14}>{t('upgrade_now_prompt')}</Text>
        </VStack>
        <MigrateButton kind="secondary">{t('upgrade_now')}</MigrateButton>
      </VStack>

      <LightingBackground />
      <AnimationWrapper>
        <RiveComponent />
      </AnimationWrapper>
      <CloseButton
        onClick={e => {
          e.stopPropagation()

          toggle()
        }}
        kind="action"
      >
        <CrossIcon />
      </CloseButton>
    </Container>
  )
}

const Container = styled(UnstyledButton)`
  padding: 24px;
  border-radius: 12px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};
  width: 350px;
  position: relative;
  overflow: hidden;

  ${hStack({
    justifyContent: 'space-between',
  })};

  @media ${mediaQuery.tabletDeviceAndUp} {
    width: 450px;
  }
`

const MigrateButton = styled(Button)`
  background-color: ${getColor('primary')};
  color: ${getColor('background')};

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.primary.withAlpha(0.7).toCssValue()};
  }
`

const CloseButton = styled(IconButton)`
  display: flex;
  width: 40px;
  height: 40px;
  padding: 12px;
  justify-content: center;
  align-items: center;
  border-radius: 77px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);

  position: absolute;
  right: -7px;
  top: 8px;
`

const AnimationWrapper = styled.div`
  width: 226.121px;
  height: 232px;
  aspect-ratio: 226.12/232;

  position: absolute;
  right: -73.121px;
  bottom: -80px;

  mix-blend-mode: screen;
`

const LightingBackground = styled.div`
  width: 350px;
  height: 350px;
  position: absolute;
  right: -96px;
  bottom: -157px;
  border-radius: 350px;
  opacity: 0.7;
  background: radial-gradient(
    50% 50% at 50% 50%,
    rgba(4, 57, 199, 0.7) 0%,
    rgba(2, 18, 43, 0) 100%
  );
  filter: blur(36.97182846069336px);
`
