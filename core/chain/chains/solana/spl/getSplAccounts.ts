import { Address } from '@solana/web3.js'

import { getSolanaClient } from '../client'

const SPL_TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'

export const getSplAccounts = async (address: string) => {
  const client = getSolanaClient()
  const programs = [SPL_TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID]

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
