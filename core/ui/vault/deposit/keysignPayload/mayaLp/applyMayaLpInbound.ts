import { create } from '@bufbuild/protobuf'
import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

import {
  getMayaLpChainCode,
  getMayaLpPool,
  mayaLpChains,
} from '../../mayaLp/config'
import { getOpenMayaLpInbound } from '../../mayaLp/inbound'

type ApplyMayaLpInboundInput = {
  coin: AccountCoin
  pool: string
  amountUnits: string | undefined
  keysignPayload: KeysignPayload
}

/**
 * Checks MayaChain takes the LP add on the pool's chain. The CACAO side stays
 * a MsgDeposit; the asset side is addressed to its chain's inbound vault.
 */
export const applyMayaLpInbound = async ({
  coin,
  pool,
  amountUnits,
  keysignPayload,
}: ApplyMayaLpInboundInput): Promise<KeysignPayload> => {
  const { chain } = coin

  if (chain === Chain.MayaChain) {
    const [chainCode] = pool.split('.')
    await getOpenMayaLpInbound({
      chainCode: shouldBePresent(chainCode, 'Pool chain'),
    })
    return keysignPayload
  }

  if (!isOneOf(chain, mayaLpChains)) {
    throw new Error(`${chain} cannot fund a MayaChain LP`)
  }
  // The memo names the pool; the funds go to this chain's inbound. They must
  // agree, or the deposit lands in the wrong pool or nowhere.
  if (pool !== getMayaLpPool(chain)) {
    throw new Error(`${pool} is not the MayaChain pool of ${chain}`)
  }

  const inbound = shouldBePresent(
    await getOpenMayaLpInbound({
      chainCode: getMayaLpChainCode(chain),
      amount: {
        units: BigInt(shouldBePresent(amountUnits, 'Amount')),
        decimals: coin.decimals,
      },
    }),
    `MayaChain inbound address for ${chain}`
  )

  return create(KeysignPayloadSchema, {
    ...keysignPayload,
    toAddress: inbound.address,
  })
}
