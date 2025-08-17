import { BackgroundResolver } from '@core/inpage-provider/background/resolver'

import { authorizedDapp } from '../middleware/authorizedDapp'

export const getAppSession: BackgroundResolver<'getAppSession'> =
  authorizedDapp(async ({ context: { appSession } }) => appSession)
