import { create } from '@bufbuild/protobuf'

import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '../../../types/vultisig/keysign/v1/keysign_message_pb'
import {
  CosmosCoinSchema,
  CosmosFee,
  CosmosFeeSchema,
  CosmosMsgSchema,
  SignAminoSchema,
  SignDirectSchema,
} from '../../../types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { mapBlockchainSpecific } from '../mappers/mapBlockchainSpecific'
import { mapSwapPayload } from '../mappers/mapSwapPayload'
import {
  bigishToString,
  booleanOrUndefined,
  emptyToUndefined,
  numberOrUndefined,
} from '../utils'
import { toBlockchainSpecificOneof } from './toBlockchainSpecificOneof'

/**
 * Normalizes an iOS-style JSON test case `keysign_payload` into the
 * protobuf-es shape used our TS code.
 *
 * What it handles:
 * - coin (snake_case → camelCase)
 * - blockchainSpecific oneof (Ethereum/Cosmos/Ripple/Solana/Thorchain/Maya/Ton/Utxo)
 * - utxo_info → utxoInfo
 * - memo passthrough
 * - swap payload oneof:
 *   - OneinchSwapPayload
 *   - ThorchainSwapPayload
 *   - MayachainSwapPayload
 *   (and keeps unknowns as-is if they appear)
 * - optional approve/erc20 approve payload passthrough if provided by fixtures
 * - sign_data with sign_amino or sign_direct for CosmosSDK message signing
 */
export const normalizeKeysignPayloadFromJson = (input: any) => {
  const src = structuredClone(input)

  const coinSrc = src.coin ?? {}
  const coin = {
    chain: coinSrc.chain,
    ticker: coinSrc.ticker,
    address: coinSrc.address,
    decimals: numberOrUndefined(coinSrc.decimals),
    priceProviderId: coinSrc.price_provider_id ?? coinSrc.priceProviderId,
    isNativeToken: booleanOrUndefined(
      coinSrc.is_native_token ?? coinSrc.isNativeToken
    ),
    contractAddress: coinSrc.contract_address ?? coinSrc.contractAddress ?? '',
    hexPublicKey: coinSrc.hex_public_key ?? coinSrc.hexPublicKey,
    logo: coinSrc.logo,
  }

  const bsContainer = src.BlockchainSpecific ?? src.blockchainSpecific ?? {}

  const bsRaw =
    bsContainer.BlockchainSpecific ??
    bsContainer.blockchainSpecific ??
    bsContainer

  const blockchainSpecific = toBlockchainSpecificOneof(
    mapBlockchainSpecific(bsRaw)
  )

  const sp = src.SwapPayload ?? src.swapPayload
  const swapPayload = mapSwapPayload(sp)

  const utxoInfo = Array.isArray(src.utxo_info ?? src.utxoInfo)
    ? (src.utxo_info ?? src.utxoInfo).map((u: any) => ({
        hash: u.hash,
        amount: bigishToString(u.amount),
        index: numberOrUndefined(u.index),
        script: u.script,
        path: u.path,
      }))
    : []

  // Need to include the old `approve_payload` field for parity with iOS.
  const approve = src.erc20ApprovePayload ?? src.erc20_approve_payload

  const approveMapped = approve
    ? {
        amount: bigishToString(approve.amount),
        routerAddress:
          approve.router_address ?? approve.routerAddress ?? approve.spender,
        tokenAddress:
          approve.token_address ?? approve.tokenAddress ?? coin.contractAddress,
        ...approve,
      }
    : undefined

  const wasmContractPayload = src.wasm_execute_contract_payload
  const contractPayload: KeysignPayload['contractPayload'] | undefined =
    wasmContractPayload
      ? {
          case: 'wasmExecuteContractPayload',
          value: {
            $typeName: 'vultisig.keysign.v1.WasmExecuteContractPayload',
            senderAddress: wasmContractPayload.sender_address,
            contractAddress: wasmContractPayload.contract_address,
            executeMsg: wasmContractPayload.execute_msg,
            coins: wasmContractPayload.coins.map((coin: any) => ({
              denom: coin.denom,
              amount: coin.amount,
            })) as any,
          },
        }
      : undefined

  const signDataSrc = src.sign_data
  let signData: KeysignPayload['signData'] = {
    case: undefined,
    value: undefined,
  }

  if (signDataSrc) {
    if (signDataSrc.sign_amino) {
      const aminoSrc = signDataSrc.sign_amino
      const feeSrc = aminoSrc.fee

      const fee: CosmosFee | undefined = feeSrc
        ? create(CosmosFeeSchema, {
            amount: (feeSrc.amount ?? []).map((coin: any) =>
              create(CosmosCoinSchema, {
                denom: coin.denom,
                amount: coin.amount,
              })
            ),
            gas: feeSrc.gas ?? '0',
            payer: feeSrc.payer,
            granter: feeSrc.granter,
            feePayer: feeSrc.fee_payer,
          })
        : undefined

      signData = {
        case: 'signAmino',
        value: create(SignAminoSchema, {
          fee,
          msgs: (aminoSrc.msgs ?? []).map((msg: any) =>
            create(CosmosMsgSchema, {
              type: msg.type,
              value:
                typeof msg.value === 'string'
                  ? msg.value
                  : JSON.stringify(msg.value),
            })
          ),
        }),
      }
    } else if (signDataSrc.sign_direct) {
      const directSrc = signDataSrc.sign_direct

      signData = {
        case: 'signDirect',
        value: create(SignDirectSchema, {
          bodyBytes: directSrc.body_bytes,
          authInfoBytes: directSrc.auth_info_bytes,
          chainId: directSrc.chain_id,
          accountNumber: directSrc.account_number,
        }),
      }
    }
  }

  const out = {
    coin,
    toAddress: emptyToUndefined(src.to_address ?? src.toAddress),
    toAmount: bigishToString(src.to_amount ?? src.toAmount),
    memo: src.memo,
    blockchainSpecific,
    utxoInfo,
    swapPayload,
    vaultPublicKeyEcdsa:
      src.vault_public_key_ecdsa ??
      src.vaultPublicKeyEcdsa ??
      src.vault_pub_key_ecdsa,
    libType: src.lib_type ?? src.libType,
    erc20ApprovePayload: approveMapped,
    approvePayload: approveMapped,
    contractPayload,
    signData,
  }

  return create(KeysignPayloadSchema, out)
}
