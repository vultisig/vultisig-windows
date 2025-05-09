import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { HStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import styled from 'styled-components'

export const PageHeaderIconButtons = styled(HStack)`
  gap: ${toSizeUnit(pageConfig.header.iconButton.offset * 2)};
  align-items: center;
`
