import { QbtcDappMessage } from '@core/ui/qbtc/dapp/encodeAnyMessage'
import { QbtcVoteSelection } from '@vultisig/core-chain/chains/cosmos/qbtc/governance/proposal'
import { qbtcVoteOptionProtoValue } from '@vultisig/core-chain/chains/cosmos/qbtc/governance/voteOption'

import { qbtcWeightPercentToDecString } from './weight'

/**
 * `cosmos.gov.v1beta1` message type URLs. QBTC reuses the standard Cosmos `x/gov`
 * messages (the same ones iOS' QBTCHelper builds), so the on-chain result is an
 * ordinary gov vote — the proto encoders are already registered in the QBTC dApp
 * `messageRegistry`.
 */
const msgVoteTypeUrl = '/cosmos.gov.v1beta1.MsgVote'
const msgVoteWeightedTypeUrl = '/cosmos.gov.v1beta1.MsgVoteWeighted'

type BuildQbtcVoteMessagesInput = {
  proposalId: string
  voter: string
  selection: QbtcVoteSelection
}

/**
 * Builds the Cosmos gov message(s) for a QBTC vote as QBTC dApp messages
 * (`{ typeUrl, value }`), ready for {@link buildQBTCDirectPayload}. A single
 * vote produces one `MsgVote`; a weighted vote produces one `MsgVoteWeighted`
 * carrying only the non-zero options.
 */
export const buildQbtcVoteMessages = ({
  proposalId,
  voter,
  selection,
}: BuildQbtcVoteMessagesInput): QbtcDappMessage[] => {
  const proposalIdBig = BigInt(proposalId)

  if (selection.kind === 'single') {
    return [
      {
        typeUrl: msgVoteTypeUrl,
        value: {
          proposalId: proposalIdBig,
          voter,
          option: qbtcVoteOptionProtoValue[selection.option],
        },
      },
    ]
  }

  const options = selection.options
    .filter(({ weightPercent }) => weightPercent > 0)
    .map(({ option, weightPercent }) => ({
      option: qbtcVoteOptionProtoValue[option],
      weight: qbtcWeightPercentToDecString(weightPercent),
    }))

  if (options.length === 0) {
    throw new Error('QBTC weighted vote requires at least one non-zero option')
  }

  const totalPercent = selection.options.reduce(
    (sum, { weightPercent }) => sum + weightPercent,
    0
  )
  if (totalPercent !== 100) {
    throw new Error(
      `QBTC weighted vote weights must sum to 100, got ${totalPercent}`
    )
  }

  return [
    {
      typeUrl: msgVoteWeightedTypeUrl,
      value: {
        proposalId: proposalIdBig,
        voter,
        options,
      },
    },
  ]
}
