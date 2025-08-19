import { getCurrentCosmosChainId } from '@core/extension/storage/currentCosmosChainId'
import { getCurrentEVMChainId } from '@core/extension/storage/currentEvmChainId'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { match } from '@lib/utils/match'

import { getAppSession } from '../core/appSession'

export const getAppChainId: BackgroundResolver<'getAppChainId'> = async ({
  context,
  input: { chainKind },
}) => {
  const appSession = await getAppSession(context.requestOrigin)

  if (appSession) {
    const appChainId = match(chainKind, {
      cosmos: () => appSession.selectedCosmosChainId,
      evm: () => appSession.selectedEVMChainId,
    })

    if (appChainId) {
      return appChainId
    }
  }

  return match(chainKind, {
    cosmos: () => getCurrentCosmosChainId(),
    evm: () => getCurrentEVMChainId(),
  })
}
