import { useRiveLoadingAnimation } from '@core/ui/animations/useRiveLoadingAnimation'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect } from 'react'
import styled from 'styled-components'

const StationKeygenAnimationPreview = () => {
  const { RiveComponent, containerRef, setConnected, setProgress } =
    useRiveLoadingAnimation({
      src: '/core/animations/station-keygen-fast.riv',
      initialConnected: false,
    })

  useEffect(() => {
    const connectingTimeout = window.setTimeout(() => {
      setConnected(true)
      setProgress(55)
    }, 2500)

    return () => window.clearTimeout(connectingTimeout)
  }, [setConnected, setProgress])

  return (
    <AnimationContainer ref={containerRef}>
      <RiveComponent style={{ width: '100%', height: '100%' }} />
    </AnimationContainer>
  )
}

const meta: Meta<typeof StationKeygenAnimationPreview> = {
  title: 'Screens/Keygen/StationKeygenAnimation',
  component: StationKeygenAnimationPreview,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<typeof StationKeygenAnimationPreview>

export const Preview: Story = {}

const AnimationContainer = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`
