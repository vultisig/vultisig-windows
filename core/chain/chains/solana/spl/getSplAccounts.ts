import { PublicKey } from '@solana/web3.js'

import { getSolanaClient } from '../client'
import { splTokenProgramId, token2022ProgramId } from '../config'

export const getSplAccounts = async (address: string) => {
  const client = getSolanaClient()
  const programs = [splTokenProgramId, token2022ProgramId]

  const responses = await Promise.all(
    programs.map(programId =>
      client.getParsedTokenAccountsByOwner(new PublicKey(address), {
        programId: new PublicKey(programId),
      })
    )
  )

  return responses.flatMap(response => response.value)
}
