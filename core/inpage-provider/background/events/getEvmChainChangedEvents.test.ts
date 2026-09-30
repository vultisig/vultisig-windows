import { AppSession } from '@core/extension/storage/appSessions'
import { describe, expect, it } from 'vitest'

import { getEvmChainChangedEvents } from './getEvmChainChangedEvents'

const appId = 'example.com'

const session = (selectedEVMChainId?: string): AppSession => ({
  host: appId,
  url: `https://${appId}`,
  selectedEVMChainId,
})

describe('getEvmChainChangedEvents', () => {
  it("emits when a session's first EVM chain is set", () => {
    expect(
      getEvmChainChangedEvents({
        prevSessions: { [appId]: session() },
        nextSessions: { [appId]: session('0x89') },
      })
    ).toEqual([{ appId, chainId: '0x89' }])
  })

  it('emits when the EVM chain changes', () => {
    expect(
      getEvmChainChangedEvents({
        prevSessions: { [appId]: session('0x1') },
        nextSessions: { [appId]: session('0x89') },
      })
    ).toEqual([{ appId, chainId: '0x89' }])
  })

  it('does not emit when the EVM chain is unchanged', () => {
    expect(
      getEvmChainChangedEvents({
        prevSessions: { [appId]: session('0x89') },
        nextSessions: { [appId]: session('0x89') },
      })
    ).toEqual([])
  })

  it('does not emit when the EVM chain is cleared', () => {
    expect(
      getEvmChainChangedEvents({
        prevSessions: { [appId]: session('0x89') },
        nextSessions: { [appId]: session() },
      })
    ).toEqual([])
  })

  it('does not emit for a new session', () => {
    expect(
      getEvmChainChangedEvents({
        prevSessions: {},
        nextSessions: { [appId]: session('0x89') },
      })
    ).toEqual([])
  })

  it('does not emit for a removed session', () => {
    expect(
      getEvmChainChangedEvents({
        prevSessions: { [appId]: session('0x89') },
        nextSessions: {},
      })
    ).toEqual([])
  })
})
