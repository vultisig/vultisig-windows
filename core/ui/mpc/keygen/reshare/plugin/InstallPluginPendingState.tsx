import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { FC } from 'react'
import styled from 'styled-components'

import { usePluginInstallAnimation } from './PluginInstallAnimationProvider'

export const InstallPluginPendingState: FC = () => {
  const context = usePluginInstallAnimation()

  if (!context || !context.currentStep) {
    return null
  }

  const { animationComponent: AnimationComponent } = context

  return (
    <PageContent
      alignItems="center"
      gap={16}
      justifyContent="center"
      scrollable
    >
      <AnimationArea>
        <AnimationWrapper>
          <AnimationComponent />
        </AnimationWrapper>
      </AnimationArea>
    </PageContent>
  )
}

const AnimationArea = styled(VStack)`
  flex: 1;
  min-height: 0;
  align-items: center;
  justify-content: center;
  width: 100%;
`

const AnimationWrapper = styled.div`
  width: 100%;
  height: 100%;
  max-width: 880px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  min-height: 0;

  canvas,
  img,
  video {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain;
  }
`
