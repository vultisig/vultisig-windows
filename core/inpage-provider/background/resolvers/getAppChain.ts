import { ChainOfKind } from '@core/chain/ChainKind'
import { getCosmosChainByChainId } from '@core/chain/chains/cosmos/chainInfo'
import { getEvmChainByChainId } from '@core/chain/chains/evm/chainInfo'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'

import { getAppChainId } from './getAppChainId'

export const getAppChain: BackgroundResolver<'getAppChain'> = async ({
  context,
  input: { chainKind },
}) => {
  const appChainId = await getAppChainId({ context, input: { chainKind } })

  const chain = match(chainKind, {
    evm: () => getEvmChainByChainId(appChainId),
    cosmos: () => getCosmosChainByChainId(appChainId),
  })

  return shouldBePresent(chain) as ChainOfKind<typeof chainKind>
}
