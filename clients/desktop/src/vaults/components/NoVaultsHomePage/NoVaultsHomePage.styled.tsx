import styled from 'styled-components'

<<<<<<< Updated upstream
import { PageContent } from '../../../ui/page/PageContent'
=======
import { AnimatedVisibility } from '../../../lib/ui/layout/AnimatedVisibility'
import { VStack } from '../../../lib/ui/layout/Stack'
import { getColor } from '../../../lib/ui/theme/getters'
>>>>>>> Stashed changes

export const Wrapper = styled(PageContent)`
  overflow-y: hidden;
`

export const HorizontalLine = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${getColor('foregroundSuper')};
`
