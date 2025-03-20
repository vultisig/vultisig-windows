import { ValueProp } from '@lib/ui/props'
import { toPercents } from '@lib/utils/toPercents'
import { FC } from 'react'
import styled from 'styled-components'

import { round } from '../css/round'
import { vStack } from '../layout/Stack'
import { getColor } from '../theme/getters'

const Container = styled.div`
  width: 100%;
  ${round};
  background: ${getColor('foreground')};
  height: 10px;
  overflow: hidden;
  ${vStack()};
`

const Filler = styled.div`
  height: 100%;
  background: linear-gradient(
    to right,
    ${getColor('primaryAlt')},
    ${getColor('primary')}
  );
`

type ProgressLineProps = ValueProp<number> & { className?: string }

export const ProgressLine: FC<ProgressLineProps> = ({ value, className }) => (
  <Container className={className}>
    <Filler style={{ width: toPercents(value) }} />
  </Container>
)
