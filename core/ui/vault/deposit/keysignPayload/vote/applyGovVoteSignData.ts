import { create } from '@bufbuild/protobuf'
import { toBase64 } from '@cosmjs/encoding'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'
import { IbcEnabledCosmosChain } from '@vultisig/core-chain/Chain'
import { getCosmosChainId } from '@vultisig/core-chain/chains/cosmos/chainInfo'
import { cosmosFeeCoinDenom } from '@vultisig/core-chain/chains/cosmos/cosmosFeeCoinDenom'
import { getCosmosGasLimit } from '@vultisig/core-chain/chains/cosmos/cosmosGasLimitRecord'
import { resolveCosmosGasLimit } from '@vultisig/core-chain/chains/cosmos/resolveCosmosGasLimit'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { getBlockchainSpecificValue } from '@vultisig/core-mpc/keysign/chainSpecific/KeysignChainSpecific'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { SignDirectSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { FieldValues } from 'react-hook-form'

import { parseGovProposalId } from '../../vote/govProposalId'
import {
  govVoteOptionProtoValue,
  govVoteOptions,
} from '../../vote/govVoteOption'
import { buildCosmosSignDirectBytes } from '../cosmosSignDirect/buildCosmosSignDirectBytes'

const msgVoteTypeUrl = '/cosmos.gov.v1beta1.MsgVote'

type ApplyGovVoteSignDataInput = {
  coin: AccountCoin
  depositData: FieldValues
  publicKey: PublicKey | null
  keysignPayload: KeysignPayload
}

/**
 * Turns a deposit-flow governance vote into a `signDirect` payload carrying a
 * `MsgVote`, the path Terra and QBTC staking already take. Every signer (the
 * SDK, iOS and Android) signs those bytes verbatim, so no device needs
 * vote-specific handling, and the transaction type stays unspecified.
 */
export const applyGovVoteSignData = ({
  coin,
  depositData,
  publicKey,
  keysignPayload,
}: ApplyGovVoteSignDataInput): KeysignPayload => {
  const { chain } = coin
  if (!isOneOf(chain, Object.values(IbcEnabledCosmosChain))) {
    throw new Error(
      `Governance votes are only supported on ibc-enabled Cosmos chains, got ${chain}`
    )
  }

  const { option, proposalId } = depositData
  if (!isOneOf(option, govVoteOptions)) {
    throw new Error(`Invalid governance vote option: ${option}`)
  }

  const { accountNumber, sequence, gas, gasLimit } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'cosmosSpecific'
  )

  const { bodyBytes, authInfoBytes } = buildCosmosSignDirectBytes({
    messages: [
      {
        typeUrl: msgVoteTypeUrl,
        value: {
          proposalId: parseGovProposalId(proposalId),
          voter: coin.address,
          option: govVoteOptionProtoValue[option],
        },
      },
    ],
    publicKey: shouldBePresent(publicKey, 'publicKey').data(),
    sequence,
    // `gas` is the fee amount and the limit resolves as for any other tx on
    // this chain, so the signed fee is the one the review screen shows.
    feeAmount: { denom: cosmosFeeCoinDenom[chain], amount: gas.toString() },
    gasLimit: resolveCosmosGasLimit({
      relayedGasLimit: gasLimit,
      staticGasLimit: getCosmosGasLimit({ chain, id: coin.id }),
    }),
  })

  return create(KeysignPayloadSchema, {
    ...keysignPayload,
    contractPayload: { case: undefined },
    memo: '',
    // Never signed for a signDirect tx, but iOS `DydxHelperStruct` rejects a
    // payload whose `toAddress` is not a valid address on the chain. The
    // voter's own address satisfies it.
    toAddress: coin.address,
    toAmount: '0',
    signData: {
      case: 'signDirect',
      value: create(SignDirectSchema, {
        chainId: getCosmosChainId(chain),
        bodyBytes: toBase64(bodyBytes),
        authInfoBytes: toBase64(authInfoBytes),
        accountNumber: accountNumber.toString(),
      }),
    },
  })
}
