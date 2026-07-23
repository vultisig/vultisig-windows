import { getKeygenFlowSuccessAnimationSource } from '@core/ui/mpc/keygen/flow/getKeygenFlowSuccessAnimationSource'
import { currentProductBrand } from '@core/ui/product/brand'
import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { useRive } from '@rive-app/react-webgl2'
import { ReactNode } from 'react'
import styled from 'styled-components'

type KeygenFlowSuccessContentProps = {
  title: ReactNode
  securityType: VaultSecurityType
  /** `.riv` filename (no extension) to override the default keygen animation. */
  animationSource?: string
  /**
   * Center the animation + title as a compact group instead of letting the
   * animation fill the screen (used by reshare, where the checkmark is a small
   * contained illustration rather than a full-bleed keygen animation).
   */
  contained?: boolean
}

/** Renders the completion animation selected for the current vault type. */
export const KeygenFlowSuccessContent = ({
  title,
  securityType,
  animationSource,
  contained,
}: KeygenFlowSuccessContentProps) => {
  const resolvedAnimationSource =
    animationSource ??
    getKeygenFlowSuccessAnimationSource({
      productBrand: currentProductBrand,
      securityType,
    })

  const { RiveComponent } = useRive({
    src: `/core/animations/${resolvedAnimationSource}.riv`,
    stateMachines: 'State Machine 1',
    autoplay: true,
  })

  if (contained) {
    return (
      <Wrapper>
        <VStack flexGrow justifyContent="center" alignItems="center" gap={24}>
          <ContainedAnimation>
            <RiveComponent style={{ width: '100%', height: '100%' }} />
          </ContainedAnimation>
          <VStack alignItems="center" gap={12}>
            <Text centerHorizontally size={28}>
              {title}
            </Text>
            <Spinner size="3em" />
          </VStack>
        </VStack>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <VStack justifyContent="space-between" flexGrow>
        <RiveWrapper justifyContent="center">
          <RiveComponent
            style={{
              flex: 1,
            }}
          />
        </RiveWrapper>
        <VStack alignItems="center" gap={12}>
          <Text centerHorizontally size={32}>
            {title}
          </Text>
          <Spinner size="3em" />
        </VStack>
      </VStack>
    </Wrapper>
  )
}

const ContainedAnimation = styled.div`
  width: 100%;
  max-width: 320px;
  aspect-ratio: 1 / 1;
`

const RiveWrapper = styled(VStack)`
  position: relative;
  flex: 1;
`

const Wrapper = styled(PageContent)`
  margin-inline: auto;
  max-width: 800px;

  @media (${mediaQuery.tabletDeviceAndUp}) {
    margin-top: 48px;
  }
`
