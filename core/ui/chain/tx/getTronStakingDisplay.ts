import { Chain } from '@vultisig/core-chain/Chain'
import { TronResourceType } from '@vultisig/core-chain/chains/tron/resources'

type TronStakingOperation = 'freeze' | 'unfreeze'

type TronStakingDisplay = {
  operation: TronStakingOperation
  resource: TronResourceType
}

/** Amount heading each staking operation replaces "You're sending" / "Sent" with. */
export const tronStakingTitleKey = {
  freeze: 'tron_freeze_verify_title',
  unfreeze: 'tron_unfreeze_verify_title',
} as const satisfies Record<TronStakingOperation, string>

const operationByMemoPrefix: Record<string, TronStakingOperation> = {
  FREEZE: 'freeze',
  UNFREEZE: 'unfreeze',
}

const resourceByMemoSuffix: Record<string, TronResourceType> = {
  BANDWIDTH: 'BANDWIDTH',
  ENERGY: 'ENERGY',
}

const stakingMemo = /^([A-Z]+):([A-Z]+)$/

type GetTronStakingDisplayInput = {
  chain: Chain
  memo: string | undefined
}

/**
 * TRON Stake 2.0 rides through the regular transfer payload and carries its
 * operation only as an internal `FREEZE:<resource>` / `UNFREEZE:<resource>`
 * memo, which the signer turns into a FreezeBalanceV2 / UnfreezeBalanceV2
 * contract — the memo itself never reaches the chain. Recognizing it lets the
 * verify screens name the operation and surface the frozen resource the same
 * way the initiating device does, instead of leaking the raw marker as a memo.
 *
 * The match mirrors the signer's dispatch (memo prefix plus a valid resource)
 * so the screen can never describe something other than what gets signed.
 */
export const getTronStakingDisplay = ({
  chain,
  memo,
}: GetTronStakingDisplayInput): TronStakingDisplay | undefined => {
  if (chain !== Chain.Tron || !memo) return undefined

  const match = stakingMemo.exec(memo)
  if (!match) return undefined

  const [, prefix, suffix] = match
  const operation = operationByMemoPrefix[prefix]
  const resource = resourceByMemoSuffix[suffix]

  if (!operation || !resource) return undefined

  return { operation, resource }
}
