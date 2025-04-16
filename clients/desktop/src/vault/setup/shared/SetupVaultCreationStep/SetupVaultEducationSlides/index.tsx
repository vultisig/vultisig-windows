import { KeygenStep } from '@core/mpc/keygen/KeygenStep'
import { CreateVaultDynamicEducationContent } from '@core/ui/mpc/keygen/create/education/CreateVaultDynamicEducationalContent'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { ValueProp } from '@lib/ui/props'
import styled from 'styled-components'

import { SlidesLoader } from './components/SlidesLoader'

export const SetupVaultEducationSlides = ({
  value,
}: ValueProp<KeygenStep | null>) => {
  return (
    <PageContent>
      <Wrapper
        flexGrow
        alignItems="center"
        justifyContent="space-between"
        gap={48}
      >
        <VStack flexGrow justifyContent="center">
          <CreateVaultDynamicEducationContent />
        </VStack>
        <SlidesLoader value={value} />
      </Wrapper>
    </PageContent>
  )
}

const Wrapper = styled(VStack)`
  width: 550px;
  align-self: center;
`
