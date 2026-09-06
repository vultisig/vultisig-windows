import { fromBase64 } from '@cosmjs/encoding'
import {
  ComputeBudgetProgram,
  PublicKey,
  StakeProgram,
  SystemProgram,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js'
import { Chain, CosmosChain } from '@vultisig/core-chain/Chain'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { CosmosMsgType } from '@vultisig/core-chain/chains/cosmos/cosmosMsgTypes'
import { ThorchainInboundAddress } from '@vultisig/core-chain/chains/cosmos/thor/getThorchainInboundAddress'
import { thorchainLpChainCode } from '@vultisig/core-chain/chains/cosmos/thor/thorchainLp'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { TransactionType } from '@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { attempt } from '@vultisig/lib-utils/attempt'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { MsgWithdrawDelegatorReward } from 'cosmjs-types/cosmos/distribution/v1beta1/tx'
import {
  MsgVote as MsgVoteV1,
  MsgVoteWeighted as MsgVoteWeightedV1,
} from 'cosmjs-types/cosmos/gov/v1/tx'
import {
  MsgVote as MsgVoteV1Beta1,
  MsgVoteWeighted as MsgVoteWeightedV1Beta1,
} from 'cosmjs-types/cosmos/gov/v1beta1/tx'
import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgUndelegate,
} from 'cosmjs-types/cosmos/staking/v1beta1/tx'
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'

export type DecodedOperation =
  | 'transfer'
  | 'swap'
  | 'approve'
  | 'stake'
  | 'unstake'
  | 'bond'
  | 'unbond'
  | 'rebond'
  | 'leave'
  | 'delegate'
  | 'undelegate'
  | 'redelegate'
  | 'claimRewards'
  | 'mint'
  | 'redeem'
  | 'withdrawStake'
  | 'addLiquidity'
  | 'removeLiquidity'
  | 'merge'
  | 'unmerge'
  | 'ibcTransfer'
  | 'vote'
  | 'securedAssetDeposit'
  | 'securedAssetWithdraw'
  | 'switchChain'
  | 'limitOrderPlacement'
  | 'limitOrderCancel'
  | 'contractCall'
  | 'unknown'

type DecodedAmount =
  | {
      kind: 'units'
      raw: bigint
      asset: 'transactionCoin' | 'chainNative' | { denom: string }
    }
  | { kind: 'accountFunding'; raw: bigint }
  | { kind: 'fraction'; basisPoints: number }
  | { kind: 'unstated' }

type DecodedEvidence =
  | 'signedData'
  | 'wasmExecuteMsg'
  | 'memo'
  | 'wireTransactionType'
  | 'unread'

type DecodedTransaction = {
  operation: DecodedOperation
  amount: DecodedAmount
  evidence: DecodedEvidence
  counterparty?: string
}

export type SignedTransactionDecoderContext = {
  thorchainInboundAddresses?: readonly Pick<
    ThorchainInboundAddress,
    'address' | 'chain' | 'router'
  >[]
}

const unreadable: DecodedTransaction = {
  operation: 'unknown',
  amount: { kind: 'unstated' },
  evidence: 'unread',
}

const positiveUnits = (
  value: string | bigint | undefined,
  asset: Extract<DecodedAmount, { kind: 'units' }>['asset']
): DecodedAmount => {
  if (value === undefined) return { kind: 'unstated' }

  const result = attempt(() => BigInt(value))
  if ('error' in result || result.data <= 0n) return { kind: 'unstated' }

  return { kind: 'units', raw: result.data, asset }
}

const transactionAmount = (payload: KeysignPayload): DecodedAmount => {
  const sendsMax =
    (payload.blockchainSpecific.case === 'utxoSpecific' ||
      payload.blockchainSpecific.case === 'cardano' ||
      payload.blockchainSpecific.case === 'tonSpecific') &&
    payload.blockchainSpecific.value.sendMaxAmount

  return sendsMax
    ? { kind: 'unstated' }
    : positiveUnits(payload.toAmount, 'transactionCoin')
}

const decoded = (
  operation: DecodedOperation,
  amount: DecodedAmount,
  evidence: DecodedEvidence,
  counterparty?: string
): DecodedTransaction => ({ operation, amount, evidence, counterparty })

const executeActionByKey = {
  bond: 'stake',
  deposit: 'stake',
  unbond: 'unstake',
  withdraw: 'unstake',
  claim: 'claimRewards',
  withdraw_rewards: 'claimRewards',
} as const satisfies Record<string, DecodedOperation>

const vaultActionByKey = {
  deposit: 'mint',
  withdraw: 'redeem',
} as const satisfies Record<string, DecodedOperation>

const uniqueMappedAction = (
  value: Record<string, unknown>,
  actions: Record<string, DecodedOperation>
): DecodedOperation | undefined => {
  const matches = Object.keys(value).flatMap(key =>
    actions[key] ? [actions[key]] : []
  )
  return matches.length === 1 ? matches[0] : undefined
}

const parseJsonRecord = (
  value: string
): Record<string, unknown> | undefined => {
  const result = attempt(() => JSON.parse(value) as unknown)
  if (
    'error' in result ||
    result.data === null ||
    Array.isArray(result.data) ||
    typeof result.data !== 'object'
  ) {
    return undefined
  }
  return result.data as Record<string, unknown>
}

const decodeWasm = (
  payload: KeysignPayload,
  chain: Chain
): DecodedTransaction | undefined => {
  if (
    chain !== Chain.THORChain ||
    payload.contractPayload.case !== 'wasmExecuteContractPayload'
  ) {
    return undefined
  }

  const wasm = payload.contractPayload.value
  const root = parseJsonRecord(wasm.executeMsg)
  if (!root) {
    return decoded(
      'contractCall',
      { kind: 'unstated' },
      'wasmExecuteMsg',
      wasm.contractAddress
    )
  }

  let operation: DecodedOperation | undefined
  const execute = root['execute']
  if (
    execute &&
    typeof execute === 'object' &&
    !Array.isArray(execute) &&
    typeof (execute as Record<string, unknown>)['msg'] === 'string'
  ) {
    const innerResult = attempt(() =>
      Buffer.from(
        (execute as Record<string, unknown>)['msg'] as string,
        'base64'
      ).toString('utf8')
    )
    if ('data' in innerResult && typeof innerResult.data === 'string') {
      const inner = parseJsonRecord(innerResult.data)
      if (inner) operation = uniqueMappedAction(inner, vaultActionByKey)
    }
  } else {
    operation = uniqueMappedAction(root, executeActionByKey)
    if (!operation) {
      const nestedMatches = Object.values(root).flatMap(value => {
        if (!value || Array.isArray(value) || typeof value !== 'object')
          return []
        const match = uniqueMappedAction(
          value as Record<string, unknown>,
          executeActionByKey
        )
        return match ? [match] : []
      })
      if (nestedMatches.length === 1) operation = nestedMatches[0]
    }
  }

  if (!operation) {
    return decoded(
      'contractCall',
      { kind: 'unstated' },
      'wasmExecuteMsg',
      wasm.contractAddress
    )
  }

  const amount = (() => {
    if (operation === 'mint') return { kind: 'unstated' } as const
    if (wasm.coins.length !== 1) return { kind: 'unstated' } as const
    const [coin] = wasm.coins
    return positiveUnits(coin.amount, { denom: coin.denom })
  })()

  return decoded(operation, amount, 'wasmExecuteMsg', wasm.contractAddress)
}

const signDirectOperation = (
  typeUrl: string,
  value: Uint8Array
): Omit<DecodedTransaction, 'evidence'> | undefined => {
  if (typeUrl === CosmosMsgType.MSG_DELEGATE_URL) {
    const result = attempt(() => MsgDelegate.decode(value))
    if ('error' in result || !result.data.validatorAddress) return undefined
    const amount = result.data.amount
    return {
      operation: 'delegate',
      amount: amount
        ? positiveUnits(amount.amount, { denom: amount.denom })
        : { kind: 'unstated' },
      counterparty: result.data.validatorAddress,
    }
  }

  if (typeUrl === CosmosMsgType.MSG_UNDELEGATE_URL) {
    const result = attempt(() => MsgUndelegate.decode(value))
    if ('error' in result || !result.data.validatorAddress) return undefined
    const amount = result.data.amount
    return {
      operation: 'undelegate',
      amount: amount
        ? positiveUnits(amount.amount, { denom: amount.denom })
        : { kind: 'unstated' },
      counterparty: result.data.validatorAddress,
    }
  }

  if (typeUrl === CosmosMsgType.MSG_BEGIN_REDELEGATE_URL) {
    const result = attempt(() => MsgBeginRedelegate.decode(value))
    if ('error' in result || !result.data.validatorDstAddress) return undefined
    const amount = result.data.amount
    return {
      operation: 'redelegate',
      amount: amount
        ? positiveUnits(amount.amount, { denom: amount.denom })
        : { kind: 'unstated' },
      counterparty: result.data.validatorDstAddress,
    }
  }

  if (typeUrl === CosmosMsgType.MSG_WITHDRAW_DELEGATOR_REWARD_URL) {
    const result = attempt(() => MsgWithdrawDelegatorReward.decode(value))
    if ('error' in result || !result.data.validatorAddress) return undefined
    return {
      operation: 'claimRewards',
      amount: { kind: 'unstated' },
      counterparty: result.data.validatorAddress,
    }
  }

  if (typeUrl === '/cosmos.bank.v1beta1.MsgSend') {
    const result = attempt(() => MsgSend.decode(value))
    if ('error' in result || !result.data.toAddress) return undefined
    const amounts = result.data.amount
    if (amounts.some(coin => !coin.denom || !/^\d+$/.test(coin.amount))) {
      return undefined
    }
    return {
      operation: 'transfer',
      amount:
        amounts.length === 1
          ? positiveUnits(amounts[0].amount, { denom: amounts[0].denom })
          : { kind: 'unstated' },
      counterparty: result.data.toAddress,
    }
  }

  if (typeUrl === CosmosMsgType.MSG_TRANSFER_URL) {
    const result = attempt(() => MsgTransfer.decode(value))
    if ('error' in result || !result.data.receiver) return undefined
    const token = result.data.token
    if (token && (!token.denom || !/^\d+$/.test(token.amount))) return undefined
    return {
      operation: 'ibcTransfer',
      amount: token
        ? positiveUnits(token.amount, { denom: token.denom })
        : { kind: 'unstated' },
      counterparty: result.data.receiver,
    }
  }

  if (
    typeUrl === '/cosmos.gov.v1.MsgVote' ||
    typeUrl === '/cosmos.gov.v1beta1.MsgVote' ||
    typeUrl === '/cosmos.gov.v1.MsgVoteWeighted' ||
    typeUrl === '/cosmos.gov.v1beta1.MsgVoteWeighted'
  ) {
    const result = attempt(() => {
      if (typeUrl === '/cosmos.gov.v1.MsgVote') {
        return MsgVoteV1.decode(value)
      }
      if (typeUrl === '/cosmos.gov.v1.MsgVoteWeighted') {
        return MsgVoteWeightedV1.decode(value)
      }
      if (typeUrl === '/cosmos.gov.v1beta1.MsgVote') {
        return MsgVoteV1Beta1.decode(value)
      }
      return MsgVoteWeightedV1Beta1.decode(value)
    })
    if (
      'error' in result ||
      !result.data.voter ||
      result.data.proposalId <= 0n ||
      ('options' in result.data && result.data.options.length === 0)
    ) {
      return undefined
    }
    return { operation: 'vote', amount: { kind: 'unstated' } }
  }

  if (typeUrl === CosmosMsgType.MSG_EXECUTE_CONTRACT_URL) {
    const result = attempt(() => MsgExecuteContract.decode(value))
    if ('error' in result || !result.data.contract) return undefined
    const wasmPayload = {
      ...result.data,
      msg: Buffer.from(result.data.msg).toString('utf8'),
    }
    const root = parseJsonRecord(wasmPayload.msg)
    const operation = root
      ? uniqueMappedAction(root, executeActionByKey)
      : undefined
    if (!operation) {
      return {
        operation: 'contractCall',
        amount: { kind: 'unstated' },
        counterparty: result.data.contract,
      }
    }
    const amount =
      result.data.funds.length === 1
        ? positiveUnits(result.data.funds[0].amount, {
            denom: result.data.funds[0].denom,
          })
        : ({ kind: 'unstated' } as const)
    return { operation, amount, counterparty: result.data.contract }
  }

  return undefined
}

const decodeSignDirect = (
  payload: KeysignPayload
): DecodedTransaction | undefined => {
  if (payload.signData.case !== 'signDirect') return undefined
  const signDirect = payload.signData.value
  if (!signDirect) return undefined
  if (
    signDirect.bodyBytes.length === 0 ||
    signDirect.bodyBytes.length > 128 * 1024
  ) {
    return undefined
  }
  const bodyResult = attempt(() => {
    const bytes = fromBase64(signDirect.bodyBytes)
    if (bytes.length === 0 || bytes.length > 64 * 1024) {
      throw new Error('Cosmos body is outside decoder bounds')
    }
    return TxBody.decode(bytes)
  })
  if ('error' in bodyResult) return undefined
  if (bodyResult.data.messages.length > 64) return undefined

  const matches = bodyResult.data.messages.map(message =>
    signDirectOperation(message.typeUrl, message.value)
  )

  if (matches.length === 0 || matches.some(match => !match)) return undefined
  const proven = matches.filter(
    (match): match is Omit<DecodedTransaction, 'evidence'> => !!match
  )
  if (new Set(proven.map(match => match.operation)).size !== 1) {
    return undefined
  }
  return {
    ...proven[0],
    amount: proven.length === 1 ? proven[0].amount : { kind: 'unstated' },
    counterparty: proven.length === 1 ? proven[0].counterparty : undefined,
    evidence: 'signedData',
  }
}

const aminoOperationByType: Record<string, DecodedOperation> = {
  [CosmosMsgType.MSG_DELEGATE_URL]: 'delegate',
  'cosmos-sdk/MsgDelegate': 'delegate',
  [CosmosMsgType.MSG_UNDELEGATE_URL]: 'undelegate',
  'cosmos-sdk/MsgUndelegate': 'undelegate',
  [CosmosMsgType.MSG_BEGIN_REDELEGATE_URL]: 'redelegate',
  'cosmos-sdk/MsgBeginRedelegate': 'redelegate',
  [CosmosMsgType.MSG_WITHDRAW_DELEGATOR_REWARD_URL]: 'claimRewards',
  'cosmos-sdk/MsgWithdrawDelegationReward': 'claimRewards',
  [CosmosMsgType.MSG_TRANSFER_URL]: 'ibcTransfer',
  '/cosmos.gov.v1.MsgVote': 'vote',
  '/cosmos.gov.v1beta1.MsgVote': 'vote',
  '/cosmos.gov.v1.MsgVoteWeighted': 'vote',
  '/cosmos.gov.v1beta1.MsgVoteWeighted': 'vote',
}

const decodeSignAmino = (
  payload: KeysignPayload
): DecodedTransaction | undefined => {
  if (payload.signData.case !== 'signAmino') return undefined

  if (payload.signData.value.msgs.length > 64) return undefined

  const matches = payload.signData.value.msgs.map(message => {
    const operation = aminoOperationByType[message.type]
    if (!operation) return undefined
    const value = parseJsonRecord(message.value)
    if (!value) return undefined
    const requiredAddressKeys: Partial<Record<DecodedOperation, string[]>> = {
      delegate: ['validator_address', 'validatorAddress'],
      undelegate: ['validator_address', 'validatorAddress'],
      redelegate: ['validator_dst_address', 'validatorDstAddress'],
      claimRewards: ['validator_address', 'validatorAddress'],
      ibcTransfer: ['receiver'],
      vote: ['voter'],
    }
    const keys = requiredAddressKeys[operation]
    if (
      keys &&
      !keys.some(key => typeof value[key] === 'string' && value[key] !== '')
    ) {
      return undefined
    }
    const amountValue = value?.['amount']
    const coin = Array.isArray(amountValue)
      ? amountValue.length === 1
        ? amountValue[0]
        : undefined
      : amountValue && typeof amountValue === 'object'
        ? amountValue
        : undefined
    const denom =
      coin && typeof coin === 'object'
        ? (coin as Record<string, unknown>)['denom']
        : undefined
    const raw =
      coin && typeof coin === 'object'
        ? (coin as Record<string, unknown>)['amount']
        : undefined

    return decoded(
      operation,
      typeof denom === 'string' && typeof raw === 'string'
        ? positiveUnits(raw, { denom })
        : { kind: 'unstated' },
      'signedData'
    )
  })

  if (matches.length === 0 || matches.some(match => !match)) return undefined
  const proven = matches.filter((match): match is DecodedTransaction => !!match)
  if (new Set(proven.map(match => match.operation)).size !== 1) {
    return undefined
  }
  return {
    ...proven[0],
    amount: proven.length === 1 ? proven[0].amount : { kind: 'unstated' },
    counterparty: proven.length === 1 ? proven[0].counterparty : undefined,
  }
}

const uint32Le = (data: Uint8Array, offset = 0): number | undefined => {
  if (data.length < offset + 4) return undefined
  return new DataView(data.buffer, data.byteOffset, data.byteLength).getUint32(
    offset,
    true
  )
}

const uint64Le = (data: Uint8Array, offset: number): bigint | undefined => {
  if (data.length < offset + 8) return undefined
  return new DataView(
    data.buffer,
    data.byteOffset,
    data.byteLength
  ).getBigUint64(offset, true)
}

type SolanaInstruction = {
  programId: PublicKey
  accounts: PublicKey[]
  data: Uint8Array
}

const solanaInstructions = (raw: string): SolanaInstruction[] | undefined => {
  if (raw.length === 0 || raw.length > 16 * 1024) return undefined
  const bytes = Buffer.from(raw, 'base64')
  if (bytes.length === 0 || bytes.length > 8 * 1024) return undefined

  const versionedResult = attempt(() =>
    VersionedTransaction.deserialize(new Uint8Array(bytes))
  )
  if ('data' in versionedResult && versionedResult.data) {
    const message = versionedResult.data.message
    if (message.addressTableLookups.length > 0) return undefined
    const instructions: SolanaInstruction[] = []
    for (const instruction of message.compiledInstructions) {
      const programId = message.staticAccountKeys[instruction.programIdIndex]
      const accounts = instruction.accountKeyIndexes.map(
        index => message.staticAccountKeys[index]
      )
      if (!programId || accounts.some(account => !account)) return undefined
      instructions.push({
        programId,
        accounts,
        data: new Uint8Array(instruction.data),
      })
    }
    return instructions
  }

  const legacyResult = attempt(() => Transaction.from(bytes))
  if ('error' in legacyResult) return undefined
  return legacyResult.data.instructions.map(instruction => ({
    programId: instruction.programId,
    accounts: instruction.keys.map(key => key.pubkey),
    data: new Uint8Array(instruction.data),
  }))
}

const decodeSignSolana = (
  payload: KeysignPayload
): DecodedTransaction | undefined => {
  if (
    payload.signData.case !== 'signSolana' ||
    payload.signData.value.rawTransactions.length !== 1
  ) {
    return undefined
  }

  const instructions = solanaInstructions(
    payload.signData.value.rawTransactions[0]
  )?.filter(
    instruction => !instruction.programId.equals(ComputeBudgetProgram.programId)
  )
  if (!instructions) return undefined

  if (instructions.length === 1) {
    const [instruction] = instructions
    if (!instruction.programId.equals(StakeProgram.programId)) return undefined
    const discriminator = uint32Le(instruction.data)

    if (
      discriminator === 5 &&
      instruction.data.length === 4 &&
      instruction.accounts.length === 3
    ) {
      return decoded(
        'unstake',
        { kind: 'unstated' },
        'signedData',
        instruction.accounts[0].toBase58()
      )
    }

    if (
      discriminator === 4 &&
      instruction.data.length === 12 &&
      instruction.accounts.length === 5
    ) {
      return decoded(
        'withdrawStake',
        positiveUnits(uint64Le(instruction.data, 4), 'chainNative'),
        'signedData',
        instruction.accounts[0].toBase58()
      )
    }

    return undefined
  }

  if (instructions.length !== 3) return undefined
  const [createAccount, initialize, delegate] = instructions
  const createKind = uint32Le(createAccount.data)
  const createdStake = createAccount.accounts[1]
  const payer = createAccount.accounts[0]
  const delegateAuthority = delegate.accounts[5]
  if (
    !createAccount.programId.equals(SystemProgram.programId) ||
    !initialize.programId.equals(StakeProgram.programId) ||
    !delegate.programId.equals(StakeProgram.programId) ||
    uint32Le(initialize.data) !== 0 ||
    uint32Le(delegate.data) !== 2 ||
    initialize.accounts.length !== 2 ||
    initialize.data.length !== 116 ||
    delegate.accounts.length !== 6 ||
    delegate.data.length !== 4 ||
    !createdStake ||
    !payer ||
    !delegateAuthority ||
    payer.equals(createdStake) ||
    !createdStake.equals(initialize.accounts[0]) ||
    !initialize.accounts[0].equals(delegate.accounts[0]) ||
    !payer.equals(delegateAuthority) ||
    !Buffer.from(initialize.data.slice(4, 36)).equals(
      delegateAuthority.toBuffer()
    )
  ) {
    return undefined
  }

  const funding =
    createKind === 0
      ? createAccount.accounts.length === 2 &&
        createAccount.data.length === 52 &&
        uint64Le(createAccount.data, 12) === 200n &&
        Buffer.from(createAccount.data.slice(20, 52)).equals(
          StakeProgram.programId.toBuffer()
        )
        ? uint64Le(createAccount.data, 4)
        : undefined
      : createKind === 3
        ? (() => {
            const seedLength = uint64Le(createAccount.data, 36)
            if (seedLength === undefined || seedLength > 32n) return undefined
            const seedCount = Number(seedLength)
            const lamportsOffset = 44 + seedCount
            const spaceOffset = lamportsOffset + 8
            const ownerOffset = spaceOffset + 8
            if (
              createAccount.accounts.length !== 3 ||
              createAccount.data.length !== ownerOffset + 32 ||
              !createAccount.accounts[2].equals(payer) ||
              !Buffer.from(createAccount.data.slice(4, 36)).equals(
                payer.toBuffer()
              ) ||
              uint64Le(createAccount.data, spaceOffset) !== 200n ||
              !Buffer.from(
                createAccount.data.slice(ownerOffset, ownerOffset + 32)
              ).equals(StakeProgram.programId.toBuffer())
            ) {
              return undefined
            }
            return uint64Le(createAccount.data, lamportsOffset)
          })()
        : undefined
  if (!funding || funding <= 0n) return undefined

  return decoded(
    'delegate',
    { kind: 'accountFunding', raw: funding },
    'signedData',
    delegate.accounts[1].toBase58()
  )
}

const decodeSignedData = (
  payload: KeysignPayload,
  chain: Chain
): DecodedTransaction | undefined => {
  if (!payload.signData.case) return undefined

  if (payload.signData.case === 'signSolana') {
    return chain === Chain.Solana ? decodeSignSolana(payload) : undefined
  }

  if (payload.erc20ApprovePayload || payload.swapPayload.case) return undefined

  const cosmosChains = [...Object.values(CosmosChain), Chain.QBTC] as Chain[]
  if (!cosmosChains.includes(chain)) return undefined

  if (payload.signData.case === 'signDirect') {
    const type = transactionType(payload)
    const bodyIsActive = (() => {
      if (
        chain === Chain.Cosmos ||
        chain === Chain.Osmosis ||
        chain === Chain.Noble ||
        chain === Chain.Akash
      ) {
        return (
          type === TransactionType.UNSPECIFIED ||
          type === TransactionType.GENERIC_CONTRACT
        )
      }
      if (chain === Chain.Terra || chain === Chain.TerraClassic) return true
      if (chain === Chain.Dydx) return type !== TransactionType.VOTE
      return chain === Chain.QBTC
    })()
    if (!bodyIsActive) return undefined
  }

  return decodeSignDirect(payload) ?? decodeSignAmino(payload)
}

const transactionType = (payload: KeysignPayload): TransactionType => {
  switch (payload.blockchainSpecific.case) {
    case 'thorchainSpecific':
    case 'cosmosSpecific':
    case 'rippleSpecific':
      return payload.blockchainSpecific.value.transactionType
    default:
      return TransactionType.UNSPECIFIED
  }
}

const fraction = (value: string | undefined): DecodedAmount | undefined => {
  if (!value || !/^\d+$/.test(value)) return undefined
  const basisPoints = Number(value)
  if (
    !Number.isSafeInteger(basisPoints) ||
    basisPoints <= 0 ||
    basisPoints > 10_000
  ) {
    return undefined
  }
  return { kind: 'fraction', basisPoints }
}

const decodeTronMemo = (
  payload: KeysignPayload,
  chain: Chain
): DecodedTransaction | undefined => {
  if (
    chain !== Chain.Tron ||
    payload.contractPayload.case ||
    payload.swapPayload.case ||
    payload.erc20ApprovePayload
  ) {
    return undefined
  }
  const match = /^(FREEZE|UNFREEZE):(BANDWIDTH|ENERGY)$/.exec(
    payload.memo ?? ''
  )
  if (!match) return undefined
  return decoded(
    match[1] === 'FREEZE' ? 'stake' : 'unstake',
    positiveUnits(payload.toAmount, 'chainNative'),
    'memo'
  )
}

const decodeTonMemo = (
  payload: KeysignPayload,
  chain: Chain
): DecodedTransaction | undefined => {
  if (
    chain !== Chain.Ton ||
    payload.contractPayload.case ||
    payload.swapPayload.case ||
    payload.erc20ApprovePayload
  ) {
    return undefined
  }
  if (payload.memo === 'd' || payload.memo === 'Deposit') {
    return decoded(
      'stake',
      positiveUnits(payload.toAmount, 'chainNative'),
      'memo',
      payload.toAddress
    )
  }
  if (payload.memo === 'w' || payload.memo === 'Withdraw') {
    return decoded('unstake', { kind: 'unstated' }, 'memo', payload.toAddress)
  }
  return undefined
}

const decodeMayaMemo = (
  payload: KeysignPayload,
  chain: Chain
): DecodedTransaction | undefined => {
  if (
    chain !== Chain.MayaChain ||
    payload.contractPayload.case ||
    payload.swapPayload.case ||
    payload.erc20ApprovePayload
  )
    return undefined
  const fields = (payload.memo ?? '').split(':')
  const head = fields[0]?.toUpperCase()

  if (head === 'POOL+') {
    return decoded('stake', transactionAmount(payload), 'memo')
  }
  if (head === 'POOL-') {
    const amount = fraction(fields[1])
    return amount ? decoded('unstake', amount, 'memo') : undefined
  }
  if (head === 'BOND' || head === 'UNBOND') {
    if (fields.length < 4 || !fields[3]) return undefined
    return decoded(
      head === 'BOND' ? 'bond' : 'unbond',
      { kind: 'unstated' },
      'memo',
      fields[3]
    )
  }
  if (head === 'LEAVE' && fields[1]) {
    return decoded('leave', { kind: 'unstated' }, 'memo', fields[1])
  }
  return undefined
}

const thorMemoProvenance = (
  payload: KeysignPayload,
  chain: Chain,
  context: SignedTransactionDecoderContext
) => {
  if (
    chain === Chain.THORChain ||
    payload.swapPayload.case === 'thorchainSwapPayload'
  ) {
    return true
  }

  const chainCode = thorchainLpChainCode[chain]
  if (!chainCode || !payload.toAddress) return false

  return (context.thorchainInboundAddresses ?? []).some(inbound => {
    if (inbound.chain.toUpperCase() !== chainCode.toUpperCase()) return false
    const expected = payload.coin?.isNativeToken
      ? inbound.address
      : inbound.router
    if (!expected) return false
    return isChainOfKind(chain, 'evm')
      ? expected.toLowerCase() === payload.toAddress.toLowerCase()
      : expected === payload.toAddress
  })
}

const decodeThorMemo = (
  payload: KeysignPayload,
  chain: Chain,
  context: SignedTransactionDecoderContext
): DecodedTransaction | undefined => {
  if (!thorMemoProvenance(payload, chain, context)) return undefined
  if (payload.contractPayload.case || payload.erc20ApprovePayload)
    return undefined

  const fields = (payload.memo ?? '').split(':')
  const head = fields[0]?.toLowerCase()
  const carried = transactionAmount(payload)
  const isRujiraForm =
    fields.length > 2 &&
    fields[1].startsWith('thor1') &&
    /^-?\d+$/.test(fields[2])

  if (
    isRujiraForm &&
    (head === 'bond' || head === 'withdraw' || head === 'claim')
  ) {
    const amount = positiveUnits(fields[2], { denom: fields[1] })
    if (amount.kind !== 'units') return undefined
    const operation =
      head === 'bond'
        ? 'stake'
        : head === 'withdraw'
          ? 'unstake'
          : 'claimRewards'
    return decoded(operation, amount, 'memo', fields[1])
  }

  if (head === 'm=<' && fields.length > 2) {
    return decoded('limitOrderCancel', { kind: 'unstated' }, 'memo')
  }
  if (head === '=<' && fields.length > 2) {
    return decoded('limitOrderPlacement', carried, 'memo')
  }
  if (head === 'bond' && fields[1]) {
    return decoded('bond', carried, 'memo', fields[1])
  }
  if (head === 'unbond' && fields[1]) {
    return decoded(
      'unbond',
      positiveUnits(fields[2], 'transactionCoin'),
      'memo',
      fields[1]
    )
  }
  if (head === 'rebond' && fields[1] && fields[2]) {
    return decoded('rebond', { kind: 'unstated' }, 'memo', fields[1])
  }
  if (head === 'leave' && fields[1]) {
    return decoded('leave', { kind: 'unstated' }, 'memo', fields[1])
  }
  if (head === 'tcy+') return decoded('stake', carried, 'memo')
  if (head === 'tcy-') {
    const amount = fraction(fields[1])
    return amount ? decoded('unstake', amount, 'memo') : undefined
  }
  if (head === 'secure+' && fields[1]) {
    return decoded('securedAssetDeposit', carried, 'memo')
  }
  if (head === 'secure-' && fields[1]) {
    return decoded('securedAssetWithdraw', carried, 'memo')
  }
  if (head === 'merge' && fields[1]) return decoded('merge', carried, 'memo')
  if (head === 'unmerge' && fields[1]) {
    return decoded(
      'unmerge',
      positiveUnits(fields[2], { denom: fields[1] }),
      'memo'
    )
  }
  if (head === '+' && fields[1]) {
    return decoded('addLiquidity', carried, 'memo', fields[1])
  }
  if (head === '-' && fields[1]) {
    const amount = fraction(fields[2])
    return amount
      ? decoded('removeLiquidity', amount, 'memo', fields[1])
      : undefined
  }
  return undefined
}

const decodeCosmosMetadata = (
  payload: KeysignPayload,
  chain: Chain
): DecodedTransaction | undefined => {
  const cosmosChains: Chain[] = [
    Chain.Cosmos,
    Chain.Osmosis,
    Chain.Noble,
    Chain.Akash,
    Chain.Dydx,
  ]
  if (
    !cosmosChains.includes(chain) ||
    payload.contractPayload.case ||
    payload.swapPayload.case ||
    payload.erc20ApprovePayload
  ) {
    return undefined
  }

  const fields = (payload.memo ?? '').split(':')
  const head = fields[0]?.toUpperCase()
  if (head === 'SWITCH' && fields[1]) {
    return decoded('switchChain', transactionAmount(payload), 'memo')
  }
  if (head === 'DYDX_VOTE' && fields[2]) {
    return decoded('vote', { kind: 'unstated' }, 'memo')
  }

  const type = transactionType(payload)
  if (type === TransactionType.IBC_TRANSFER) {
    return decoded(
      'ibcTransfer',
      transactionAmount(payload),
      'wireTransactionType'
    )
  }
  if (type === TransactionType.VOTE) {
    return decoded('vote', { kind: 'unstated' }, 'wireTransactionType')
  }
  return undefined
}

const decodeThorWireType = (
  payload: KeysignPayload,
  chain: Chain
): DecodedTransaction | undefined => {
  if (chain !== Chain.THORChain) return undefined
  const type = transactionType(payload)
  if (type === TransactionType.THOR_MERGE) {
    return decoded('merge', transactionAmount(payload), 'wireTransactionType')
  }
  if (type === TransactionType.THOR_UNMERGE) {
    return decoded('unmerge', { kind: 'unstated' }, 'wireTransactionType')
  }
  return undefined
}

/**
 * Reads only the content both devices actually sign. Unknown or ambiguous
 * payloads stay unreadable so existing Verify/Done fallbacks remain intact.
 */
export const decodeSignedTransaction = (
  payload: KeysignPayload,
  context: SignedTransactionDecoderContext = {}
): DecodedTransaction => {
  const chain = getKeysignChain(payload)
  const signedData = decodeSignedData(payload, chain)
  if (payload.signData.case) return signedData ?? unreadable

  const wasm = decodeWasm(payload, chain)
  if (wasm) return wasm

  return (
    decodeTronMemo(payload, chain) ??
    decodeTonMemo(payload, chain) ??
    decodeThorMemo(payload, chain, context) ??
    decodeCosmosMetadata(payload, chain) ??
    decodeMayaMemo(payload, chain) ??
    decodeThorWireType(payload, chain) ??
    unreadable
  )
}

export const decodedAmountCanBeShown = (amount: DecodedAmount) =>
  amount.kind === 'units' && typeof amount.asset === 'string'
