import { useInterval } from 'react-use'
import styled from 'styled-components'

import { useStepNavigation } from '../../../../../lib/ui/hooks/useStepNavigation'
import { VStack } from '../../../../../lib/ui/layout/Stack'
import { PageContent } from '../../../../../ui/page/PageContent'
import { DynamicEducationContent } from './components/DynamicEducationalContent'
import { SlidesLoader } from './components/SlidesLoader'

const SLIDE_DURATION_IN_MS = 6000
const steps = [
  'multiFactor',
  'selfCustodial',
  'crossChain',
  'availablePlatforms',
  'seedlessWallet',
] as const

export type SetupFastVaultEducationSlidesStep = (typeof steps)[number]

export const SetupVaultEducationSlides = () => {
  const { step, toNextStep } = useStepNavigation({ steps, circular: true })
  useInterval(() => toNextStep(), SLIDE_DURATION_IN_MS)

  return (
    <PageContent>
      <Wrapper
        flexGrow
        alignItems="center"
        justifyContent="space-between"
        gap={48}
      >
        <VStack flexGrow justifyContent="center">
          <DynamicEducationContent value={step} />
        </VStack>
        <SlidesLoader />
      </Wrapper>
    </PageContent>
  )
}

const Wrapper = styled(VStack)`
  width: 550px;
  align-self: center;
`
