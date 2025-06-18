import styled, { css } from 'styled-components'

import { takeWholeSpace } from './takeWholeSpace'

const takeWholeSpaceAbsolutely = css`
  position: absolute;
  left: 0;
  top: 0;
  ${takeWholeSpace};
`

export const TakeWholeSpaceAbsolutely = styled.div`
  ${takeWholeSpaceAbsolutely};
`
