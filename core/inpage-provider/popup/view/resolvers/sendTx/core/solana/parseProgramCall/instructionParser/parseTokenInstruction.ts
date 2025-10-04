import { Chain } from '@core/chain/Chain'
import { Coin, CoinKey } from '@core/chain/coin/Coin'
import { rootApiUrl } from '@core/config'
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAccount } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import { TW } from '@trustwallet/wallet-core'

import { SolanaTxData } from '../../types/types'

type Input = {
  tx: TW.Solana.Proto.RawMessage.IMessageLegacy
  instruction: TW.Solana.Proto.RawMessage.IInstruction
  keys: PublicKey[]
  getCoin: (coinKey: CoinKey) => Promise<Coin>
}
export const parseTokenInstruction = async ({
  tx,
  instruction,
  keys,
  getCoin,
}: Input): Promise<SolanaTxData> => {
  const debugPrefix = '[parseTokenInstruction]'
  if (
    !instruction.accounts ||
    instruction.accounts.length !== 3 ||
    !tx.instructions ||
    !tx.accountKeys
  )
    throw new Error('invalid token instruction')
  const connection = new Connection(`${rootApiUrl}/solana/`)
  const senderTokenAccountInfo = await getAccount(
    connection,
    keys[instruction.accounts[0]]
  )

  let recipient: string
  try {
    // Try fetching receiver account
    const receiverTokenAccountInfo = await getAccount(
      connection,
      keys[instruction.accounts[1]]
    )
    recipient = receiverTokenAccountInfo.owner.toString()
  } catch {
    console.warn(
      debugPrefix,
      'receiver token account not found. Checking for ATA...'
    )
    const ataInstruction = tx.instructions.find(
      instr =>
        tx.accountKeys![instr.programId!] ===
        ASSOCIATED_TOKEN_PROGRAM_ID.toBase58()
    )
    if (ataInstruction) {
      // The recipient should be in the ATA instruction's keys[0] (payer) or keys[2] (owner)
      if (!ataInstruction.accounts) {
        throw new Error('ATA instruction accounts are missing.')
      }
      recipient = tx.accountKeys[ataInstruction.accounts[2]]
    } else {
      console.warn(debugPrefix, 'no ATA instruction found in tx.instructions')
      throw new Error(
        'Unable to determine recipient address. No direct token account or ATA instruction found.'
      )
    }
  }
  if (!instruction.programData) {
    throw new Error('Program data is missing.')
  }
  const amountBytes = instruction.programData.slice(1, 9)

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
