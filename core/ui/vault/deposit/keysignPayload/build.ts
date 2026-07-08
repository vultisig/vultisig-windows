import { create } from '@bufbuild/protobuf'
import { buildQBTCDirectPayload } from '@core/ui/qbtc/dapp/buildQBTCDirectPayload'
import { QbtcDappMessage } from '@core/ui/qbtc/dapp/encodeAnyMessage'
import {
  qbtcChainId,
  qbtcDefaultFeeAmount,
  qbtcFeeDenom,
} from '@core/ui/qbtc/dapp/qbtcDirectConstants'
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
import { getCosmosChainId } from '@vultisig/core-chain/chains/cosmos/chainInfo'
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
import { solanaConfig } from '@vultisig/core-chain/chains/solana/solanaConfig'
import { fetchSolanaRentReserve } from '@vultisig/core-chain/chains/solana/staking/rpc'
import { buildUnsignedStakingTx } from '@vultisig/core-chain/chains/solana/staking/tx/buildUnsignedStakingTx'
import { SolanaStakingPayload } from '@vultisig/core-chain/chains/solana/staking/tx/stakingPayload'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { getDenom } from '@vultisig/core-chain/coin/utils/getDenom'
import { getChainSpecific } from '@vultisig/core-mpc/keysign/chainSpecific'
import { getBlockchainSpecificValue } from '@vultisig/core-mpc/keysign/chainSpecific/KeysignChainSpecific'
import { getKeysignUtxoInfo } from '@vultisig/core-mpc/keysign/utxo/getKeysignUtxoInfo'
import { KeysignLibType } from '@vultisig/core-mpc/mpcLib'
import { toCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { TransactionType } from '@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import {
  CosmosCoinSchema,
  SignDirectSchema,
  SignSolanaSchema,
  WasmExecuteContractPayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { attempt, withFallback } from '@vultisig/lib-utils/attempt'
import { match } from '@vultisig/lib-utils/match'
import { maxBigInt } from '@vultisig/lib-utils/math/maxBigInt'
import { mirrorRecord } from '@vultisig/lib-utils/record/mirrorRecord'
import { FieldValues } from 'react-hook-form'

import {
  ChainAction,
  CosmosStakingAction,
  cosmosStakingActions,
  SolanaStakingAction,
  solanaStakingActions,
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
  toEncodeObjects,
} from './cosmosStaking/encodeStakingMsgs'
import { scaleCosmosStakingFee } from './cosmosStaking/scaleCosmosStakingFee'

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
  /**
   * WalletCore public key for ECDSA/EdDSA chains. `null` for MLDSA chains
   * (e.g. QBTC), which have no WalletCore key type — those pass the hex key
   * via {@link BuildDepositKeysignPayloadInput.hexPublicKeyOverride} instead.
   */
  publicKey: PublicKey | null
  /** Hex MLDSA public key (`vault.publicKeyMldsa`) for MLDSA chains. */
  hexPublicKeyOverride?: string
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
  hexPublicKeyOverride,
  libType,
}: BuildDepositKeysignPayloadInput) => {
  const hexPublicKey =
    hexPublicKeyOverride ??
    (publicKey ? Buffer.from(publicKey.data()).toString('hex') : undefined)
  if (!hexPublicKey) {
    throw new Error(
      'buildDepositKeysignPayload requires publicKey or hexPublicKeyOverride'
    )
  }

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
      hexPublicKey,
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
      hexPublicKey,
      keysignPayload,
    })
  }

  if (isOneOf(action, solanaStakingActions)) {
    return applySolanaStakingSignData({
      action: action as SolanaStakingAction,
      coin,
      depositData,
      amountUnits,
      hexPublicKey,
      walletCore,
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

// QBTC signs Cosmos staking txs with ML-DSA (~2.4 KB signature) rather than
// secp256k1. `MsgBeginRedelegate` — the heaviest single-msg staking path —
// out-of-gasses against the Terra-family floor, so QBTC requests 800k. The fee
// is unchanged: qbtc-testnet has no minimum gas price and enforces a flat
// `min_tx_fee`, and `block.max_gas = -1`, so the larger budget is free.
const qbtcStakingBaseGasLimit = 800_000n

const getQbtcStakingGasLimit = (msgCount: number): bigint => {
  const n = BigInt(Math.max(1, msgCount))
  // Mirror the Terra helper's msg-count scaling: each extra msg (bulk
  // `claim_rewards`) adds roughly a quarter of the base cost.
  return qbtcStakingBaseGasLimit + ((n - 1n) * qbtcStakingBaseGasLimit) / 4n
}

type ApplyCosmosStakingSignDataInput = {
  action: CosmosStakingAction
  coin: AccountCoin
  depositData: FieldValues
  amountUnits: string | undefined
  /** WalletCore key for Terra-family chains; `null` for QBTC (ML-DSA). */
  publicKey: PublicKey | null
  /** Hex public key (compressed secp256k1 or ML-DSA) for the signer info. */
  hexPublicKey: string
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
  hexPublicKey,
  keysignPayload,
}: ApplyCosmosStakingSignDataInput) => {
  const isQbtc = coin.chain === Chain.QBTC
  if (!isQbtc && !isCosmosStakingChain(coin.chain)) {
    throw new Error(
      `Cosmos staking action '${action}' is only supported on Terra-family chains and QBTC, got ${coin.chain}`
    )
  }

  const blockchainSpecific = keysignPayload.blockchainSpecific
  if (blockchainSpecific.case !== 'cosmosSpecific') {
    throw new Error(
      `Cosmos staking requires cosmosSpecific blockchainSpecific, got ${blockchainSpecific.case}`
    )
  }
  const { sequence, gas, accountNumber } = blockchainSpecific.value

  const input = buildCosmosStakingInput({ action, depositData, amountUnits })
  // Bulk `claim_rewards` packs one `MsgWithdrawDelegatorReward` per
  // validator; every other action is a single-msg tx. The gas-limit helper
  // scales its base limit by msg count.
  const msgCount =
    input.action === 'claim_rewards' ? input.validatorAddresses.length : 1

  // Each branch produces the proto-direct `bodyBytes` / `authInfoBytes` pair
  // as base64 strings ready for `SignDirect`. QBTC builds them via its manual
  // ML-DSA protobuf path (no WalletCore key); Terra-family chains use the
  // shared secp256k1 encoder.
  const { bodyBytes, authInfoBytes, chainId } = isQbtc
    ? (() => {
        const gasLimit = getQbtcStakingGasLimit(msgCount)
        // `toEncodeObjects` returns cosmjs `EncodeObject[]` ({ typeUrl, value });
        // map to the QBTC dApp message shape so the proto encoder consumes the
        // staking msgs (the typeUrls are registered in `messageRegistry`).
        const messages: QbtcDappMessage[] = toEncodeObjects({
          input,
          delegatorAddress: coin.address,
          denom: qbtcFeeDenom,
        }).map(({ typeUrl, value }) => ({ typeUrl, value }))
        const { bodyBytes, authInfoBytes } = buildQBTCDirectPayload({
          messages,
          hexPublicKey,
          sequence,
          fee: {
            // qbtc-testnet enforces a flat `min_tx_fee`; keep the fee at that
            // minimum regardless of msg count (no minimum gas price).
            amount: [{ denom: qbtcFeeDenom, amount: qbtcDefaultFeeAmount }],
            gas: gasLimit.toString(),
          },
        })
        return { bodyBytes, authInfoBytes, chainId: qbtcChainId }
      })()
    : (() => {
        // `isCosmosStakingChain` narrowed `coin.chain`, but `coin` itself is
        // still typed as AccountCoin (chain: Chain). Re-form the CoinKey
        // explicitly so the SDK helpers that demand `CoinKey<CosmosChain>`
        // accept it.
        const stakingChain = coin.chain as IbcEnabledCosmosChain
        const cosmosCoin = { ...coin, chain: stakingChain }
        const feeDenom = cosmosFeeCoinDenom[stakingChain]
        const stakingDenom = getDenom(cosmosCoin as CoinKey<CosmosChain>)
        const gasLimit = getCosmosStakingGasLimit({
          chain: stakingChain,
          msgCount,
        })
        // `gas` from chainSpecific is the fee for a single-msg tx. For bulk
        // `claim_rewards` we scale the fee by the same `msgCount`-aware ratio
        // the gas-limit helper uses, so the gas-price the chain sees doesn't
        // drop below the per-byte minimum when N is large. Single-msg actions
        // keep the chainSpecific fee unchanged.
        const singleMsgGasLimit = getCosmosStakingGasLimit({
          chain: stakingChain,
        })
        const feeScale = scaleCosmosStakingFee({
          gas,
          gasLimit,
          singleMsgGasLimit,
        })
        const feeAmount = { denom: feeDenom, amount: feeScale.toString() }
        const built = buildStakingSignDirectBytes({
          input,
          delegatorAddress: coin.address,
          denom: stakingDenom,
          publicKey: shouldBePresent(publicKey, 'publicKey').data(),
          sequence,
          feeAmount,
          gasLimit,
        })
        return {
          bodyBytes: toBase64(built.bodyBytes),
          authInfoBytes: toBase64(built.authInfoBytes),
          chainId: getCosmosChainId(stakingChain),
        }
      })()

  // `toAmount` drives the "Sent X" amount on the verify + Done screens. Set it
  // to the user-input amount in base units for the actions that move tokens.
  // `claim_rewards` carries no amount, so it stays at 0.
  const toAmount = input.action === 'claim_rewards' ? '0' : (amountUnits ?? '0')
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
      // The cosmos signing resolver derives chainId itself via
      // `getTwChainId({ walletCore, chain })`, so this field is decorative
      // for the in-app path — but we still set it correctly so any
      // downstream consumer (logging, debugging, dApp re-broadcast) sees
      // the right domain on the payload instead of an empty string.
      value: create(SignDirectSchema, {
        chainId,
        bodyBytes,
        authInfoBytes,
        // Required by the QBTC ML-DSA keysign path, which derives the SignDoc
        // from these bytes + accountNumber. Decorative for the Terra-family
        // WalletCore path (it reads accountNumber from cosmosSpecific), but
        // set it for both so the payload is self-describing.
        accountNumber: accountNumber.toString(),
      }),
    },
  })
}

type ApplySolanaStakingSignDataInput = {
  action: SolanaStakingAction
  coin: AccountCoin
  depositData: FieldValues
  amountUnits?: string
  hexPublicKey: string
  walletCore: WalletCore
  keysignPayload: ReturnType<typeof create<typeof KeysignPayloadSchema>>
}

/**
 * Resolves the `signSolana` artefact for a Solana deactivate / withdraw op. The
 * stake account + amount live on the local-only deposit form, so the initiating
 * device builds the unsigned transaction ONCE here (pinning the recent
 * blockhash) and relays the raw bytes via `SignSolana.rawTransactions`. Every
 * co-signing device signs the byte-identical message through the raw-transaction
 * path — the MPC byte-parity guarantee. Mirrors iOS `SolanaStakingSignDataResolver`.
 */
const applySolanaStakingSignData = async ({
  action,
  coin,
  depositData,
  amountUnits,
  hexPublicKey,
  walletCore,
  keysignPayload,
}: ApplySolanaStakingSignDataInput) => {
  if (coin.chain !== Chain.Solana) {
    throw new Error(
      `Solana staking action '${action}' is only supported on Solana, got ${coin.chain}`
    )
  }

  const { recentBlockHash, priorityFee, computeLimit } =
    getBlockchainSpecificValue(
      keysignPayload.blockchainSpecific,
      'solanaSpecific'
    )

  const stakeAccount = depositData['stakeAccount']
  const validatorAddress = depositData['validatorAddress']
  const amount = amountUnits ? BigInt(amountUnits) : 0n
  // Delegate funds the new stake account with the entered amount PLUS the
  // rent-exempt reserve, so the active stake equals the entered amount. Read
  // live (cheap, rarely changes) only for the delegate path.
  const rentReserve =
    action === 'solana_delegate' ? await fetchSolanaRentReserve() : 0n

  const requireStakeAccount = (): string => {
    if (typeof stakeAccount !== 'string' || stakeAccount.length === 0) {
      throw new Error(`Solana staking '${action}' requires 'stakeAccount'`)
    }
    return stakeAccount
  }

  const requireValidator = (): string => {
    if (typeof validatorAddress !== 'string' || validatorAddress.length === 0) {
      throw new Error(`Solana staking '${action}' requires 'validatorAddress'`)
    }
    return validatorAddress
  }

  const { payload, toAddress, toAmount } = match<
    SolanaStakingAction,
    { payload: SolanaStakingPayload; toAddress: string; toAmount: string }
  >(action, {
    solana_delegate: () => {
      const votePubkey = requireValidator()
      // `lamports` is the stake-account FUNDING: the delegated amount plus the
      // rent-exempt reserve, so the active stake equals the entered amount.
      return {
        payload: {
          op: 'delegate',
          votePubkey,
          lamports: amount + rentReserve,
        } as const,
        toAddress: votePubkey,
        toAmount: amount.toString(),
      }
    },
    solana_unstake: () => {
      const account = requireStakeAccount()
      return {
        payload: { op: 'unstake', stakeAccount: account } as const,
        toAddress: account,
        toAmount: '0',
      }
    },
    solana_withdraw: () => {
      const account = requireStakeAccount()
      return {
        payload: {
          op: 'withdraw',
          stakeAccount: account,
          lamports: amount,
        } as const,
        toAddress: account,
        toAmount: amount.toString(),
      }
    },
    // Move-stake step 1: deactivate the account (byte-identical to a plain
    // deactivate). No amount; the whole account cools down before re-delegation.
    solana_move_stake: () => {
      const account = requireStakeAccount()
      return {
        payload: { op: 'moveStakeDeactivate', stakeAccount: account } as const,
        toAddress: account,
        toAmount: '0',
      }
    },
    // Move-stake step 2: re-delegate the cooled-down account to validator B. The
    // existing account is set explicitly so wallet-core re-delegates it rather
    // than deriving a fresh one.
    solana_finish_move: () => {
      const account = requireStakeAccount()
      const votePubkey = requireValidator()
      return {
        payload: {
          op: 'moveStakeRedelegate',
          stakeAccount: account,
          votePubkey,
          lamports: amount,
        } as const,
        toAddress: votePubkey,
        toAmount: amount.toString(),
      }
    },
  })

  const rawTransaction = buildUnsignedStakingTx({
    walletCore,
    payload,
    sender: coin.address,
    hexPublicKey,
    recentBlockHash,
    // Floor at the config minimum so co-signers all encode the same
    // `setComputeUnitPrice` instruction when the wire value is missing.
    priorityFeePrice: maxBigInt(
      priorityFee ? BigInt(priorityFee) : 0n,
      BigInt(solanaConfig.priorityFeePrice)
    ),
    priorityFeeLimit: computeLimit
      ? Number(computeLimit)
      : solanaConfig.priorityFeeLimit,
  })

  return create(KeysignPayloadSchema, {
    ...keysignPayload,
    contractPayload: { case: undefined },
    memo: '',
    toAddress,
    toAmount,
    signData: {
      case: 'signSolana',
      value: create(SignSolanaSchema, { rawTransactions: [rawTransaction] }),
    },
  })
}
