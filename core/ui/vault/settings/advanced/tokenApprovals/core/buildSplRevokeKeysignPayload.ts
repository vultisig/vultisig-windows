import { create } from '@bufbuild/protobuf'
import { createRevokeInstruction } from '@solana/spl-token'
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import { OtherChain } from '@vultisig/core-chain/Chain'
import { getSolanaClient } from '@vultisig/core-chain/chains/solana/client'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { KeysignLibType } from '@vultisig/core-mpc/mpcLib'
import { toCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { SolanaSpecificSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { SignSolanaSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'

import { SplDelegateApproval } from './TokenApproval'

type BuildSplRevokeKeysignPayloadInput = {
  approval: SplDelegateApproval
  /** The vault's Solana address, which owns the token account and pays. */
  owner: string
  hexPublicKey: string
  vaultId: string
  localPartyId: string
  libType: KeysignLibType
}

/**
 * Keysign payload for an SPL `Revoke` on one token account: a single
 * instruction, signed and paid for by the owner, carried as a raw
 * transaction. Build it right before signing; it embeds a recent blockhash,
 * whose last valid block height rides along so the done screen can tell an
 * expired revoke from a pending one. No priority fee: the base fee only.
 */
export const buildSplRevokeKeysignPayload = async ({
  approval,
  owner,
  hexPublicKey,
  vaultId,
  localPartyId,
  libType,
}: BuildSplRevokeKeysignPayloadInput): Promise<KeysignPayload> => {
  const ownerKey = new PublicKey(owner)
  const { blockhash, lastValidBlockHeight } =
    await getSolanaClient().getLatestBlockhash()

  const message = new TransactionMessage({
    payerKey: ownerKey,
    recentBlockhash: blockhash,
    instructions: [
      createRevokeInstruction(
        new PublicKey(approval.tokenAccount),
        ownerKey,
        [],
        new PublicKey(approval.programId)
      ),
    ],
  }).compileToLegacyMessage()

  const rawTransaction = Buffer.from(
    new VersionedTransaction(message).serialize()
  ).toString('base64')

  return create(KeysignPayloadSchema, {
    coin: toCommCoin({
      ...chainFeeCoin[OtherChain.Solana],
      chain: OtherChain.Solana,
      address: owner,
      hexPublicKey,
    }),
    toAddress: approval.tokenAccount,
    toAmount: '0',
    memo: '',
    vaultLocalPartyId: localPartyId,
    vaultPublicKeyEcdsa: vaultId,
    libType,
    blockchainSpecific: {
      case: 'solanaSpecific',
      value: create(SolanaSpecificSchema, {
        recentBlockHash: blockhash,
        priorityFee: '0',
        lastValidBlockHeight: BigInt(lastValidBlockHeight),
      }),
    },
    signData: {
      case: 'signSolana',
      value: create(SignSolanaSchema, { rawTransactions: [rawTransaction] }),
    },
  })
}
