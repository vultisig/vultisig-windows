import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  TokenError,
} from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import { TW } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { Coin, CoinKey } from '@vultisig/core-chain/coin/Coin'
import { rootApiUrl } from '@vultisig/core-config'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

import { SolanaTxData } from '../../types/types'
import { accountKeyAt } from '../../utils'

const senderAccountIndex = 0
const receiverAccountIndex = 2
const ataOwnerAccountIndex = 2

const debugPrefix = '[parseTokenInstruction]'

type FindAtaRecipientInput = {
  tx: TW.Solana.Proto.RawMessage.IMessageLegacy
  keys: PublicKey[]
}

/**
 * Finds the wallet an associated-token-account creation instruction opens an
 * account for, which is the recipient when the destination token account does
 * not exist on chain yet. Account indices are read against the merged
 * static-plus-lookup key list, so a v0 transaction that loads the recipient
 * from an address lookup table resolves to the right account instead of
 * whatever happens to sit at that index among the static keys.
 */
export const findAtaRecipient = ({
  tx,
  keys,
}: FindAtaRecipientInput): PublicKey | undefined => {
  const ataInstruction = (tx.instructions ?? []).find(
    instruction =>
      accountKeyAt(keys, shouldBePresent(instruction.programId)).toBase58() ===
      ASSOCIATED_TOKEN_PROGRAM_ID.toBase58()
  )

  if (!ataInstruction) {
    return undefined
  }

  const accounts = shouldBePresent(
    ataInstruction.accounts,
    'ataInstruction.accounts'
  )

  return accountKeyAt(keys, shouldBePresent(accounts[ataOwnerAccountIndex]))
}

type Input = {
  tx: TW.Solana.Proto.RawMessage.IMessageLegacy
  instruction: TW.Solana.Proto.RawMessage.IInstruction
  keys: PublicKey[]
  getCoin: (coinKey: CoinKey) => Promise<Coin>
}

/**
 * Parses an SPL token transfer into the approval view's transfer shape. The
 * ATA fallback runs only when the destination token account genuinely does not
 * exist yet; any other failure propagates, so a transient RPC error can never
 * be presented to the user as a recipient address.
 */
export const parseTokenInstruction = async ({
  tx,
  instruction,
  keys,
  getCoin,
}: Input): Promise<SolanaTxData> => {
  const accounts = shouldBePresent(instruction.accounts, 'instruction.accounts')

  const connection = new Connection(`${rootApiUrl}/solana/`)
  const senderTokenAccountInfo = await getAccount(
    connection,
    accountKeyAt(keys, shouldBePresent(accounts[senderAccountIndex]))
  )

  let recipient: string
  try {
    const receiverTokenAccountInfo = await getAccount(
      connection,
      accountKeyAt(keys, shouldBePresent(accounts[receiverAccountIndex]))
    )
    recipient = receiverTokenAccountInfo.owner.toBase58()
  } catch (error) {
    if (!(error instanceof TokenError)) {
      throw error
    }

    console.warn(
      debugPrefix,
      'receiver token account not found. Checking for ATA...'
    )

    const ataRecipient = findAtaRecipient({ tx, keys })
    if (!ataRecipient) {
      console.warn(debugPrefix, 'no ATA instruction found in tx.instructions')
      throw new Error(
        'Unable to determine recipient address. No direct token account or ATA instruction found.'
      )
    }

    recipient = ataRecipient.toBase58()
  }

  const programData = shouldBePresent(
    instruction.programData,
    'instruction.programData'
  )
  const amountBytes = programData.slice(1, 9)

  const amount = new DataView(Uint8Array.from(amountBytes).buffer).getBigUint64(
    0,
    true
  )
  const inputCoin = await getCoin({
    chain: Chain.Solana,
    id: senderTokenAccountInfo.mint.toBase58(),
  })

  return {
    transfer: {
      authority: senderTokenAccountInfo.owner.toBase58(),
      inAmount: amount.toString(),
      receiverAddress: recipient,
      inputCoin,
    },
  }
}
