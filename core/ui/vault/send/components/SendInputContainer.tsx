import { borderRadius } from '@lib/ui/css/borderRadius'
import { interactive } from '@lib/ui/css/interactive'
import { VStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const SendInputContainer = styled(VStack)`
  ${interactive};
  gap: 16px;
  padding: 12px;
  ${borderRadius.m};
  border: 1px solid ${getColor('foregroundSuper')};
`
