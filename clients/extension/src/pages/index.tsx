import { AppProviders } from '@clients/extension/src/providers/AppProviders'
import { ActiveView } from '@lib/ui/navigation/ActiveView'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import { views } from '../navigation/views'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <ActiveView views={views} />
    </AppProviders>
  </StrictMode>
)
