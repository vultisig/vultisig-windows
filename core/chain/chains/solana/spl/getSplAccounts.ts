import { Address } from '@solana/web3.js'

import { getSolanaClient } from '../client'
import { token2022ProgramId } from '../config'
import { splTokenProgramId } from '../config'

export const getSplAccounts = async (address: string) => {
  const client = getSolanaClient()
  const programs = [splTokenProgramId, token2022ProgramId]

  const responses = await Promise.all(
    programs.map(programId =>
      client
        .getTokenAccountsByOwner(
          address as Address,
          {
            programId: programId as Address,
          },
          {
            encoding: 'jsonParsed',
          }
        )
        .send()
    )
  )

  return responses.flatMap(response => response.value)
}
