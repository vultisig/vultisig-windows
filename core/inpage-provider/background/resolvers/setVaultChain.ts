import { getCosmosChainId } from '@core/chain/chains/cosmos/chainInfo'
import { getEvmChainId } from '@core/chain/chains/evm/chainInfo'
import { setCurrentCosmosChainId } from '@core/extension/storage/currentCosmosChainId'
import { setCurrentEVMChainId } from '@core/extension/storage/currentEvmChainId'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { match } from '@lib/utils/match'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionKey } from '@lib/utils/record/union/getRecordUnionKey'

import { SetAppChainInput } from '../interface'

export const setVaultChain: BackgroundResolver<'setVaultChain'> = async ({
  input,
}) => {
  const chainKind = getRecordUnionKey(input)

  const chainId = matchRecordUnion<SetAppChainInput, string>(input, {
    cosmos: getCosmosChainId,
    evm: getEvmChainId,
  })

  await match(chainKind, {
    cosmos: () => setCurrentCosmosChainId(chainId),
    evm: () => setCurrentEVMChainId(chainId),
  })
}
