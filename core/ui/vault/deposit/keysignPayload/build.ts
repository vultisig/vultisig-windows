import { create } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { Chain, CosmosChain } from '@core/chain/Chain'
import { isChainOfKind } from '@core/chain/ChainKind'
import {
  kujiraCoinMigratedToThorChainDestinationId,
  kujiraCoinThorChainMergeContracts,
} from '@core/chain/chains/cosmos/thor/kujira-merge'
import {
  yieldBearingAssetsAffiliateAddress,
  yieldBearingAssetsAffiliateContract,
  yieldBearingTokensIdToContractMap,
  yieldContractsByBaseDenom,
} from '@core/chain/chains/cosmos/thor/yield-bearing-tokens/config'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { CoinKey } from '@core/chain/coin/Coin'
import { getDenom } from '@core/chain/coin/utils/getDenom'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { getKeysignUtxoInfo } from '@core/mpc/keysign/utxo/getKeysignUtxoInfo'
import { MpcLib } from '@core/mpc/mpcLib'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import {
  CosmosCoinSchema,
  WasmExecuteContractPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt, withFallback } from '@lib/utils/attempt'
import { match } from '@lib/utils/match'
import { mirrorRecord } from '@lib/utils/record/mirrorRecord'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'
import { FieldValues } from 'react-hook-form'

import { ChainAction } from '../ChainAction'
import { resolvers, selectStakeId } from '../staking/resolvers'
import {
  NativeTcyInput,
  RujiInput,
  StakeKind,
  StcyInput,
} from '../staking/types'

export type BuildDepositKeysignPayloadInput = {
  coin: AccountCoin
  action: ChainAction
  depositData: FieldValues
  receiver?: string
  amount?: number
  memo?: string
  validatorAddress?: string
  slippage?: number
  autocompound?: boolean
  transactionType?: TransactionType
  vaultId: string
  localPartyId: string
  publicKey: PublicKey
  libType: MpcLib
  walletCore: WalletCore
}

export const buildDepositKeysignPayload = async ({
  coin,
  action,
  depositData,
  receiver,
  amount,
  memo = '',
  validatorAddress,
  walletCore,
  slippage = 0,
  autocompound = false,
  transactionType,
  vaultId,
  localPartyId,
  publicKey,
  libType,
}: BuildDepositKeysignPayloadInput) => {
  const isUnmerge = action === 'unmerge'
  const isStake = isOneOf(action, ['stake', 'unstake', 'withdraw_ruji_rewards'])
  const isTonFunction = coin.chain === Chain.Ton

  const hasAmount = amount !== undefined && Number.isFinite(amount)
  const amountUnits = hasAmount
    ? toChainAmount(shouldBePresent(amount), coin.decimals).toString()
    : undefined

  let keysignPayload = create(KeysignPayloadSchema, {
    coin: toCommCoin({
      ...coin,
      address: coin.address,
      hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
    }),
    memo,
    vaultLocalPartyId: localPartyId,
    vaultPublicKeyEcdsa: vaultId,
    libType,
    utxoInfo: await getKeysignUtxoInfo(coin),
    toAddress: receiver,
    toAmount: hasAmount && amountUnits ? amountUnits : undefined,
  })

  keysignPayload.blockchainSpecific = await getChainSpecific({
    keysignPayload,
    walletCore,
    isDeposit: true,
    transactionType,
  })

  const stakeId = isStake
    ? withFallback(
        attempt(() => selectStakeId(coin, { autocompound })),
        undefined
      )
    : undefined

  if (isStake && stakeId) {
    const actionAsStakeAction =
      action === 'withdraw_ruji_rewards' ? 'claim' : (action as StakeKind)

    const stakeSpecific = resolvers[stakeId]

    let input: RujiInput | NativeTcyInput | StcyInput | null = null

    match(actionAsStakeAction, {
      stake: () => {
        input = { kind: 'stake', amount: shouldBePresent(amount) }
      },
      unstake: () => {
        if (stakeId === 'stcy') {
          input = { kind: 'unstake', amount: shouldBePresent(amount) }
        } else if (stakeId === 'native-tcy') {
          const raw = depositData['percentage']

          const pct =
            typeof raw === 'string' && raw.trim() === '' ? NaN : Number(raw)

          const pctValid = Number.isFinite(pct) && pct > 0 && pct <= 100
          input = pctValid
            ? { kind: 'unstake', percentage: pct }
            : { kind: 'unstake', amount: shouldBePresent(amount) }
        } else {
          input = {
            kind: 'unstake',
            amount: shouldBePresent(amount),
          }
        }
      },
      claim: () => {
        input = { kind: 'claim' }
      },
    })

    if (!input) {
      throw new Error('Failed to construct stake input')
    }

    const intent = stakeSpecific({
      coin,
      input,
    })

    if (intent.kind === 'wasm') {
      keysignPayload.memo = ''
      keysignPayload.toAddress = ''
      keysignPayload.toAmount = '0'
      keysignPayload.contractPayload = {
        case: 'wasmExecuteContractPayload',
        value: create(WasmExecuteContractPayloadSchema, {
          senderAddress: coin.address,
          contractAddress: intent.contract,
          executeMsg:
            typeof intent.executeMsg === 'string'
              ? intent.executeMsg
              : JSON.stringify(intent.executeMsg),
          coins: intent.funds.map(fund => create(CosmosCoinSchema, fund)),
        }),
      }
      return keysignPayload
    }

    keysignPayload = create(KeysignPayloadSchema, {
      ...keysignPayload,
      contractPayload: { case: undefined },
      memo: intent.memo,
      toAddress: '',
      toAmount: intent.toAmount ?? '0',
    })

    return keysignPayload
  }

  if (action === 'mint' || action === 'redeem') {
    const isDeposit = action === 'mint'
    const amountUnits = toChainAmount(
      shouldBePresent(amount),
      coin.decimals
    ).toString()

    let funds: Array<{ denom: string; amount: string }>

    if (isDeposit) {
      if (!isChainOfKind(coin.chain, 'cosmos')) {
        throw new Error('Only Cosmos chains support Mint / Redeem actions')
      }

      const baseDenom = getDenom(coin as CoinKey<CosmosChain>)
      if (baseDenom !== 'rune' && baseDenom !== 'tcy') {
        throw new Error('Mint supports RUNE/TCY only')
      }

      const targetYContract = yieldContractsByBaseDenom[baseDenom]

      const executeInner = {
        execute: {
          contract_addr: targetYContract,
          msg: Buffer.from(JSON.stringify({ deposit: {} })).toString('base64'),
          affiliate: [yieldBearingAssetsAffiliateAddress, 10],
        },
      }

      funds = [{ denom: baseDenom, amount: amountUnits }]

      keysignPayload = create(KeysignPayloadSchema, {
        ...keysignPayload,
        memo: '',
        contractPayload: {
          case: 'wasmExecuteContractPayload',
          value: create(WasmExecuteContractPayloadSchema, {
            senderAddress: coin.address,
            contractAddress: yieldBearingAssetsAffiliateContract,
            executeMsg: JSON.stringify(executeInner),
            coins: funds.map(fund => create(CosmosCoinSchema, fund)),
          }),
        },
        toAmount: amountUnits,
      })

      return keysignPayload
    } else {
      const assertedCoinId = shouldBePresent(coin.id)

      const contractAddress = yieldBearingTokensIdToContractMap[assertedCoinId]

      const executeInner = {
        withdraw: { slippage: (slippage / 100).toFixed(2) },
      }

      funds = [
        {
          denom: getDenom(coin as CoinKey<CosmosChain>),
          amount: amountUnits,
        },
      ]

      keysignPayload = create(KeysignPayloadSchema, {
        ...keysignPayload,
        memo: '',
        contractPayload: {
          case: 'wasmExecuteContractPayload',
          value: create(WasmExecuteContractPayloadSchema, {
            senderAddress: coin.address,
            contractAddress: shouldBePresent(contractAddress),
            executeMsg: JSON.stringify(executeInner),
            coins: funds.map(fund => create(CosmosCoinSchema, fund)),
          }),
        },
        toAmount: amountUnits,
      })

      return keysignPayload
    }
  }

  if (
    isOneOf(action, [
      'leave',
      'unbound',
      'bond',
      'ibc_transfer',
      'switch',
      'merge',
      'add_cacao_pool',
      'remove_cacao_pool',
    ])
  ) {
    keysignPayload = create(KeysignPayloadSchema, {
      ...keysignPayload,
      contractPayload: { case: undefined },
      toAddress: isTonFunction
        ? shouldBePresent(validatorAddress)
        : (receiver ?? keysignPayload.toAddress),
      toAmount:
        hasAmount && amountUnits ? amountUnits : keysignPayload.toAmount,
    })
  } else if (isUnmerge) {
    let contractAddress: string

    const reverseLookup = mirrorRecord(
      kujiraCoinMigratedToThorChainDestinationId
    )
    const tokenKey = reverseLookup[shouldBePresent(coin.id)]
    if (tokenKey) {
      contractAddress = kujiraCoinThorChainMergeContracts[tokenKey]
    } else {
      throw new Error(`Unknown unmerge contract for token: ${coin.ticker}`)
    }

    keysignPayload = create(KeysignPayloadSchema, {
      ...keysignPayload,
      toAddress: contractAddress,
      toAmount: toChainAmount(
        shouldBePresent(amount),
        coin.decimals
      ).toString(),
    })
  } else if (!isOneOf(action, ['vote'])) {
    if (hasAmount && amountUnits) {
      keysignPayload = create(KeysignPayloadSchema, {
        ...keysignPayload,
        toAmount: amountUnits,
      })
    }
  }

  return keysignPayload
}
