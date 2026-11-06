import {
  getMint,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  unpackAccount,
} from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { OtherChain } from '@vultisig/core-chain/Chain'
import { getSolanaClient } from '@vultisig/core-chain/chains/solana/client'
import { getJupiterTokens } from '@vultisig/core-chain/coin/jupiter/api'
import { withoutDuplicates } from '@vultisig/lib-utils/array/withoutDuplicates'

import { concurrentRequests, mapInBatches } from './mapInBatches'
import { shortenAddress } from './shortenAddress'
import { SplDelegateApproval } from './TokenApproval'

type GetSplDelegateApprovalsInput = {
  owner: string
}

const tokenPrograms = [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID]

/**
 * Lists the owner's token accounts, under both SPL token programs, that have
 * a delegate with an amount left to move.
 */
export const getSplDelegateApprovals = async ({
  owner,
}: GetSplDelegateApprovalsInput): Promise<SplDelegateApproval[]> => {
  const connection = getSolanaClient()
  const ownerKey = new PublicKey(owner)

  const delegated = (
    await Promise.all(
      tokenPrograms.map(async programId => {
        const { value } = await connection.getTokenAccountsByOwner(ownerKey, {
          programId,
        })
        return value.map(({ pubkey, account }) => ({
          account: unpackAccount(pubkey, account, programId),
          programId,
        }))
      })
    )
  )
    .flat()
    .flatMap(({ account, programId }) =>
      account.delegate && account.delegatedAmount > 0n
        ? [{ account, delegate: account.delegate, programId }]
        : []
    )

  if (delegated.length === 0) {
    return []
  }

  const mints = [
    ...new Set(delegated.map(({ account }) => account.mint.toBase58())),
  ]
  const jupiterTokens = await getJupiterTokens(mints)

  // Mints Jupiter does not index are listed under their shortened address, decimals read once per mint.
  const unknownMints = withoutDuplicates(
    delegated
      .filter(({ account }) => !(account.mint.toBase58() in jupiterTokens))
      .map(({ account, programId }) => ({ mint: account.mint, programId })),
    (a, b) => a.mint.equals(b.mint)
  )
  const unknownMintDecimals = Object.fromEntries(
    await mapInBatches({
      items: unknownMints,
      batchSize: concurrentRequests,
      map: async ({ mint, programId }) => {
        const { decimals } = await getMint(
          connection,
          mint,
          undefined,
          programId
        )
        return [mint.toBase58(), decimals] as const
      },
    })
  )

  return delegated.map(({ account, delegate, programId }) => {
    const mint = account.mint.toBase58()
    const known = jupiterTokens[mint]

    return {
      kind: 'splDelegate',
      token: {
        chain: OtherChain.Solana,
        id: mint,
        ticker: known?.symbol ?? shortenAddress(mint),
        decimals: known?.decimals ?? unknownMintDecimals[mint],
        logo: known?.icon,
      },
      spender: delegate.toBase58(),
      allowance: account.delegatedAmount,
      tokenAccount: account.address.toBase58(),
      programId: programId.toBase58(),
    }
  })
}
