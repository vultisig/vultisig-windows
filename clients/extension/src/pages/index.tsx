import { AppProviders } from '@clients/extension/src/providers/AppProviders'
import { ActiveRoute } from '@lib/ui/navigation/state'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import { routes } from '../navigation/router'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <ActiveRoute routes={routes} />
    </AppProviders>
  </StrictMode>
)
