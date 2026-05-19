import { create } from '@bufbuild/protobuf'
import { toBase64 } from '@cosmjs/encoding'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'
import { toChainAmount } from '@vultisig/core-chain/amount/toChainAmount'
import {
  Chain,
  CosmosChain,
  IbcEnabledCosmosChain,
} from '@vultisig/core-chain/Chain'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { cosmosFeeCoinDenom } from '@vultisig/core-chain/chains/cosmos/cosmosFeeCoinDenom'
import { getCosmosStakingGasLimit } from '@vultisig/core-chain/chains/cosmos/cosmosGasLimitRecord'
import { getThorchainInboundAddress } from '@vultisig/core-chain/chains/cosmos/thor/getThorchainInboundAddress'
import {
  kujiraCoinMigratedToThorChainDestinationId,
  kujiraCoinThorChainMergeContracts,
} from '@vultisig/core-chain/chains/cosmos/thor/kujira-merge'
import { thorchainLpChainCode } from '@vultisig/core-chain/chains/cosmos/thor/thorchainLp'
import {
  yieldBearingAssetsAffiliateAddress,
  yieldBearingAssetsAffiliateContract,
  yieldBearingTokensIdToContractMap,
  yieldContractsByBaseDenom,
} from '@vultisig/core-chain/chains/cosmos/thor/yield-bearing-tokens/config'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { getDenom } from '@vultisig/core-chain/coin/utils/getDenom'
import { getChainSpecific } from '@vultisig/core-mpc/keysign/chainSpecific'
import { getKeysignUtxoInfo } from '@vultisig/core-mpc/keysign/utxo/getKeysignUtxoInfo'
import { KeysignLibType } from '@vultisig/core-mpc/mpcLib'
import { toCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { TransactionType } from '@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import {
  CosmosCoinSchema,
  SignDirectSchema,
  WasmExecuteContractPayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { attempt, withFallback } from '@vultisig/lib-utils/attempt'
import { match } from '@vultisig/lib-utils/match'
import { mirrorRecord } from '@vultisig/lib-utils/record/mirrorRecord'
import { FieldValues } from 'react-hook-form'

import {
  ChainAction,
  CosmosStakingAction,
  cosmosStakingActions,
} from '../ChainAction'
import { resolvers, selectStakeId } from '../staking/resolvers'
import {
  NativeTcyInput,
  RujiInput,
  StakeKind,
  StcyInput,
} from '../staking/types'
import {
  buildStakingSignDirectBytes,
  type CosmosStakingInput,
} from './cosmosStaking/encodeStakingMsgs'

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
  libType: KeysignLibType
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

  const isNonThorChainLp =
    action === 'add_thor_lp' && coin.chain !== Chain.THORChain

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
    toAmount: hasAmount && amountUnits ? amountUnits : '0',
  })

  if (isNonThorChainLp) {
    const inboundAddresses = await getThorchainInboundAddress()
    const chainCode = shouldBePresent(
      thorchainLpChainCode[coin.chain],
      `THORChain LP chain code for ${coin.chain}`
    )
    const inbound = shouldBePresent(
      inboundAddresses.find(
        a => a.chain.toUpperCase() === chainCode.toUpperCase()
      ),
      `THORChain inbound address for ${coin.chain}`
    )

    if (inbound.halted) {
      throw new Error(`${coin.chain} chain is currently halted on THORChain`)
    }
    if (inbound.chain_lp_actions_paused) {
      throw new Error(
        `LP actions are currently paused for ${coin.chain} on THORChain`
      )
    }

    keysignPayload = create(KeysignPayloadSchema, {
      ...keysignPayload,
      toAddress: inbound.address,
      toAmount: hasAmount && amountUnits ? amountUnits : '0',
    })
  }

  keysignPayload.blockchainSpecific = await getChainSpecific({
    keysignPayload,
    walletCore,
    isDeposit: !isNonThorChainLp,
    transactionType,
  })

  if (isOneOf(action, cosmosStakingActions)) {
    return applyCosmosStakingSignData({
      action: action as CosmosStakingAction,
      coin,
      depositData,
      amountUnits,
      publicKey,
      keysignPayload,
    })
  }

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
      })

      return keysignPayload
    }
  }

  if (action === 'add_thor_lp') {
    if (isNonThorChainLp) {
      return keysignPayload
    }

    keysignPayload = create(KeysignPayloadSchema, {
      ...keysignPayload,
      contractPayload: { case: undefined },
      toAddress: '',
      toAmount: hasAmount && amountUnits ? amountUnits : '0',
    })
    return keysignPayload
  }

  if (action === 'remove_thor_lp') {
    const dustAmount = toChainAmount(0.02, coin.decimals).toString()
    keysignPayload = create(KeysignPayloadSchema, {
      ...keysignPayload,
      contractPayload: { case: undefined },
      toAddress: '',
      toAmount: dustAmount,
    })
    return keysignPayload
  }

  // TRON freeze/unfreeze: self-transaction with amount in SUN
  if (isOneOf(action, ['freeze', 'unfreeze'])) {
    keysignPayload = create(KeysignPayloadSchema, {
      ...keysignPayload,
      contractPayload: { case: undefined },
      toAddress: coin.address,
      toAmount: shouldBePresent(amountUnits, 'Amount'),
    })

    return keysignPayload
  }

  if (
    isOneOf(action, [
      'leave',
      'unbond',
      'bond',
      'ibc_transfer',
      'switch',
      'merge',
    ])
  ) {
    // THORChain UNBOND requires zero coin amount - the unbond amount is only in the memo
    const toAmountForAction =
      action === 'unbond'
        ? '0'
        : hasAmount && amountUnits
          ? amountUnits
          : keysignPayload.toAmount

    keysignPayload = create(KeysignPayloadSchema, {
      ...keysignPayload,
      contractPayload: { case: undefined },
      toAddress: isTonFunction
        ? shouldBePresent(validatorAddress)
        : (receiver ?? keysignPayload.toAddress),
      toAmount: toAmountForAction,
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

  if (
    coin.chain === Chain.THORChain &&
    (keysignPayload.memo?.toUpperCase().startsWith('UNBOND') ?? false)
  ) {
    keysignPayload = create(KeysignPayloadSchema, {
      ...keysignPayload,
      toAmount: '0',
    })
  }

  return keysignPayload
}

const cosmosStakingChains: readonly IbcEnabledCosmosChain[] = [
  Chain.Terra,
  Chain.TerraClassic,
]

const isCosmosStakingChain = (chain: Chain): chain is IbcEnabledCosmosChain =>
  (cosmosStakingChains as readonly Chain[]).includes(chain)

type ApplyCosmosStakingSignDataInput = {
  action: CosmosStakingAction
  coin: AccountCoin
  depositData: FieldValues
  amountUnits: string | undefined
  publicKey: PublicKey
  keysignPayload: ReturnType<typeof create<typeof KeysignPayloadSchema>>
}

const buildCosmosStakingInput = ({
  action,
  depositData,
  amountUnits,
}: {
  action: CosmosStakingAction
  depositData: FieldValues
  amountUnits: string | undefined
}): CosmosStakingInput => {
  if (action === 'delegate') {
    return {
      action: 'delegate',
      validatorAddress: shouldBePresent(
        depositData.validatorAddress as string | undefined,
        'validatorAddress'
      ),
      amount: shouldBePresent(amountUnits, 'amount'),
    }
  }
  if (action === 'undelegate') {
    return {
      action: 'undelegate',
      validatorAddress: shouldBePresent(
        depositData.validatorAddress as string | undefined,
        'validatorAddress'
      ),
      amount: shouldBePresent(amountUnits, 'amount'),
    }
  }
  if (action === 'redelegate') {
    return {
      action: 'redelegate',
      srcValidatorAddress: shouldBePresent(
        depositData.srcValidatorAddress as string | undefined,
        'srcValidatorAddress'
      ),
      dstValidatorAddress: shouldBePresent(
        depositData.validatorAddress as string | undefined,
        'validatorAddress'
      ),
      amount: shouldBePresent(amountUnits, 'amount'),
    }
  }
  // claim_rewards
  const validatorAddresses = depositData.validatorAddresses as
    | string[]
    | undefined
  if (!validatorAddresses || validatorAddresses.length === 0) {
    throw new Error(
      'claim_rewards requires validatorAddresses (single-validator or bulk-claim list)'
    )
  }
  return { action: 'claim_rewards', validatorAddresses }
}

const applyCosmosStakingSignData = ({
  action,
  coin,
  depositData,
  amountUnits,
  publicKey,
  keysignPayload,
}: ApplyCosmosStakingSignDataInput) => {
  if (!isCosmosStakingChain(coin.chain)) {
    throw new Error(
      `Cosmos staking action '${action}' is only supported on Terra-family chains, got ${coin.chain}`
    )
  }

  const blockchainSpecific = keysignPayload.blockchainSpecific
  if (blockchainSpecific.case !== 'cosmosSpecific') {
    throw new Error(
      `Cosmos staking requires cosmosSpecific blockchainSpecific, got ${blockchainSpecific.case}`
    )
  }
  const { sequence, gas } = blockchainSpecific.value

  // `isCosmosStakingChain` narrowed `coin.chain`, but `coin` itself is still
  // typed as AccountCoin (chain: Chain). Re-form the CoinKey explicitly so the
  // SDK helpers that demand `CoinKey<CosmosChain>` accept it.
  const cosmosCoin = { ...coin, chain: coin.chain }
  const input = buildCosmosStakingInput({ action, depositData, amountUnits })

  const feeDenom = cosmosFeeCoinDenom[coin.chain]
  const stakingDenom = getDenom(cosmosCoin as CoinKey<CosmosChain>)
  // Bulk `claim_rewards` packs one `MsgWithdrawDelegatorReward` per
   // validator; every other action is a single-msg tx. The SDK helper
   // scales its base limit by msg count.
  const msgCount =
    input.action === 'claim_rewards' ? input.validatorAddresses.length : 1
  const gasLimit = getCosmosStakingGasLimit({ chain: coin.chain, msgCount })
  // Total fee in base units = gas (set by chainSpecific).
  const feeAmount = { denom: feeDenom, amount: gas.toString() }

  const { bodyBytes, authInfoBytes } = buildStakingSignDirectBytes({
    input,
    delegatorAddress: coin.address,
    denom: stakingDenom,
    publicKey: publicKey.data(),
    sequence,
    feeAmount,
    gasLimit,
  })

  // `toAmount` drives the "Sent X LUNA" amount on the verify + Done
   // screens. Set it to the user-input amount in base units for the actions
   // that move tokens. `claim_rewards` carries no amount, so it stays at 0.
  const toAmount =
    input.action === 'claim_rewards' ? '0' : (amountUnits ?? '0')
  // `toAddress` likewise drives "To" in the verify screen — show the
  // validator (or destination validator for redelegate) instead of an empty
  // string so consumers that don't know about cosmos staking specifics
  // still display something useful.
  const toAddress =
    input.action === 'delegate' || input.action === 'undelegate'
      ? input.validatorAddress
      : input.action === 'redelegate'
        ? input.dstValidatorAddress
        : ''

  return create(KeysignPayloadSchema, {
    ...keysignPayload,
    contractPayload: { case: undefined },
    memo: '',
    toAddress,
    toAmount,
    signData: {
      case: 'signDirect',
      value: create(SignDirectSchema, {
        chainId: '',
        bodyBytes: toBase64(bodyBytes),
        authInfoBytes: toBase64(authInfoBytes),
      }),
    },
  })
}
