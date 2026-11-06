import {
  decodeRevokeInstruction,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { EvmChain, OtherChain } from '@vultisig/core-chain/Chain'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import {
  decodeFunctionData,
  erc20Abi,
  Hex,
  isAddress,
  isAddressEqual,
  isHex,
} from 'viem'

import { permit2Abi, permit2Address } from './permit2'
import { RevokeIntent } from './RevokeIntent'

const evmChains = Object.values(EvmChain)
const tokenPrograms = [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID]

type ReadEvmRevokeInput = {
  chain: EvmChain
  owner: string
  toAddress: string
  calldata: Hex
}

const readEvmRevoke = ({
  chain,
  owner,
  toAddress,
  calldata,
}: ReadEvmRevokeInput): RevokeIntent | null => {
  try {
    const approve = decodeFunctionData({ abi: erc20Abi, data: calldata })
    return approve.functionName === 'approve' && approve.args[1] === 0n
      ? {
          kind: 'erc20',
          chain,
          owner,
          token: toAddress,
          spender: approve.args[0],
        }
      : null
  } catch {
    // Not ERC-20 calldata; try Permit2 below.
  }

  try {
    const lockdown = decodeFunctionData({ abi: permit2Abi, data: calldata })
    if (
      lockdown.functionName !== 'lockdown' ||
      lockdown.args[0].length !== 1 ||
      !isAddress(toAddress) ||
      !isAddressEqual(toAddress, permit2Address)
    ) {
      return null
    }
    const [{ token, spender }] = lockdown.args[0]
    return { kind: 'permit2', chain, owner, token, spender }
  } catch {
    return null
  }
}

type ReadSplRevokeInput = {
  owner: string
  rawTransaction: string
}

const readSplRevoke = ({
  owner,
  rawTransaction,
}: ReadSplRevokeInput): RevokeIntent | null => {
  try {
    const { message } = VersionedTransaction.deserialize(
      Buffer.from(rawTransaction, 'base64')
    )
    const feePayer = message.staticAccountKeys[0]
    if (
      message.header.numRequiredSignatures !== 1 ||
      message.compiledInstructions.length !== 1 ||
      message.addressTableLookups.length !== 0 ||
      feePayer?.toBase58() !== owner
    ) {
      return null
    }

    const [instruction] = TransactionMessage.decompile(message).instructions
    const programId = tokenPrograms.find(program =>
      program.equals(instruction.programId)
    )
    if (!programId) {
      return null
    }

    const { keys } = decodeRevokeInstruction(instruction, programId)
    return keys.owner.pubkey.toBase58() === owner &&
      keys.multiSigners.length === 0
      ? {
          kind: 'splDelegate',
          chain: OtherChain.Solana,
          owner,
          tokenAccount: keys.account.pubkey.toBase58(),
        }
      : null
  } catch {
    return null
  }
}

/**
 * Reads a payload built by the Revoke flow back from the bytes it signs, so
 * the screens around it show what will actually be signed. Returns null for
 * anything that is not exactly one zero-value revoke by the payload's own
 * account, including a payload that also carries an approve, swap or
 * contract call, which the signer would sign as extra transactions.
 */
export const readRevokeKeysignPayload = ({
  coin,
  memo,
  toAddress,
  toAmount,
  signData,
  erc20ApprovePayload,
  swapPayload,
  contractPayload,
}: KeysignPayload): RevokeIntent | null => {
  if (
    !coin ||
    erc20ApprovePayload ||
    swapPayload.case !== undefined ||
    contractPayload.case !== undefined
  ) {
    return null
  }

  if (isOneOf(coin.chain, evmChains)) {
    // A revoke moves no value; anything but an explicit zero is rejected.
    if (!memo || !isHex(memo) || !['', '0'].includes(toAmount)) {
      return null
    }
    return readEvmRevoke({
      chain: coin.chain,
      owner: coin.address,
      toAddress,
      calldata: memo,
    })
  }

  if (
    coin.chain === OtherChain.Solana &&
    signData.case === 'signSolana' &&
    signData.value.rawTransactions.length === 1
  ) {
    return readSplRevoke({
      owner: coin.address,
      rawTransaction: signData.value.rawTransactions[0],
    })
  }

  return null
}
