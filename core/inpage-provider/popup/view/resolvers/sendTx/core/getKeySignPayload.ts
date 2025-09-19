import { create } from '@bufbuild/protobuf'
import { getChainKind } from '@core/chain/ChainKind'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { CosmosMsgType } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WasmExecuteContractPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { Vault } from '@core/ui/vault/Vault'
import { WalletCore } from '@trustwallet/wallet-core'
import { toUtf8String } from 'ethers'

import { RegularParsedTx } from './parsedTx'

type GetKeysignPayloadProps = {
  transaction: RegularParsedTx
  vault: Vault
  walletCore: WalletCore
  coin: AccountCoin
  chainSpecific: KeysignChainSpecific
}

export const getKeysignPayload = async ({
  transaction,
  vault,
  walletCore,
  coin,
  chainSpecific,
}: GetKeysignPayloadProps): Promise<KeysignPayload> => {
  const publicKey = getPublicKey({
    chain: transaction.chain,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
  })

  const getMemo = async () => {
    const txData = transaction.transactionDetails.data

    if (
      txData &&
      getChainKind(transaction.chain) === 'evm' &&
      txData !== '0x' &&
      (!txData.startsWith('0x') || !transaction.evmContractCallInfo)
    ) {
      return toUtf8String(txData)
    }

    return txData
  }

  let contractPayload = null
  if (
    transaction.transactionDetails.cosmosMsgPayload?.case ===
    CosmosMsgType.MSG_EXECUTE_CONTRACT
  ) {
    const msgPayload = transaction.transactionDetails.cosmosMsgPayload.value

    contractPayload = create(WasmExecuteContractPayloadSchema, {
      contractAddress: msgPayload.contract,
      executeMsg: msgPayload.msg,
      senderAddress: msgPayload.sender,
      coins: msgPayload.funds,
    })
  }
  const keysignPayload = create(KeysignPayloadSchema, {
    toAddress: transaction.transactionDetails.to,
    toAmount: BigInt(
      parseInt(transaction.transactionDetails.amount?.amount ?? '0')
    ).toString(),
    memo: await getMemo(),
    vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
    vaultLocalPartyId: 'VultiConnect',
    coin: toCommCoin({
      ...coin,
      hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
    }),
    blockchainSpecific: chainSpecific,
    contractPayload: contractPayload
      ? { case: 'wasmExecuteContractPayload', value: contractPayload }
      : undefined,
    skipBroadcast: transaction.transactionDetails.skipBroadcast,
  })

  return keysignPayload
}
