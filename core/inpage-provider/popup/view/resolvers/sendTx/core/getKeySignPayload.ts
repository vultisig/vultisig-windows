import { create } from '@bufbuild/protobuf'
import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { CosmosChain, OtherChain, UtxoChain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { getCardanoUtxos } from '@core/chain/chains/cardano/utxo/getCardanoUtxos'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
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
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import {
  CosmosIbcDenomTraceSchema,
  TransactionType,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WasmExecuteContractPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { FeeSettings } from '@core/ui/vault/send/fee/settings/state/feeSettings'
import { Vault } from '@core/ui/vault/Vault'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { attempt } from '@lib/utils/attempt'
import { match } from '@lib/utils/match'
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
  feeSettings: FeeSettings | null
  coin: AccountCoin
}

export const getKeysignPayload = async ({
  transaction,
  vault,
  walletCore,
  feeSettings,
  coin,
}: GetKeysignPayloadProps): Promise<KeysignPayload> => {
  const txType = getTxType(transaction)

  const isDeposit =
    transaction.isDeposit ||
    transaction.transactionDetails.cosmosMsgPayload?.case ===
      CosmosMsgType.THORCHAIN_MSG_DEPOSIT

  const chainSpecific = await getChainSpecific({
    coin,
    amount: fromChainAmount(
      Number(transaction.transactionDetails.amount?.amount) || 0,
      coin.decimals
    ),
    isDeposit,
    receiver: transaction.transactionDetails.to,
    transactionType: txType,
    feeSettings,
    data: transaction.transactionDetails.data as `0x${string}` | undefined,
  })
  switch (chainSpecific.case) {
    case 'ethereumSpecific': {
      chainSpecific.value.maxFeePerGasWei =
        transaction.transactionDetails.gasSettings?.maxFeePerGas ??
        chainSpecific.value.maxFeePerGasWei
      chainSpecific.value.priorityFee =
        transaction.transactionDetails.gasSettings?.maxPriorityFeePerGas ??
        chainSpecific.value.priorityFee
      break
    }
    case 'cosmosSpecific': {
      if (
        transaction.transactionDetails.cosmosMsgPayload?.case ===
        CosmosMsgType.MSG_TRANSFER_URL
      ) {
        const hasTimeout =
          !!transaction.transactionDetails.cosmosMsgPayload?.value
            .timeoutTimestamp

        if (hasTimeout) {
          try {
            const client = await getCosmosClient(coin.chain as CosmosChain)
            const latestBlock = await client.getBlock()

            const latestBlockHeight = latestBlock.header.height
            const timeoutTimestamp =
              transaction.transactionDetails.cosmosMsgPayload?.value
                .timeoutTimestamp

            chainSpecific.value.ibcDenomTraces = create(
              CosmosIbcDenomTraceSchema,
              {
                latestBlock: `${latestBlockHeight}_${timeoutTimestamp}`,
              }
            )
          } catch (error) {
            console.error(
              'Failed to fetch Cosmos block or build denom trace:',
              error
            )
          }
        }
      }
      break
    }
  }

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

const getTxType = (
  transaction: IKeysignTransactionPayload
): TransactionType => {
  if (transaction.transactionDetails.cosmosMsgPayload) {
    const msg = transaction.transactionDetails.cosmosMsgPayload
    return match(msg.case, {
      [CosmosMsgType.MSG_SEND]: () => TransactionType.UNSPECIFIED,
      [CosmosMsgType.THORCHAIN_MSG_SEND]: () => TransactionType.UNSPECIFIED,
      [CosmosMsgType.MSG_SEND_URL]: () => TransactionType.UNSPECIFIED,
      [CosmosMsgType.MSG_TRANSFER_URL]: () => TransactionType.IBC_TRANSFER,
      [CosmosMsgType.MSG_EXECUTE_CONTRACT]: () =>
        TransactionType.GENERIC_CONTRACT,
      [CosmosMsgType.MSG_EXECUTE_CONTRACT_URL]: () =>
        TransactionType.GENERIC_CONTRACT,
      [CosmosMsgType.THORCHAIN_MSG_DEPOSIT]: () => TransactionType.UNSPECIFIED,
    })
  }
  return TransactionType.UNSPECIFIED
}
