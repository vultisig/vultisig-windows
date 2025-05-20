import { AppProviders } from '@clients/extension/src/providers/AppProviders'
import { VStack } from '@lib/ui/layout/Stack'
import { ActiveView } from '@lib/ui/navigation/ActiveView'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import { views } from '../navigation/views'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <VStack fullSize>
        <ActiveView views={views} />
      </VStack>
    </AppProviders>
  </StrictMode>
)
