// @vitest-environment happy-dom
/**
 * As on iOS, a name in the receiver field is replaced by its address once it
 * resolves, and the form moves on to the amount. The address belongs to the
 * chain it was resolved for: after a chain switch the name must be looked up
 * again, and its previous address must never be the send's receiver.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { Chain } from '@vultisig/core-chain/Chain'
import { NameServiceResolution } from '@vultisig/core-chain/nameService/NameServiceResolution'
import { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  chain: vi.fn<() => Chain>(),
  resolve: vi.fn(),
  isValidAddress: vi.fn(),
}))

vi.mock('./sendCoin', () => ({
  useCurrentSendCoin: () => ({ chain: mocks.chain() }),
}))
vi.mock('../../../navigation/hooks/useCoreViewState', () => ({
  useCoreViewState: () => [{}],
}))
vi.mock('../../../chain/providers/WalletCoreProvider', () => ({
  useAssertWalletCore: () => ({}),
}))
vi.mock('@lib/ui/hooks/useDebounce', () => ({
  useDebounce: <T,>(value: T) => value,
}))
vi.mock('@vultisig/core-chain/utils/isValidAddress', () => ({
  isValidAddress: mocks.isValidAddress,
}))
vi.mock('@vultisig/core-chain/nameService', async importOriginal => ({
  ...(await importOriginal<
    typeof import('@vultisig/core-chain/nameService')
  >()),
  resolveNameServiceName: mocks.resolve,
}))

import {
  InternalSendFormFieldsStateProvider,
  useSendFormFieldState,
} from './formFields'
import { SendReceiverProvider, useSendReceiver } from './receiver'
import {
  getSendReceiverAddress,
  SendReceiverResolution,
  useSendReceiverLabel,
  useSendReceiverResolution,
} from './receiverResolution'
import { SendReceiverResolutionProvider } from './SendReceiverResolutionProvider'

const btcAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
const ethAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
const thorAddress = 'thor15qqu3msgat0n8qx84w9ull5fzxh8fjy3xcackv'

const renderSendReceiver = (initialInput: string) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retryDelay: 0 } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <InternalSendFormFieldsStateProvider initialValue={{ field: 'address' }}>
        <SendReceiverProvider initialValue={initialInput}>
          <SendReceiverResolutionProvider>
            {children}
          </SendReceiverResolutionProvider>
        </SendReceiverProvider>
      </InternalSendFormFieldsStateProvider>
    </QueryClientProvider>
  )

  const resolutions: SendReceiverResolution[] = []
  const view = renderHook(
    () => {
      const resolution = useSendReceiverResolution()
      resolutions.push(resolution)
      const [input, setInput] = useSendReceiver()
      const [{ field }] = useSendFormFieldState()

      return {
        resolution,
        input,
        setInput,
        field,
        address: getSendReceiverAddress(resolution),
        label: useSendReceiverLabel(),
      }
    },
    { wrapper }
  )

  return { ...view, resolutions }
}

const deferred = () => {
  let resolve: (value: NameServiceResolution) => void = () => {}
  const promise = new Promise<NameServiceResolution>(r => {
    resolve = r
  })

  return { promise, resolve }
}

describe('SendReceiverResolutionProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.chain.mockReturnValue(Chain.Bitcoin)
    mocks.isValidAddress.mockReturnValue(false)
  })

  it('sends to an entered address as is, without a lookup', () => {
    const { result } = renderSendReceiver(btcAddress)

    expect(result.current).toMatchObject({
      resolution: { kind: 'address', address: btcAddress },
      address: btcAddress,
      label: '',
      field: 'address',
    })
    expect(mocks.resolve).not.toHaveBeenCalled()
  })

  it('replaces a name with the address it resolves to and moves on to the amount', async () => {
    mocks.resolve.mockResolvedValue({ kind: 'resolved', address: btcAddress })

    const { result } = renderSendReceiver(' Vi.THOR ')

    await waitFor(() => expect(result.current.input).toBe(btcAddress))
    expect(result.current).toMatchObject({
      address: btcAddress,
      label: 'vi.thor',
      field: 'amount',
    })
    expect(mocks.resolve).toHaveBeenCalledWith({
      service: 'thorname',
      name: 'vi.thor',
      chain: Chain.Bitcoin,
    })
  })

  it.each([
    [Chain.THORChain, 'thorname', 'vi.thor'],
    [Chain.MayaChain, 'mayaname', 'vi.maya'],
    [Chain.Ethereum, 'ens', 'vi.eth'],
  ])(
    'looks a name typed without its suffix up on %s as a %s',
    async (chain, service, name) => {
      mocks.chain.mockReturnValue(chain)
      mocks.resolve.mockResolvedValue({
        kind: 'resolved',
        address: thorAddress,
      })

      const { result } = renderSendReceiver('vi')

      await waitFor(() => expect(result.current.input).toBe(thorAddress))
      expect(result.current.label).toBe(name)
      expect(mocks.resolve).toHaveBeenCalledWith({ service, name, chain })
    }
  )

  it.each([Chain.Bitcoin, Chain.Arbitrum, Chain.Dash, Chain.Polygon])(
    'needs the suffix on %s',
    chain => {
      mocks.chain.mockReturnValue(chain)

      const { result } = renderSendReceiver('vi')

      expect(result.current.resolution).toEqual({
        kind: 'address',
        address: 'vi',
      })
      expect(mocks.resolve).not.toHaveBeenCalled()
    }
  )

  it('never looks an Ethereum address up as an ENS name', () => {
    mocks.chain.mockReturnValue(Chain.Ethereum)
    mocks.isValidAddress.mockReturnValue(true)

    const { result } = renderSendReceiver(ethAddress)

    expect(result.current.resolution).toEqual({
      kind: 'address',
      address: ethAddress,
    })
    expect(mocks.resolve).not.toHaveBeenCalled()
  })

  it('takes a bare name nobody registered as the mistyped address it more likely is', async () => {
    mocks.chain.mockReturnValue(Chain.THORChain)
    mocks.resolve.mockResolvedValue({ kind: 'notFound' })

    const { result } = renderSendReceiver('thor1abc')

    await waitFor(() =>
      expect(result.current.resolution).toEqual({
        kind: 'address',
        address: 'thor1abc',
      })
    )
    expect(result.current.input).toBe('thor1abc')
  })

  it('keeps a suffixed name nobody registered in the field and says so', async () => {
    mocks.chain.mockReturnValue(Chain.MayaChain)
    mocks.resolve.mockResolvedValue({ kind: 'notFound' })

    const { result } = renderSendReceiver('nope.maya')

    await waitFor(() =>
      expect(result.current.resolution).toEqual({
        kind: 'notFound',
        name: 'nope.maya',
      })
    )
    expect(result.current).toMatchObject({
      input: 'nope.maya',
      field: 'address',
    })
  })

  it("never sends to a name's previous address after a chain switch", async () => {
    mocks.resolve.mockResolvedValue({ kind: 'resolved', address: btcAddress })

    const { result, rerender, resolutions } = renderSendReceiver('vi.thor')
    await waitFor(() => expect(result.current.input).toBe(btcAddress))

    const switchedAt = resolutions.length
    const ethereumLookup = deferred()
    mocks.resolve.mockReturnValue(ethereumLookup.promise)
    mocks.chain.mockReturnValue(Chain.Ethereum)
    rerender()

    await waitFor(() => expect(result.current.input).toBe('vi.thor'))
    expect(result.current.address).toBe('')

    act(() => ethereumLookup.resolve({ kind: 'resolved', address: ethAddress }))

    await waitFor(() => expect(result.current.input).toBe(ethAddress))
    expect(result.current.label).toBe('vi.thor')
    expect(mocks.resolve).toHaveBeenLastCalledWith({
      service: 'thorname',
      name: 'vi.thor',
      chain: Chain.Ethereum,
    })
    expect(
      resolutions.slice(switchedAt).map(getSendReceiverAddress)
    ).not.toContain(btcAddress)
  })

  it('leaves the name in the field when it has no address on the new chain', async () => {
    mocks.resolve.mockResolvedValue({ kind: 'resolved', address: btcAddress })

    const { result, rerender } = renderSendReceiver('vi.thor')
    await waitFor(() => expect(result.current.input).toBe(btcAddress))

    mocks.resolve.mockResolvedValue({ kind: 'noAddressForChain' })
    mocks.chain.mockReturnValue(Chain.Litecoin)
    rerender()

    await waitFor(() =>
      expect(result.current.resolution).toEqual({
        kind: 'noAddressForChain',
        name: 'vi.thor',
      })
    )
    expect(result.current).toMatchObject({ input: 'vi.thor', address: '' })
  })

  it('drops the label once the resolved address is edited', async () => {
    mocks.resolve.mockResolvedValue({ kind: 'resolved', address: btcAddress })

    const { result } = renderSendReceiver('vi.thor')
    await waitFor(() => expect(result.current.label).toBe('vi.thor'))

    const editedAddress = btcAddress.slice(0, -1)
    act(() => result.current.setInput(editedAddress))

    expect(result.current).toMatchObject({
      resolution: { kind: 'address', address: editedAddress },
      label: '',
    })
  })

  it('reports a lookup that could not reach the service apart from a missing name', async () => {
    mocks.resolve.mockRejectedValue(new Error('THORNode unavailable'))

    const { result } = renderSendReceiver('vi.thor')

    await waitFor(() =>
      expect(result.current.resolution).toEqual({
        kind: 'lookupFailed',
        name: 'vi.thor',
      })
    )
    expect(result.current.input).toBe('vi.thor')
  })

  it('treats a suffixed name as an address on a chain its service cannot hold', () => {
    mocks.chain.mockReturnValue(Chain.Polygon)

    const { result } = renderSendReceiver('vi.thor')

    expect(result.current.resolution).toEqual({
      kind: 'address',
      address: 'vi.thor',
    })
    expect(mocks.resolve).not.toHaveBeenCalled()
  })
})
