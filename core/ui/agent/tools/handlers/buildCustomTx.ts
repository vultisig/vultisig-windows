import { create, toBinary } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { Chain } from '@core/chain/Chain'
import { toEvmTwAmount } from '@core/chain/chains/evm/tx/tw/toEvmTwAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { toTwAddress } from '@core/mpc/keysign/tw/toTwAddress'
import { getKeysignUtxoInfo } from '@core/mpc/keysign/utxo/getKeysignUtxoInfo'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import {
  CosmosCoinSchema,
  WasmExecuteContractPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'

import { getChainFromString } from '../../utils/getChainFromString'
import { resolveAccountCoin } from '../shared/resolveAccountCoin'
import { getWalletContext } from '../shared/walletContext'
import type { CoinInfo, ToolHandler } from '../types'

type AbiParam = {
  type: string
  value: string
}

const resolveNativeFeeCoin = (
  coins: CoinInfo[],
  chain: Chain,
  chainStr: string
) => {
  const feeCoin = chainFeeCoin[chain]
  const vaultCoin = coins.find(
    c => c.chain.toLowerCase() === chainStr.toLowerCase() && c.isNativeToken
  )
  if (!vaultCoin) return null

  return {
    chain,
    address: vaultCoin.address,
    decimals: feeCoin.decimals,
    ticker: feeCoin.ticker,
    logo: feeCoin.logo,
    priceProviderId: feeCoin.priceProviderId,
  }
}

const buildDeposit: ToolHandler = async (input, context) => {
  const chainStr = String(input.chain ?? '').trim()
  const symbol = String(input.symbol ?? '').trim()
  const amountStr = String(input.amount ?? '').trim()
  const memo = String(input.memo ?? '').trim()

  if (!chainStr || !symbol || !amountStr || !memo) {
    throw new Error('chain, symbol, amount, and memo are required for deposit')
  }

  const parsedAmount = parseFloat(amountStr)
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new Error(`Invalid amount: ${amountStr}`)
  }

  const coin = resolveAccountCoin(context.coins, chainStr, symbol)
  if (!coin) {
    throw new Error(
      `Could not resolve coin ${symbol} on ${chainStr} from vault`
    )
  }

  const chainAmount = toChainAmount(parsedAmount, coin.decimals)

  const { walletCore, vault } = getWalletContext()

  const publicKey = getPublicKey({
    chain: coin.chain,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
    chainPublicKeys: vault.chainPublicKeys,
  })

  const keysignPayload = create(KeysignPayloadSchema, {
    coin: toCommCoin({
      ...coin,
      hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
    }),
    toAddress: '',
    toAmount: chainAmount.toString(),
    memo,
    vaultLocalPartyId: vault.localPartyId,
    vaultPublicKeyEcdsa: vault.publicKeyEcdsa,
    libType: vault.libType,
    utxoInfo: await getKeysignUtxoInfo(coin),
  })

  keysignPayload.blockchainSpecific = await getChainSpecific({
    keysignPayload,
    walletCore,
    isDeposit: true,
  })

  if (memo.toUpperCase().startsWith('UNBOND')) {
    keysignPayload.toAmount = '0'
  }

  const payloadBytes = toBinary(KeysignPayloadSchema, keysignPayload)
  const keysignPayloadB64 = Buffer.from(payloadBytes).toString('base64')

  return {
    data: {
      keysign_payload: keysignPayloadB64,
      from_chain: coin.chain,
      from_symbol: coin.ticker,
      amount: amountStr,
      sender: coin.address,
      destination: '',
      tx_type: 'deposit',
      tx_details: {
        to_address: keysignPayload.toAddress,
        to_amount: keysignPayload.toAmount,
        memo: keysignPayload.memo,
      },
    },
  }
}

const buildEvmContract: ToolHandler = async (input, context) => {
  const chainStr = String(input.chain ?? '').trim()
  const contractAddress = String(input.contract_address ?? '').trim()
  const functionName = String(input.function_name ?? '').trim()
  const rawParams = Array.isArray(input.params) ? input.params : []
  const params: AbiParam[] = rawParams.map((p: Record<string, unknown>) => ({
    type: String(p.type ?? ''),
    value: String(p.value ?? ''),
  }))
  const valueStr = String(input.value ?? '0').trim()

  if (!chainStr || !contractAddress || !functionName) {
    throw new Error(
      'chain, contract_address, and function_name are required for evm_contract'
    )
  }

  const chain = getChainFromString(chainStr)
  if (!chain) {
    throw new Error(`Unknown chain: ${chainStr}`)
  }

  const nativeCoin = resolveNativeFeeCoin(context.coins, chain, chainStr)
  if (!nativeCoin) {
    throw new Error(`No native fee coin found for ${chainStr} in vault`)
  }

  const { walletCore, vault } = getWalletContext()

  const publicKey = getPublicKey({
    chain: nativeCoin.chain,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
    chainPublicKeys: vault.chainPublicKeys,
  })

  const abiFunc = walletCore.EthereumAbiFunction.createWithString(functionName)

  for (const param of params) {
    const t = param.type.toLowerCase()
    if (t === 'address') {
      abiFunc.addParamAddress(
        toTwAddress({ address: param.value, walletCore, chain }),
        false
      )
    } else if (t === 'uint256') {
      const str = String(param.value).trim()
      if (!str || !/^-?\d+$/.test(str)) {
        throw new Error(
          `Invalid integer value "${param.value}" for type ${param.type}`
        )
      }
      abiFunc.addParamUInt256(toEvmTwAmount(BigInt(str)), false)
    } else if (t === 'string') {
      abiFunc.addParamString(param.value, false)
    } else if (t === 'bytes') {
      const hexStr = param.value.startsWith('0x')
        ? param.value.slice(2)
        : param.value
      abiFunc.addParamBytes(Buffer.from(hexStr, 'hex'), false)
    } else if (t === 'bool') {
      abiFunc.addParamBool(param.value === 'true', false)
    } else {
      throw new Error(`Unsupported ABI param type: ${param.type}`)
    }
  }

  const encoded = walletCore.EthereumAbi.encode(abiFunc)
  const calldata = `0x${Buffer.from(encoded).toString('hex')}`

  const toAmount =
    valueStr !== '0'
      ? toChainAmount(parseFloat(valueStr), nativeCoin.decimals).toString()
      : '0'

  const keysignPayload = create(KeysignPayloadSchema, {
    coin: toCommCoin({
      ...nativeCoin,
      hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
    }),
    toAddress: contractAddress,
    toAmount,
    memo: calldata,
    vaultLocalPartyId: vault.localPartyId,
    vaultPublicKeyEcdsa: vault.publicKeyEcdsa,
    libType: vault.libType,
  })

  keysignPayload.blockchainSpecific = await getChainSpecific({
    keysignPayload,
    walletCore,
  })

  const payloadBytes = toBinary(KeysignPayloadSchema, keysignPayload)
  const keysignPayloadB64 = Buffer.from(payloadBytes).toString('base64')

  return {
    data: {
      keysign_payload: keysignPayloadB64,
      from_chain: nativeCoin.chain,
      from_symbol: nativeCoin.ticker,
      amount: valueStr,
      sender: nativeCoin.address,
      destination: contractAddress,
      tx_type: 'evm_contract',
      tx_details: {
        to_address: contractAddress,
        to_amount: toAmount,
        memo: calldata,
        function_name: functionName,
      },
    },
  }
}

const buildWasmExecute: ToolHandler = async (input, context) => {
  const chainStr = String(input.chain ?? '').trim()
  const contractAddress = String(input.contract_address ?? '').trim()
  const executeMsg = String(input.execute_msg ?? '').trim()
  const rawFunds = Array.isArray(input.funds) ? input.funds : []
  const funds = rawFunds.map((f: Record<string, unknown>) => ({
    denom: String(f.denom ?? ''),
    amount: String(f.amount ?? ''),
  }))

  if (!chainStr || !contractAddress || !executeMsg) {
    throw new Error(
      'chain, contract_address, and execute_msg are required for wasm_execute'
    )
  }

  const chain = getChainFromString(chainStr)
  if (!chain) {
    throw new Error(`Unknown chain: ${chainStr}`)
  }

  const nativeCoin = resolveNativeFeeCoin(context.coins, chain, chainStr)
  if (!nativeCoin) {
    throw new Error(`No native fee coin found for ${chainStr} in vault`)
  }

  const { walletCore, vault } = getWalletContext()

  const publicKey = getPublicKey({
    chain: nativeCoin.chain,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
    chainPublicKeys: vault.chainPublicKeys,
  })

  const keysignPayload = create(KeysignPayloadSchema, {
    coin: toCommCoin({
      ...nativeCoin,
      hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
    }),
    toAddress: '',
    toAmount: '0',
    memo: '',
    vaultLocalPartyId: vault.localPartyId,
    vaultPublicKeyEcdsa: vault.publicKeyEcdsa,
    libType: vault.libType,
    contractPayload: {
      case: 'wasmExecuteContractPayload',
      value: create(WasmExecuteContractPayloadSchema, {
        senderAddress: nativeCoin.address,
        contractAddress,
        executeMsg,
        coins: funds.map(fund =>
          create(CosmosCoinSchema, {
            denom: fund.denom,
            amount: fund.amount,
          })
        ),
      }),
    },
  })

  keysignPayload.blockchainSpecific = await getChainSpecific({
    keysignPayload,
    walletCore,
    transactionType: TransactionType.GENERIC_CONTRACT,
  })

  const payloadBytes = toBinary(KeysignPayloadSchema, keysignPayload)
  const keysignPayloadB64 = Buffer.from(payloadBytes).toString('base64')

  return {
    data: {
      keysign_payload: keysignPayloadB64,
      from_chain: nativeCoin.chain,
      from_symbol: nativeCoin.ticker,
      amount: '0',
      sender: nativeCoin.address,
      destination: contractAddress,
      tx_type: 'wasm_execute',
      tx_details: {
        contract_address: contractAddress,
        execute_msg: executeMsg,
        funds,
      },
    },
  }
}

export const handleBuildCustomTx: ToolHandler = async (input, context) => {
  const txType = String(input.tx_type ?? '').trim()

  if (txType === 'deposit') {
    return buildDeposit(input, context)
  }

  if (txType === 'evm_contract') {
    return buildEvmContract(input, context)
  }

  if (txType === 'wasm_execute') {
    return buildWasmExecute(input, context)
  }

  throw new Error(
    `Unknown tx_type: "${txType}". Must be "deposit", "evm_contract", or "wasm_execute"`
  )
}
