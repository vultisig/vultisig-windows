import { create } from '@bufbuild/protobuf'
import { OtherChain, UtxoChain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { getCardanoUtxos } from '@core/chain/chains/cardano/utxo/getCardanoUtxos'
import { getEvmContractCallHexSignature } from '@core/chain/chains/evm/contract/call/hexSignature'
import { getEvmContractCallSignatures } from '@core/chain/chains/evm/contract/call/signatures'
import { getUtxos } from '@core/chain/chains/utxo/tx/getUtxos'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { assertChainField } from '@core/chain/utils/assertChainField'
import {
  CosmosMsgType,
  IKeysignTransactionPayload,
} from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WasmExecuteContractPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { Vault } from '@core/ui/vault/Vault'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { attempt } from '@lib/utils/attempt'
import { WalletCore } from '@trustwallet/wallet-core'
import { toUtf8String } from 'ethers'

const isEvmContractCall = async (inputHex: string): Promise<boolean> => {
  const hexSignature = getEvmContractCallHexSignature(inputHex)

  const { data } = await attempt(getEvmContractCallSignatures(hexSignature))

  if (data) {
    return data.count > 0
  }

  return false
}

type GetKeysignPayloadProps = {
  transaction: IKeysignTransactionPayload
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
      (!txData.startsWith('0x') || !(await isEvmContractCall(txData)))
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

  if (isOneOf(transaction.chain, Object.values(UtxoChain))) {
    keysignPayload.utxoInfo = await getUtxos(assertChainField(coin))
  } else if (transaction.chain === OtherChain.Cardano) {
    keysignPayload.utxoInfo = await getCardanoUtxos(coin.address)
  }

  return keysignPayload
}
