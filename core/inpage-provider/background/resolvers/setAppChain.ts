import {
  AppSession,
  updateAppSession,
} from '@core/extension/storage/appSessions'
import { setCurrentCosmosChainId } from '@core/extension/storage/currentCosmosChainId'
import { setCurrentEVMChainId } from '@core/extension/storage/currentEvmChainId'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { getCosmosChainId } from '@vultisig/core-chain/chains/cosmos/chainInfo'
import { getEvmChainId } from '@vultisig/core-chain/chains/evm/chainInfo'
import { match } from '@vultisig/lib-utils/match'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { assertField } from '@vultisig/lib-utils/record/assertField'
import { getRecordUnionKey } from '@vultisig/lib-utils/record/union/getRecordUnionKey'

import { ActiveChainKind } from '../../chain'
import { SetAppChainInput } from '../interface'

export const setAppChain: BackgroundResolver<'setAppChain'> = async ({
  context,
  input,
}) => {
  const appSession = assertField(context, 'appSession')
  const { vaultId, host } = appSession
  const chainKind = getRecordUnionKey(input)

  const chainId = matchRecordUnion<SetAppChainInput, string>(input, {
    cosmos: getCosmosChainId,
    evm: getEvmChainId,
  })

  await match(chainKind, {
    cosmos: () => setCurrentCosmosChainId(chainId),
    evm: () => setCurrentEVMChainId(chainId),
  })

  await updateAppSession({
    vaultId,
    host,
    fields: match<ActiveChainKind, Partial<AppSession>>(chainKind, {
      cosmos: () => ({ selectedCosmosChainId: chainId }),
      evm: () => ({ selectedEVMChainId: chainId }),
    }),
  })
}
