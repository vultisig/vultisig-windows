import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { getThorchainInboundAddress } from '@vultisig/core-chain/chains/cosmos/thor/getThorchainInboundAddress'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'

const canNeedInboundCorroboration = (payload: KeysignPayload) =>
  !payload.signData.case &&
  !payload.contractPayload.case &&
  !payload.erc20ApprovePayload &&
  !payload.swapPayload.case &&
  !!payload.memo &&
  !!payload.toAddress &&
  getKeysignChain(payload) !== Chain.THORChain

export const useThorchainInboundAddresses = (payload: KeysignPayload) =>
  useQuery({
    queryKey: ['thorchain-inbound-addresses', 'signed-transaction-decoder'],
    queryFn: getThorchainInboundAddress,
    enabled: canNeedInboundCorroboration(payload),
    staleTime: 60_000,
  }).data
