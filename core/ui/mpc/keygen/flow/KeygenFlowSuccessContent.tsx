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
}

export const KeygenFlowSuccessContent = ({
  title,
  securityType,
}: KeygenFlowSuccessContentProps) => {
  const { RiveComponent } = useRive({
    src: `/core/animations/keygen-${securityType}.riv`,
    stateMachines: 'State Machine 1',
    autoplay: true,
  })

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
