import styled from 'styled-components'

import { borderRadius } from '../../../../../../../lib/ui/css/borderRadius'
import { ProgressLine } from '../../../../../../../lib/ui/flow/ProgressLine'
import { VStack } from '../../../../../../../lib/ui/layout/Stack'
import { Spinner } from '../../../../../../../lib/ui/loaders/Spinner'
import { getColor } from '../../../../../../../lib/ui/theme/getters'

export const Wrapper = styled(VStack)`
  overflow-y: hidden;
  position: relative;
  ${borderRadius.m};
  border: 1px solid ${getColor('foregroundExtra')};
  padding: 28px 36px;
  background-color: ${getColor('foreground')};
  gap: 24px;
  width: 100%;
`

export const Loader = styled(Spinner)`
  font-size: 20px;
`

export const ProgressBarWrapper = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
`

export const StyledProgressLine = styled(ProgressLine)`
  height: 4px;
`

export const IconWrapper = styled(VStack)`
  color: ${getColor('primary')};
`
