import * as RadixTabs from '@radix-ui/react-tabs'
import styled from 'styled-components'

import { vStack } from '../../layout/Stack'

export const TabsRoot = styled(RadixTabs.Root)`
  display: flex;
  flex-direction: column;
  flex: 1;

  & [role='tabpanel'][data-state='active'] {
    ${vStack({
      flexGrow: true,
    })};
  }
`
