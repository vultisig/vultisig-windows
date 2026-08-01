import { create } from '@bufbuild/protobuf'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { getChainSpecific } from '@vultisig/core-mpc/keysign/chainSpecific'
import { KeysignLibType } from '@vultisig/core-mpc/mpcLib'
import { toCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import {
  SignTonSchema,
  TonMessageSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { Buffer } from 'buffer'

import {
  buildTonstakersBurnCell,
  buildTonstakersDepositCell,
  tonCellToPayload,
  tonstakersBurnMessageValue,
  tonstakersPoolBounceableAddress,
} from '../core'

export type TonstakersAction = 'stake' | 'unstake'

type BuildTonstakersMessageInput = {
  action: TonstakersAction
  amount: bigint
  ownerAddress: string
  jettonWalletAddress?: string
  minimumStake?: bigint
}

type TonstakersMessage = {
  to: string
  amount: string
  payload: string
}

export const buildTonstakersMessage = ({
  action,
  amount,
  ownerAddress,
  jettonWalletAddress,
  minimumStake,
}: BuildTonstakersMessageInput): TonstakersMessage => {
  if (action === 'stake') {
    if (minimumStake === undefined) {
      throw new Error('Tonstakers live minimum is required to stake')
    }
    if (amount < minimumStake) {
      throw new Error('Tonstakers stake amount is below the live minimum')
    }

    return {
      to: tonstakersPoolBounceableAddress,
      amount: amount.toString(),
      payload: tonCellToPayload(buildTonstakersDepositCell()),
    }
  }

  if (!jettonWalletAddress) {
    throw new Error('Tonstakers jetton wallet is required to unstake')
  }

  return {
    to: jettonWalletAddress,
    amount: tonstakersBurnMessageValue.toString(),
    payload: tonCellToPayload(
      buildTonstakersBurnCell({ amount, responseAddress: ownerAddress })
    ),
  }
}

type BuildTonstakersKeysignPayloadInput = BuildTonstakersMessageInput & {
  coin: AccountCoin
  vaultId: string
  localPartyId: string
  publicKey: PublicKey
  libType: KeysignLibType
  walletCore: WalletCore
}

/**
 * Builds the same `SignTon.tonMessages` envelope used by TonConnect dApps.
 * The protocol BoC remains inside the message payload; no relay/protobuf field
 * is added for Tonstakers.
 */
export const buildTonstakersKeysignPayload = async ({
  coin,
  vaultId,
  localPartyId,
  publicKey,
  libType,
  walletCore,
  ...messageInput
}: BuildTonstakersKeysignPayloadInput): Promise<KeysignPayload> => {
  const message = buildTonstakersMessage(messageInput)
  const hexPublicKey = Buffer.from(publicKey.data()).toString('hex')

  const keysignPayload = create(KeysignPayloadSchema, {
    coin: toCommCoin({ ...coin, hexPublicKey }),
    toAddress: message.to,
    toAmount: message.amount,
    vaultLocalPartyId: localPartyId,
    vaultPublicKeyEcdsa: vaultId,
    libType,
    signData: {
      case: 'signTon',
      value: create(SignTonSchema, {
        tonMessages: [create(TonMessageSchema, message)],
      }),
    },
  })

  keysignPayload.blockchainSpecific = await getChainSpecific({
    keysignPayload,
    walletCore,
  })

  return keysignPayload
}
