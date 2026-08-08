import { getQbtcMessageEncoder } from '@core/ui/qbtc/dapp/messageRegistry'
import { MsgVote, MsgVoteWeighted } from 'cosmjs-types/cosmos/gov/v1beta1/tx'
import { describe, expect, it } from 'vitest'

import { buildQbtcVoteMessages } from './buildVoteMessages'

const voter = 'qbtc1exampleaddress'

const encode = ({
  typeUrl,
  value,
}: {
  typeUrl: string
  value: Record<string, unknown>
}) => {
  const encoder = getQbtcMessageEncoder(typeUrl)
  if (!encoder) throw new Error(`no encoder for ${typeUrl}`)
  return encoder(value)
}

describe('buildQbtcVoteMessages', () => {
  it('encodes a single vote that decodes to the right MsgVote', () => {
    const [message] = buildQbtcVoteMessages({
      proposalId: '42',
      voter,
      selection: { kind: 'single', option: 'noWithVeto' },
    })

    expect(message.typeUrl).toBe('/cosmos.gov.v1beta1.MsgVote')

    const decoded = MsgVote.decode(encode(message))
    expect(decoded.proposalId).toBe(42n)
    expect(decoded.voter).toBe(voter)
    expect(decoded.option).toBe(4) // VOTE_OPTION_NO_WITH_VETO
  })

  it('encodes a weighted vote that decodes to the right MsgVoteWeighted', () => {
    const [message] = buildQbtcVoteMessages({
      proposalId: '7',
      voter,
      selection: {
        kind: 'weighted',
        options: [
          { option: 'yes', weightPercent: 70 },
          { option: 'abstain', weightPercent: 30 },
          { option: 'no', weightPercent: 0 },
        ],
      },
    })

    expect(message.typeUrl).toBe('/cosmos.gov.v1beta1.MsgVoteWeighted')

    const decoded = MsgVoteWeighted.decode(encode(message))
    expect(decoded.proposalId).toBe(7n)
    expect(decoded.voter).toBe(voter)
    // The zero-weight option is dropped.
    expect(decoded.options).toHaveLength(2)
    expect(decoded.options[0]).toMatchObject({
      option: 1,
      weight: '0.700000000000000000',
    })
    expect(decoded.options[1]).toMatchObject({
      option: 2,
      weight: '0.300000000000000000',
    })
  })

  it('rejects weighted votes that do not sum to 100', () => {
    expect(() =>
      buildQbtcVoteMessages({
        proposalId: '1',
        voter,
        selection: {
          kind: 'weighted',
          options: [{ option: 'yes', weightPercent: 60 }],
        },
      })
    ).toThrow()
  })
})
