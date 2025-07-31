import { create } from '@bufbuild/protobuf'
import { checkERC20Function } from '@clients/extension/src/utils/functions'
import {
  IKeysignTransactionPayload,
  TransactionDetailsAsset,
} from '@clients/extension/src/utils/interfaces'
import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain, CosmosChain, OtherChain, UtxoChain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { getCardanoUtxos } from '@core/chain/chains/cardano/utxo/getCardanoUtxos'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { cosmosFeeCoinDenom } from '@core/chain/chains/cosmos/cosmosFeeCoinDenom'
import { getUtxos } from '@core/chain/chains/utxo/tx/getUtxos'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Coin } from '@core/chain/coin/Coin'
import { getSolanaToken } from '@core/chain/coin/find/solana/getSolanaToken'
import { knownTokens } from '@core/chain/coin/knownTokens'
import { thorchainNativeTokensMetadata } from '@core/chain/coin/knownTokens/thorchain'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { assertChainField } from '@core/chain/utils/assertChainField'
import { toHexPublicKey } from '@core/chain/utils/toHexPublicKey'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import {
  CosmosIbcDenomTraceSchema,
  TransactionType,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { CoinSchema } from '@core/mpc/types/vultisig/keysign/v1/coin_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WasmExecuteContractPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { FeeSettings } from '@core/ui/vault/send/fee/settings/state/feeSettings'
import { Vault } from '@core/ui/vault/Vault'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'
import { areLowerCaseEqual } from '@lib/utils/string/areLowerCaseEqual'
import { WalletCore } from '@trustwallet/wallet-core'
import { toUtf8String } from 'ethers'

import { CosmosMsgType } from '../constants'

const getCoin = async (asset: TransactionDetailsAsset): Promise<Coin> => {
  const { chain, ticker, mint } = asset

  const feeCoin = chainFeeCoin[chain]

  if (areLowerCaseEqual(ticker, feeCoin.ticker)) {
    return feeCoin
  }

  if (getChainKind(chain) === 'cosmos') {
    const expectedDenom = cosmosFeeCoinDenom[chain as CosmosChain]
    if (areLowerCaseEqual(ticker, expectedDenom)) {
      return chainFeeCoin[chain]
    }
  }

  const knownToken = knownTokens[chain].find(token =>
    areLowerCaseEqual(shouldBePresent(token.id), ticker)
  )

  if (knownToken) {
    return knownToken
  }

  if (chain === Chain.Solana && mint) {
    return getSolanaToken(mint)
  }

  if (chain === Chain.THORChain) {
    const token = thorchainNativeTokensMetadata[asset.ticker.toLowerCase()]
    if (token) {
      return {
        ...token,
        chain: Chain.THORChain,
      }
    }
  }

  throw new Error(`Failed to get coin info for asset: ${JSON.stringify(asset)}`)
}

export const getKeysignPayload = async (
  transaction: IKeysignTransactionPayload,
  vault: Vault,
  walletCore: WalletCore,
  feeSettings: FeeSettings | null
): Promise<KeysignPayload> => {
  const accountCoin = {
    ...(await getCoin(transaction.transactionDetails.asset)),
    address: transaction.transactionDetails.from,
  }

  // Create fee settings with gas limit from transaction details if available
  const effectiveFeeSettings = transaction.transactionDetails.gasSettings
    ?.gasLimit
    ? {
        ...feeSettings,
        gasLimit: Number(transaction.transactionDetails.gasSettings.gasLimit),
      }
    : feeSettings
  const txType = getTxType(transaction)

  const isDeposit =
    transaction.isDeposit ||
    transaction.transactionDetails.cosmosMsgPayload?.case ===
      CosmosMsgType.THORCHAIN_MSG_DEPOSIT

  const chainSpecific = await getChainSpecific({
    coin: accountCoin,
    amount: fromChainAmount(
      Number(transaction.transactionDetails.amount?.amount) || 0,
      accountCoin.decimals
    ),
    isDeposit,
    receiver: transaction.transactionDetails.to,
    transactionType: txType,
    feeSettings: effectiveFeeSettings,
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
            const client = await getCosmosClient(
              accountCoin.chain as CosmosChain
            )
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

  const coin = create(CoinSchema, {
    chain: transaction.chain,
    ticker: accountCoin.ticker,
    address: transaction.transactionDetails.from,
    decimals: accountCoin.decimals,
    hexPublicKey: toHexPublicKey({
      publicKey,
      walletCore,
    }),
    isNativeToken: isFeeCoin(accountCoin),
    logo: accountCoin.logo,
    priceProviderId: accountCoin.priceProviderId ?? '',
    contractAddress: accountCoin.id,
  })

  let modifiedMemo = null
  if (getChainKind(transaction.chain) === 'evm') {
    try {
      const isMemoFunction = await checkERC20Function(
        transaction.transactionDetails.data!
      )
      modifiedMemo =
        isMemoFunction || transaction.transactionDetails.data === '0x'
          ? (transaction.transactionDetails.data ?? '')
          : toUtf8String(transaction.transactionDetails.data!)
    } catch {
      modifiedMemo = transaction.transactionDetails.data!
    }
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
    memo: contractPayload
      ? transaction.transactionDetails.data
      : (modifiedMemo ?? transaction.transactionDetails.data),
    vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
    vaultLocalPartyId: 'VultiConnect',
    coin,
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
