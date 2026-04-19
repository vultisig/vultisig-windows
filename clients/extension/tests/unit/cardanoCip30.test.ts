import { EIP1193Error } from '@clients/extension/src/background/handlers/errorHandler'
import { PopupError } from '@core/inpage-provider/popup/error'
import { OtherChain } from '@vultisig/core-chain/Chain'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const hasInfo = (value: unknown): value is { info: string } =>
  typeof value === 'object' &&
  value !== null &&
  'info' in value &&
  typeof value.info === 'string'

const errInfo = (err: unknown): string => (hasInfo(err) ? err.info : '')

const mockCallBackground = vi.fn()
const mockCallPopup = vi.fn()
const mockRequestAccount = vi.fn()

const mockCardanoAddressBytes = vi.fn()
const mockEncodeCardanoValue = vi.fn()
const mockEncodeCardanoUnspentOutput = vi.fn()
const mockCardanoTxBodyHash = vi.fn()
const mockBuildCardanoWitnessSet = vi.fn()
const mockBuildProtectedHeaderBytes = vi.fn()
const mockBuildSigStructure = vi.fn()
const mockBuildCoseSign1 = vi.fn()
const mockBuildCoseKey = vi.fn()
const mockGetCardanoExtendedUtxos = vi.fn()
const mockSubmitCardanoCbor = vi.fn()

vi.mock('@core/inpage-provider/background', () => ({
  callBackground: (...args: unknown[]) => mockCallBackground(...args),
}))

vi.mock('@core/inpage-provider/popup', () => ({
  callPopup: (...args: unknown[]) => mockCallPopup(...args),
}))

vi.mock('@clients/extension/src/inpage/providers/core/requestAccount', () => ({
  requestAccount: (...args: unknown[]) => mockRequestAccount(...args),
}))

vi.mock('@clients/extension/src/inpage/icon', () => ({
  default: '<svg>mock-icon</svg>',
}))

vi.mock(
  '@vultisig/core-chain/chains/cardano/cip30/cardanoAddressBytes',
  () => ({
    cardanoAddressBytes: (...args: unknown[]) =>
      mockCardanoAddressBytes(...args),
  })
)

vi.mock('@vultisig/core-chain/chains/cardano/cip30/encodeCardanoValue', () => ({
  encodeCardanoValue: (...args: unknown[]) => mockEncodeCardanoValue(...args),
}))

vi.mock(
  '@vultisig/core-chain/chains/cardano/cip30/encodeCardanoUnspentOutput',
  () => ({
    encodeCardanoUnspentOutput: (...args: unknown[]) =>
      mockEncodeCardanoUnspentOutput(...args),
  })
)

vi.mock('@vultisig/core-chain/chains/cardano/cip30/cardanoTxBodyHash', () => ({
  cardanoTxBodyHash: (...args: unknown[]) => mockCardanoTxBodyHash(...args),
}))

vi.mock(
  '@vultisig/core-chain/chains/cardano/cip30/buildCardanoWitnessSet',
  () => ({
    buildCardanoWitnessSet: (...args: unknown[]) =>
      mockBuildCardanoWitnessSet(...args),
  })
)

vi.mock(
  '@vultisig/core-chain/chains/cardano/cip30/buildCoseStructures',
  () => ({
    buildProtectedHeaderBytes: (...args: unknown[]) =>
      mockBuildProtectedHeaderBytes(...args),
    buildSigStructure: (...args: unknown[]) => mockBuildSigStructure(...args),
    buildCoseSign1: (...args: unknown[]) => mockBuildCoseSign1(...args),
    buildCoseKey: (...args: unknown[]) => mockBuildCoseKey(...args),
  })
)

vi.mock(
  '@vultisig/core-chain/chains/cardano/utxo/getCardanoExtendedUtxos',
  () => ({
    getCardanoExtendedUtxos: (...args: unknown[]) =>
      mockGetCardanoExtendedUtxos(...args),
  })
)

vi.mock('@vultisig/core-chain/chains/cardano/submit/submitCardanoCbor', () => ({
  submitCardanoCbor: (...args: unknown[]) => mockSubmitCardanoCbor(...args),
}))

import { createCardanoCip30InitialApi } from '@clients/extension/src/inpage/providers/cardanoCip30'

const testAddress =
  'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x'

const addressBytes = new Uint8Array([
  0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
])
const addressHex = '0102030405060708'

// 32-byte spending key + 32 extra bytes we expect to be discarded (WalletCore
// returns the extended Ed25519Cardano 64-byte key; CIP-30 only needs the first
// 32 bytes for vkey witnesses and COSE_Key).
const spendingKey = Array.from({ length: 32 }, (_, i) => i)
const chainCode = Array.from({ length: 32 }, (_, i) => 0xff - i)
const publicKeyHex = Buffer.from([...spendingKey, ...chainCode]).toString('hex')
const spendingKeyBytes = new Uint8Array(spendingKey)

const enableApi = async () => {
  mockRequestAccount.mockResolvedValueOnce({
    address: testAddress,
    publicKey: publicKeyHex,
  })
  const initial = createCardanoCip30InitialApi()
  return initial.enable()
}

describe('createCardanoCip30InitialApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCardanoAddressBytes.mockReturnValue(addressBytes)
  })

  it('exposes the CIP-30 initial wallet shape', () => {
    const api = createCardanoCip30InitialApi()

    expect(api.name).toBe('Vultisig')
    expect(api.icon).toBe('<svg>mock-icon</svg>')
    expect(api.apiVersion).toBe('1.0.0')
    expect(api.supportedExtensions).toEqual([])
  })

  describe('isEnabled', () => {
    it('returns true when background returns an address', async () => {
      mockCallBackground.mockResolvedValueOnce({ address: testAddress })

      await expect(createCardanoCip30InitialApi().isEnabled()).resolves.toBe(
        true
      )

      expect(mockCallBackground).toHaveBeenCalledWith({
        getAccount: { chain: OtherChain.Cardano },
      })
    })

    it('returns false when background returns no address', async () => {
      mockCallBackground.mockResolvedValueOnce({ address: '' })

      await expect(createCardanoCip30InitialApi().isEnabled()).resolves.toBe(
        false
      )
    })

    it('returns false when background throws', async () => {
      mockCallBackground.mockRejectedValueOnce(new Error('unauthorized'))

      await expect(createCardanoCip30InitialApi().isEnabled()).resolves.toBe(
        false
      )
    })
  })

  describe('enable', () => {
    it('throws CIP-30 APIError(Refused=-3) when the user rejects the connect popup', async () => {
      mockRequestAccount.mockRejectedValueOnce(
        new EIP1193Error('UserRejectedRequest')
      )

      try {
        await createCardanoCip30InitialApi().enable()
        expect.fail('enable() should have thrown')
      } catch (err) {
        expect(err).toEqual({ code: -3, info: 'User refused connection' })
      }

      expect(mockRequestAccount).toHaveBeenCalledWith(OtherChain.Cardano)
    })

    it('throws CIP-30 APIError(InternalError=-2) on other connect failures', async () => {
      mockRequestAccount.mockRejectedValueOnce(new Error('background crashed'))

      try {
        await createCardanoCip30InitialApi().enable()
        expect.fail('enable() should have thrown')
      } catch (err) {
        expect(err).toMatchObject({
          code: -2,
          info: expect.stringContaining('enable failed'),
        })
        expect(errInfo(err)).toContain('background crashed')
      }
    })

    it('returns the full API when a vault is connected', async () => {
      const api = await enableApi()

      expect(typeof api.getExtensions).toBe('function')
      expect(typeof api.getNetworkId).toBe('function')
      expect(typeof api.getUsedAddresses).toBe('function')
      expect(typeof api.getUnusedAddresses).toBe('function')
      expect(typeof api.getChangeAddress).toBe('function')
      expect(typeof api.getRewardAddresses).toBe('function')
      expect(typeof api.getBalance).toBe('function')
      expect(typeof api.getUtxos).toBe('function')
      expect(typeof api.signTx).toBe('function')
      expect(typeof api.signData).toBe('function')
      expect(typeof api.submitTx).toBe('function')
    })
  })
})

describe('CIP-30 full API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCardanoAddressBytes.mockReturnValue(addressBytes)
  })

  it('getExtensions returns an empty array', async () => {
    const api = await enableApi()
    await expect(api.getExtensions()).resolves.toEqual([])
  })

  it('getNetworkId returns mainnet (1)', async () => {
    const api = await enableApi()
    await expect(api.getNetworkId()).resolves.toBe(1)
  })

  it('getUsedAddresses returns hex of the connected address', async () => {
    const api = await enableApi()
    await expect(api.getUsedAddresses()).resolves.toEqual([addressHex])
  })

  it('getUnusedAddresses returns an empty array', async () => {
    const api = await enableApi()
    await expect(api.getUnusedAddresses()).resolves.toEqual([])
  })

  it('getChangeAddress returns hex of the connected address', async () => {
    const api = await enableApi()
    await expect(api.getChangeAddress()).resolves.toBe(addressHex)
  })

  it('getRewardAddresses returns an empty array', async () => {
    const api = await enableApi()
    await expect(api.getRewardAddresses()).resolves.toEqual([])
  })

  describe('getBalance', () => {
    it('sums lovelace across UTXOs and returns hex-encoded CBOR value', async () => {
      mockGetCardanoExtendedUtxos.mockResolvedValueOnce([
        { hash: 'h1', index: 0, amount: 1_000_000n, assets: [] },
        {
          hash: 'h2',
          index: 1,
          amount: 2_500_000n,
          assets: [
            {
              policy_id: 'pid',
              asset_name: 'an',
              decimals: 0,
              quantity: '5',
              fingerprint: 'fp',
            },
          ],
        },
      ])
      mockEncodeCardanoValue.mockReturnValueOnce(
        new Uint8Array([0xaa, 0xbb, 0xcc])
      )

      const api = await enableApi()
      const balance = await api.getBalance()

      expect(balance).toBe('aabbcc')
      expect(mockGetCardanoExtendedUtxos).toHaveBeenCalledWith(testAddress)
      expect(mockEncodeCardanoValue).toHaveBeenCalledWith(
        3_500_000n,
        expect.arrayContaining([
          expect.objectContaining({
            policy_id: 'pid',
            asset_name: 'an',
            quantity: '5',
          }),
        ])
      )
    })

    it('returns 0-lovelace encoding when there are no UTXOs', async () => {
      mockGetCardanoExtendedUtxos.mockResolvedValueOnce([])
      mockEncodeCardanoValue.mockReturnValueOnce(new Uint8Array([0x00]))

      const api = await enableApi()
      await expect(api.getBalance()).resolves.toBe('00')
      expect(mockEncodeCardanoValue).toHaveBeenCalledWith(0n, [])
    })

    it('wraps UTXO fetch failures in APIError(InternalError=-2)', async () => {
      mockGetCardanoExtendedUtxos.mockRejectedValueOnce(
        new Error('network down')
      )

      const api = await enableApi()

      try {
        await api.getBalance()
        expect.fail('getBalance() should have thrown')
      } catch (err) {
        expect(err).toMatchObject({
          code: -2,
          info: expect.stringContaining('Failed to fetch UTXOs'),
        })
        expect(errInfo(err)).toContain('network down')
      }
    })
  })

  describe('getUtxos', () => {
    it('returns null when the wallet has no UTXOs', async () => {
      mockGetCardanoExtendedUtxos.mockResolvedValueOnce([])
      const api = await enableApi()
      await expect(api.getUtxos()).resolves.toBeNull()
    })

    it('encodes each UTXO using the raw (non-hex) address bytes', async () => {
      const utxos = [
        { hash: 'h1', index: 0, amount: 10n, assets: [] },
        { hash: 'h2', index: 1, amount: 20n, assets: [] },
      ]
      mockGetCardanoExtendedUtxos.mockResolvedValueOnce(utxos)
      mockEncodeCardanoUnspentOutput
        .mockReturnValueOnce(new Uint8Array([0x11]))
        .mockReturnValueOnce(new Uint8Array([0x22]))

      const api = await enableApi()
      await expect(api.getUtxos()).resolves.toEqual(['11', '22'])

      expect(mockEncodeCardanoUnspentOutput).toHaveBeenNthCalledWith(1, {
        utxo: utxos[0],
        addressBytes: addressBytes,
      })
      expect(mockEncodeCardanoUnspentOutput).toHaveBeenNthCalledWith(2, {
        utxo: utxos[1],
        addressBytes: addressBytes,
      })
    })

    it('applies pagination when provided', async () => {
      const utxos = Array.from({ length: 5 }, (_, i) => ({
        hash: `h${i}`,
        index: i,
        amount: BigInt(i),
        assets: [],
      }))
      mockGetCardanoExtendedUtxos.mockResolvedValueOnce(utxos)
      mockEncodeCardanoUnspentOutput.mockImplementation(
        ({ utxo }) => new Uint8Array([utxo.index])
      )

      const api = await enableApi()
      const page = await api.getUtxos(undefined, { page: 1, limit: 2 })

      expect(page).toEqual(['02', '03'])
    })

    it('rejects non-integer or negative pagination inputs', async () => {
      const utxos = [{ hash: 'h', index: 0, amount: 1n, assets: [] }]
      mockGetCardanoExtendedUtxos.mockResolvedValue(utxos)

      const api = await enableApi()

      await expect(
        api.getUtxos(undefined, { page: -1, limit: 1 })
      ).rejects.toMatchObject({ code: 1, info: 'Invalid pagination' })

      await expect(
        api.getUtxos(undefined, { page: 0, limit: 0 })
      ).rejects.toMatchObject({ code: 1, info: 'Invalid pagination' })

      await expect(
        api.getUtxos(undefined, { page: 1.5, limit: 1 })
      ).rejects.toMatchObject({ code: 1, info: 'Invalid pagination' })
    })

    it('throws a CIP-30 pagination error when the page is out of range', async () => {
      const utxos = [{ hash: 'h', index: 0, amount: 1n, assets: [] }]
      mockGetCardanoExtendedUtxos.mockResolvedValueOnce(utxos)

      const api = await enableApi()

      try {
        await api.getUtxos(undefined, { page: 5, limit: 1 })
        expect.fail('getUtxos() should have thrown pagination error')
      } catch (err) {
        expect(err).toMatchObject({
          code: 1,
          info: 'Page out of range',
          maxSize: 1,
        })
      }
    })
  })

  describe('signTx', () => {
    it('hashes the tx body, MPC-signs with Cardano, and returns a hex witness set', async () => {
      const txHex = 'deadbeef'
      const bodyHash = new Uint8Array([0x01, 0x02, 0x03])
      const signatureBytes = new Uint8Array(64).fill(0xaa)
      const signatureHex = Buffer.from(signatureBytes).toString('hex')
      const witnessSet = new Uint8Array([0xbe, 0xef])

      mockCardanoTxBodyHash.mockReturnValueOnce(bodyHash)
      mockCallPopup.mockResolvedValueOnce(signatureHex)
      mockBuildCardanoWitnessSet.mockReturnValueOnce(witnessSet)

      const api = await enableApi()
      const result = await api.signTx(txHex)

      expect(result).toBe('beef')
      expect(mockCardanoTxBodyHash).toHaveBeenCalledWith(txHex)

      expect(mockCallPopup).toHaveBeenCalledWith({
        signMessage: {
          sign_message: {
            message: `0x${Buffer.from(bodyHash).toString('hex')}`,
            chain: OtherChain.Cardano,
          },
        },
      })

      // Only the first 32 bytes of the extended public key should be used.
      expect(mockBuildCardanoWitnessSet).toHaveBeenCalledWith({
        publicKey: spendingKeyBytes,
        signature: signatureBytes,
      })
    })

    it('wraps failures in CIP-30 TxSignError(ProofGeneration=1)', async () => {
      mockCardanoTxBodyHash.mockImplementationOnce(() => {
        throw new Error('bad cbor')
      })

      const api = await enableApi()

      try {
        await api.signTx('00')
        expect.fail('signTx should have thrown')
      } catch (err) {
        expect(err).toMatchObject({
          code: 1,
          info: expect.stringContaining('signTx failed'),
        })
        expect(errInfo(err)).toContain('bad cbor')
      }
    })

    it('throws CIP-30 TxSignError(UserDeclined=2) when the signing popup is cancelled', async () => {
      mockCardanoTxBodyHash.mockReturnValueOnce(new Uint8Array([0x01]))
      mockCallPopup.mockRejectedValueOnce(PopupError.RejectedByUser)

      const api = await enableApi()

      try {
        await api.signTx('00')
        expect.fail('signTx should have thrown')
      } catch (err) {
        expect(err).toEqual({ code: 2, info: 'User declined signing' })
      }
    })
  })

  describe('signData', () => {
    it('builds the COSE Sig_structure, signs it, and returns the COSE_Sign1 and COSE_Key', async () => {
      const addrHex = addressHex
      const payloadHex = 'cafebabe'
      const protectedBytes = new Uint8Array([0x10])
      const sigStructure = new Uint8Array([0x20])
      const signatureBytes = new Uint8Array(64).fill(0xbb)
      const signatureHex = Buffer.from(signatureBytes).toString('hex')
      const coseSign1 = new Uint8Array([0x30, 0x31])
      const coseKey = new Uint8Array([0x40, 0x41])

      mockBuildProtectedHeaderBytes.mockReturnValueOnce(protectedBytes)
      mockBuildSigStructure.mockReturnValueOnce(sigStructure)
      mockCallPopup.mockResolvedValueOnce(signatureHex)
      mockBuildCoseSign1.mockReturnValueOnce(coseSign1)
      mockBuildCoseKey.mockReturnValueOnce(coseKey)

      const api = await enableApi()
      const result = await api.signData(addrHex, payloadHex)

      expect(result).toEqual({ signature: '3031', key: '4041' })

      expect(mockBuildProtectedHeaderBytes).toHaveBeenCalledWith(addressBytes)
      expect(mockBuildSigStructure).toHaveBeenCalledWith(
        protectedBytes,
        Uint8Array.from(Buffer.from(payloadHex, 'hex'))
      )

      expect(mockCallPopup).toHaveBeenCalledWith({
        signMessage: {
          sign_message: {
            message: `0x${Buffer.from(sigStructure).toString('hex')}`,
            chain: OtherChain.Cardano,
          },
        },
      })

      expect(mockBuildCoseSign1).toHaveBeenCalledWith({
        addressBytes: addressBytes,
        payload: Uint8Array.from(Buffer.from(payloadHex, 'hex')),
        signature: signatureBytes,
      })

      expect(mockBuildCoseKey).toHaveBeenCalledWith({
        publicKey: spendingKeyBytes,
      })
    })

    it('tolerates a 0x-prefixed address argument', async () => {
      mockBuildProtectedHeaderBytes.mockReturnValueOnce(new Uint8Array([0x10]))
      mockBuildSigStructure.mockReturnValueOnce(new Uint8Array([0x20]))
      mockCallPopup.mockResolvedValueOnce('00'.repeat(64))
      mockBuildCoseSign1.mockReturnValueOnce(new Uint8Array([0x30]))
      mockBuildCoseKey.mockReturnValueOnce(new Uint8Array([0x40]))

      const api = await enableApi()
      await api.signData(`0x${addressHex}`, '00')

      expect(mockBuildProtectedHeaderBytes).toHaveBeenCalledWith(addressBytes)
    })

    it('wraps failures in CIP-30 DataSignError(ProofGeneration=1)', async () => {
      mockBuildProtectedHeaderBytes.mockImplementationOnce(() => {
        throw new Error('bad header')
      })

      const api = await enableApi()

      try {
        await api.signData(addressHex, '00')
        expect.fail('signData should have thrown')
      } catch (err) {
        expect(err).toMatchObject({
          code: 1,
          info: expect.stringContaining('signData failed'),
        })
        expect(errInfo(err)).toContain('bad header')
      }
    })

    it('throws CIP-30 DataSignError(UserDeclined=3) when the signing popup is cancelled', async () => {
      mockBuildProtectedHeaderBytes.mockReturnValueOnce(new Uint8Array([0x10]))
      mockBuildSigStructure.mockReturnValueOnce(new Uint8Array([0x20]))
      mockCallPopup.mockRejectedValueOnce(PopupError.RejectedByUser)

      const api = await enableApi()

      try {
        await api.signData(addressHex, '00')
        expect.fail('signData should have thrown')
      } catch (err) {
        expect(err).toEqual({ code: 3, info: 'User declined signing' })
      }
    })

    it('throws CIP-30 DataSignError(AddressNotPK=2) when addr does not match the connected account', async () => {
      const api = await enableApi()

      try {
        await api.signData('aabbccdd', '00')
        expect.fail('signData should have thrown')
      } catch (err) {
        expect(err).toMatchObject({
          code: 2,
          info: expect.stringContaining('does not match'),
        })
      }

      // Should never reach the signing popup for a mismatched address.
      expect(mockBuildProtectedHeaderBytes).not.toHaveBeenCalled()
      expect(mockCallPopup).not.toHaveBeenCalled()
    })
  })

  describe('submitTx', () => {
    it('returns the tx hash when broadcast succeeds', async () => {
      mockSubmitCardanoCbor.mockResolvedValueOnce({
        txHash: 'abc123',
        errorMessage: null,
        rawResponse: '',
      })

      const api = await enableApi()
      await expect(api.submitTx('deadbeef')).resolves.toBe('abc123')
      expect(mockSubmitCardanoCbor).toHaveBeenCalledWith('deadbeef')
    })

    it('throws APIError(InternalError=-2) with the node error message on failure', async () => {
      mockSubmitCardanoCbor.mockResolvedValueOnce({
        txHash: null,
        errorMessage: 'mempool conflict',
        rawResponse: '',
      })

      const api = await enableApi()

      try {
        await api.submitTx('deadbeef')
        expect.fail('submitTx should have thrown')
      } catch (err) {
        expect(err).toMatchObject({
          code: -2,
          info: expect.stringContaining('mempool conflict'),
        })
      }
    })

    it('falls back to "unknown broadcast failure" when no error message is provided', async () => {
      mockSubmitCardanoCbor.mockResolvedValueOnce({
        txHash: null,
        errorMessage: null,
        rawResponse: '',
      })

      const api = await enableApi()

      try {
        await api.submitTx('deadbeef')
        expect.fail('submitTx should have thrown')
      } catch (err) {
        expect(err).toMatchObject({
          code: -2,
          info: expect.stringContaining('unknown broadcast failure'),
        })
      }
    })

    it('wraps thrown broadcast errors in APIError(InternalError=-2)', async () => {
      mockSubmitCardanoCbor.mockRejectedValueOnce(new Error('network down'))

      const api = await enableApi()

      try {
        await api.submitTx('deadbeef')
        expect.fail('submitTx should have thrown')
      } catch (err) {
        expect(err).toMatchObject({
          code: -2,
          info: expect.stringContaining('submitTx failed'),
        })
        expect(errInfo(err)).toContain('network down')
      }
    })
  })
})
