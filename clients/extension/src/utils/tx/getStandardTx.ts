import {
  CosmosMsgPayload,
  TransactionDetails,
  TransactionType,
} from '@clients/extension/src/utils/interfaces'
import { base64 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { Chain } from '@core/chain/Chain'
import { getCosmosChainByChainId } from '@core/chain/chains/cosmos/chainInfo'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getSolanaTokenMetadata } from '@core/chain/coin/token/metadata/resolvers/solana'
import { match } from '@lib/utils/match'
import { TW } from '@trustwallet/wallet-core'
import { bech32 } from 'bech32'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'
import { ethers } from 'ethers'

import { CosmosMsgType } from '../constants'
import { getCosmosChainFromAddress } from '../cosmos/getCosmosChainFromAddress'

type TransactionHandlers = {
  [K in TransactionType.WalletTransaction['txType']]: (
    tx: Extract<TransactionType.WalletTransaction, { txType: K }>,
    chain: Chain
  ) => Promise<TransactionDetails> | TransactionDetails
}

const transactionHandlers: TransactionHandlers = {
  Keplr: (tx, chain) => {
    const { messages, memo, chainId, skipBroadcast } = extractKeplrMessages(tx)
    const [message] = messages

    const handleMsgSend = () => {
      if (
        !message.value ||
        !message.value.amount ||
        message.value.amount.length === 0
      ) {
        throw new Error('Invalid message structure: missing or empty amount')
      }
      return {
        asset: {
          chain: chain,
          ticker: message.value.amount[0].denom,
        },
        amount: {
          amount: message.value.amount[0].amount,
          decimals: chainFeeCoin[chain].decimals,
        },
        from: message.value.from_address,
        to: message.value.to_address,
        data: memo,
        cosmosMsgPayload: {
          case: message.type,
          value: {
            amount: message.value.amount,
            from_address: message.value.from_address,
            to_address: message.value.to_address,
          },
        } as CosmosMsgPayload,
        skipBroadcast,
      }
    }

    const handleMsgSendUrl = () => {
      const decodedMessage = MsgSend.decode(message.value)
      return {
        asset: {
          chain: chain,
          ticker: decodedMessage.amount[0].denom,
        },
        amount: {
          amount: decodedMessage.amount[0].amount,
          decimals: chainFeeCoin[chain].decimals,
        },
        from: decodedMessage.fromAddress,
        to: decodedMessage.toAddress,
        data: memo,
        cosmosMsgPayload: {
          case: message.typeUrl,
          value: {
            amount: decodedMessage.amount,
            from_address: decodedMessage.fromAddress,
            to_address: decodedMessage.toAddress,
          },
        } as CosmosMsgPayload,
        skipBroadcast,
      }
    }
    return match(message.type ?? message.typeUrl, {
      [CosmosMsgType.MSG_SEND]: handleMsgSend,
      [CosmosMsgType.THORCHAIN_MSG_SEND]: handleMsgSend,
      [CosmosMsgType.MSG_SEND_URL]: handleMsgSendUrl,
      [CosmosMsgType.MSG_EXECUTE_CONTRACT]: () => {
        const formattedMessage = formatContractMessage(
          JSON.stringify(message.value.msg)
        )

        return {
          asset: {
            chain: chain,
            ticker: message.value.funds.length
              ? message.value!.funds[0].denom
              : chainFeeCoin[chain].ticker,
          },
          amount: {
            amount: message.value.funds.length
              ? message.value.funds[0].amount
              : 0,
            decimals: chainFeeCoin[chain].decimals,
          },
          from: message.value.sender,
          to: message.value.contract,
          data: memo,
          cosmosMsgPayload: {
            case: CosmosMsgType.MSG_EXECUTE_CONTRACT,
            value: {
              sender: message.value.sender,
              contract: message.value.contract,
              funds: message.value.funds,
              msg: formattedMessage,
            },
          } as CosmosMsgPayload,
          skipBroadcast,
        }
      },
      [CosmosMsgType.MSG_EXECUTE_CONTRACT_URL]: () => {
        const decodedMessage = MsgExecuteContract.decode(message.value)
        const msgString = new TextDecoder().decode(
          Buffer.from(decodedMessage.msg)
        )
        const formattedMessage = formatContractMessage(msgString)
        return {
          asset: {
            chain: chain,
            ticker: decodedMessage.funds.length
              ? decodedMessage.funds[0].denom
              : chainFeeCoin[chain].ticker,
          },
          amount: {
            amount: decodedMessage.funds.length
              ? decodedMessage.funds[0].amount
              : 0,
            decimals: chainFeeCoin[chain].decimals,
          },
          from: decodedMessage.sender,
          to: decodedMessage.contract,
          data: memo,
          cosmosMsgPayload: {
            case: CosmosMsgType.MSG_EXECUTE_CONTRACT,
            value: {
              sender: decodedMessage.sender,
              contract: decodedMessage.contract,
              funds: decodedMessage.funds,
              msg: formattedMessage,
            },
          } as CosmosMsgPayload,
          skipBroadcast,
        }
      },
      [CosmosMsgType.MSG_TRANSFER_URL]: () => {
        const txChain = getCosmosChainByChainId(chainId)

        if (!txChain) {
          throw new Error(`Chain not supported: ${chainId}`)
        }

        const msg = MsgTransfer.decode(message.value)

        const receiverChain = getCosmosChainFromAddress(msg.receiver)

        return {
          asset: {
            chain: txChain,
            ticker: msg.token.denom,
          },
          amount: {
            amount: msg.token.amount,
            decimals: chainFeeCoin[txChain].decimals,
          },
          from: msg.sender,
          to: msg.receiver,
          data: `${receiverChain}:${msg.sourceChannel}:${msg.receiver}:${msg.memo}`,
          cosmosMsgPayload: {
            case: CosmosMsgType.MSG_TRANSFER_URL,
            value: {
              ...msg,
              timeoutHeight: {
                revisionHeight: msg.timeoutHeight.revisionHeight.toString(),
                revisionNumber: msg.timeoutHeight.revisionNumber.toString(),
              },
              timeoutTimestamp: msg.timeoutTimestamp.toString(),
            },
          } as CosmosMsgPayload,
          skipBroadcast,
        }
      },
      [CosmosMsgType.THORCHAIN_MSG_DEPOSIT]: () => {
        if (!message.value.coins || message.value.coins.length === 0) {
          throw new Error(' coins array is required and cannot be empty')
        }

        const assetParts = message.value.coins[0].asset.split('.')
        if (assetParts.length < 2) {
          throw new Error(
            `invalid asset format: ${message.value.coins[0].asset}`
          )
        }
        return {
          asset: {
            chain: chain,
            ticker: assetParts[1],
          },
          amount: {
            amount: message.value.coins[0].amount,
            decimals: chainFeeCoin[chain].decimals,
          },
          from: message.value.signer,
          data: memo,
          cosmosMsgPayload: {
            case: CosmosMsgType.THORCHAIN_MSG_DEPOSIT,
            value: {
              coins: message.value.coins,
              memo: message.value.memo,
              signer: message.value.signer,
            },
          } as CosmosMsgPayload,
          skipBroadcast,
        }
      },
      [CosmosMsgType.THORCHAIN_MSG_DEPOSIT_URL]: () => {
        const decodedMessage = TW.Cosmos.Proto.Message.THORChainDeposit.decode(
          message.value
        )
        if (
          !decodedMessage.coins ||
          decodedMessage.coins.length === 0 ||
          !decodedMessage.coins[0].asset
        ) {
          throw new Error(' coins array is required and cannot be empty')
        }
        const thorAddress = bech32.encode(
          'thor',
          bech32.toWords(decodedMessage.signer)
        )

        return {
          asset: {
            chain: chain,
            ticker: decodedMessage.coins[0].asset.ticker,
          },
          amount: {
            amount: decodedMessage.coins[0].amount,
            decimals: chainFeeCoin[chain].decimals,
          },
          from: thorAddress,
          data: memo,
          cosmosMsgPayload: {
            case: CosmosMsgType.THORCHAIN_MSG_DEPOSIT,
            value: {
              coins: decodedMessage.coins.map(coin => ({
                amount: coin.amount,
                asset: coin.asset?.ticker,
              })),
              memo: decodedMessage.memo,
              signer: thorAddress,
            },
          } as CosmosMsgPayload,
          skipBroadcast,
        }
      },
    })
  },

  Phantom: async (tx, chain) => {
    if (tx.asset.ticker && tx.asset.ticker === chainFeeCoin.Solana.ticker) {
      return {
        asset: {
          chain: chain,
          ticker: tx.asset.ticker,
        },
        amount: { amount: tx.amount, decimals: chainFeeCoin[chain].decimals },
        from: tx.from,
        to: tx.to,
        skipBroadcast: tx.skipBroadcast,
      }
    } else {
      if (!tx.asset.mint) {
        throw new Error('No mint address provided')
      }
      try {
        const key = {
          chain: Chain.Solana,
          id: tx.asset.mint,
        } as const
        const metadata = await getSolanaTokenMetadata(key)
        const token = {
          ...key,
          ...metadata,
        }

        return {
          asset: {
            chain: chain,
            ticker: token.ticker,
            symbol: token.ticker,
            mint: tx.asset.mint,
          },
          amount: { amount: tx.amount, decimals: token.decimals },
          from: tx.from,
          to: tx.to,
          skipBroadcast: tx.skipBroadcast,
        }
      } catch (err) {
        throw new Error(`Could not fetch Solana token info: ${err}`)
      }
    }
  },

  MetaMask: (tx, chain) => ({
    from: tx.from,
    to: tx.to,
    asset: {
      chain: chain,
      ticker: chainFeeCoin[chain].ticker,
    },
    amount: tx.value
      ? { amount: tx.value, decimals: chainFeeCoin[chain].decimals }
      : undefined,
    data: tx.data,
    gasSettings: {
      maxFeePerGas: ethers.isHexString(tx.maxFeePerGas)
        ? ethers.toBigInt(tx.maxFeePerGas).toString()
        : tx.maxFeePerGas,
      maxPriorityFeePerGas: ethers.isHexString(tx.maxPriorityFeePerGas)
        ? ethers.toBigInt(tx.maxPriorityFeePerGas).toString()
        : tx.maxPriorityFeePerGas,
      gasLimit: ethers.isHexString(tx.gas)
        ? ethers.toBigInt(tx.gas).toString()
        : tx.gas,
    },
  }),

  Ctrl: tx => ({
    asset: tx.asset,
    data: tx.memo,
    from: tx.from,
    gasLimit: tx.gasLimit,
    to: tx.recipient,
    amount: tx.amount,
  }),

  Vultisig: tx => ({
    ...tx,
  }),
}

export const getStandardTransactionDetails = async (
  tx: TransactionType.WalletTransaction,
  chain: Chain
): Promise<TransactionDetails> => {
  if (!tx || !tx.txType) {
    throw new Error('Invalid transaction object or missing txType')
  }

  const handler = transactionHandlers[tx.txType]
  if (!handler) {
    throw new Error(`Unsupported transaction type: ${tx.txType}`)
  }

  return handler(tx as any, chain) // TypeScript ensures correctness due to TransactionHandlers type
}

export const isBasicTransaction = (
  transaction: Record<string, any> | null
): boolean => {
  return (
    typeof transaction === 'object' &&
    transaction !== null &&
    'from' in transaction &&
    'to' in transaction &&
    'value' in transaction
  )
}

const extractKeplrMessages = (
  tx: TransactionType.Keplr
): {
  messages: any[]
  memo: string
  chainId: string
  skipBroadcast?: boolean
} => {
  if ('msgs' in tx) {
    return {
      chainId: tx.chain_id,
      messages: [...tx.msgs],
      memo: tx.memo,
      skipBroadcast: tx.skipBroadcast,
    }
  } else {
    const txBody = TxBody.decode(base64.decode(tx.bodyBytes))

    return {
      chainId: tx.chainId,
      messages: txBody.messages,
      memo: txBody.memo,
      skipBroadcast: tx.skipBroadcast,
    }
  }
}

const formatContractMessage = (msgString: string): string =>
  msgString.replace(/^({)/, '$1 ').replace(/(})$/, ' $1').replace(/:/g, ': ')
