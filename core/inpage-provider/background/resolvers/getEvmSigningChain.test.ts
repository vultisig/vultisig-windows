import { getVaultsAppSessions } from '@core/extension/storage/appSessions'
import { getCurrentEVMChainId } from '@core/extension/storage/currentEvmChainId'
import { findVault } from '@core/extension/storage/vaults'
import { Chain } from '@vultisig/core-chain/Chain'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getVaultChainAddress } from '../core/getVaultChainAddress'
import { BackgroundError } from '../error'
import { getEvmSigningChain } from './getEvmSigningChain'

vi.mock('@core/extension/storage/appSessions', () => ({
  getVaultsAppSessions: vi.fn(),
}))
vi.mock('@core/extension/storage/currentEvmChainId', () => ({
  getCurrentEVMChainId: vi.fn(),
}))
vi.mock('@core/extension/storage/vaults', () => ({ findVault: vi.fn() }))
vi.mock('../core/getVaultChainAddress', () => ({
  getVaultChainAddress: vi.fn(),
}))

const vault: Vault = {
  name: 'Signer',
  publicKeys: { ecdsa: 'test-ecdsa', eddsa: 'test-eddsa' },
  keyShares: { ecdsa: '', eddsa: '' },
  hexChainCode: '',
  signers: [],
  localPartyId: 'test',
  libType: 'KeyImport',
  chainPublicKeys: { [Chain.Polygon]: 'test-polygon-key' },
  isBackedUp: true,
  order: 0,
}
const account = '0xaBc0000000000000000000000000000000000000'
const session = {
  host: 'example.com',
  url: 'https://dapp.example.com',
  selectedEVMChainId: '0x89',
  isAccountAccessGranted: true,
  authorizedChains: [Chain.Polygon],
}
const request = {
  context: { requestOrigin: session.url },
  input: { account: account.toLowerCase() },
}

describe('getEvmSigningChain', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getCurrentEVMChainId).mockResolvedValue('0x1')
    vi.mocked(getVaultsAppSessions).mockResolvedValue({
      'vault-a': { 'example.com': session },
      'vault-b': {},
    })
    vi.mocked(findVault).mockResolvedValue(vault)
    vi.mocked(getVaultChainAddress).mockImplementation(async ({ chain }) =>
      chain === Chain.Polygon ? account : ''
    )
  })

  it('uses the signer session network even when the global network has no imported key', async () => {
    await expect(getEvmSigningChain(request)).resolves.toBe(Chain.Polygon)
    expect(getVaultChainAddress).toHaveBeenCalledExactlyOnceWith({
      vault,
      chain: Chain.Polygon,
    })
  })

  it('uses the global network for a legacy session without a saved network', async () => {
    vi.mocked(getCurrentEVMChainId).mockResolvedValue('0x89')
    vi.mocked(getVaultsAppSessions).mockResolvedValue({
      'vault-a': { 'example.com': { host: session.host, url: session.url } },
    })
    await expect(getEvmSigningChain(request)).resolves.toBe(Chain.Polygon)
  })

  it('rejects an address not owned by a connected vault instead of choosing the current network', async () => {
    await expect(
      getEvmSigningChain({ ...request, input: { account: '0xdead' } })
    ).rejects.toBe(BackgroundError.Unauthorized)
  })

  it('does not expose the signer session to another origin', async () => {
    await expect(
      getEvmSigningChain({
        ...request,
        context: { requestOrigin: 'https://other.example.org' },
      })
    ).rejects.toBe(BackgroundError.Unauthorized)
    expect(getVaultChainAddress).not.toHaveBeenCalled()
  })

  it('rejects a session without account access', async () => {
    vi.mocked(getVaultsAppSessions).mockResolvedValue({
      'vault-a': {
        'example.com': { ...session, isAccountAccessGranted: false },
      },
    })
    await expect(getEvmSigningChain(request)).rejects.toBe(
      BackgroundError.Unauthorized
    )
    expect(getVaultChainAddress).not.toHaveBeenCalled()
  })

  it('skips deleted vaults and continues to a matching session', async () => {
    vi.mocked(getVaultsAppSessions).mockResolvedValue({
      deleted: { 'example.com': session },
      'vault-a': { 'example.com': session },
    })
    vi.mocked(findVault).mockResolvedValueOnce(undefined)
    await expect(getEvmSigningChain(request)).resolves.toBe(Chain.Polygon)
  })

  it('rejects unsupported saved networks without falling back to Ethereum', async () => {
    vi.mocked(getVaultsAppSessions).mockResolvedValue({
      'vault-a': {
        'example.com': { ...session, selectedEVMChainId: '0xdead' },
      },
    })
    await expect(getEvmSigningChain(request)).rejects.toBe(
      BackgroundError.Unauthorized
    )
  })
})
