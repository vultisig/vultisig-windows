import { compactToU8a, hexToU8a, u8aConcat, u8aToHex } from '@polkadot/util'
import {
  blake2AsU8a,
  cryptoWaitReady,
  signatureVerify,
} from '@polkadot/util-crypto'
import { beforeAll, describe, expect, it } from 'vitest'

import { constructPolkadotSigningPayload } from './constructSigningPayload'
import { PolkadotSignerPayloadJSON } from './PolkadotSignerPayload'

const bittensorGenesisHash =
  '0x2f0555cc76fc2840a25a6ea3b9637146806f1f44b090c175ffde2a7e5ab36c03'

const bittensorRuntime = {
  genesisHash: bittensorGenesisHash,
  specVersion: '0x000001d3',
  transactionVersion: '0x00000001',
  signedExtensions: [
    'CheckNonZeroSender',
    'CheckSpecVersion',
    'CheckTxVersion',
    'CheckGenesis',
    'CheckMortality',
    'CheckNonce',
    'CheckWeight',
    'ChargeTransactionPayment',
    'SudoTransactionExtension',
    'CheckShieldedTxValidity',
    'SubtensorTransactionExtension',
    'DrandPriority',
    'CheckMetadataHash',
  ],
  version: 4,
}

// Real extrinsics from Bittensor finney block 9101269, both accepted by the
// runtime. Their sr25519 signatures are the ground truth for the byte layout
// the builder must reproduce.
type OnChainFixture = {
  name: string
  payload: PolkadotSignerPayloadJSON
  signerPublicKey: string
  signature: string
}

const balancesTransferKeepAlive: OnChainFixture = {
  name: 'balances.transferKeepAlive (120-byte raw payload)',
  payload: {
    ...bittensorRuntime,
    address: '5CAX2o2zUPDRbfoqEbao9dEjcr9auda7aiQxDBFHiYZJm2KS',
    blockHash:
      '0x3e36c12ef656fcb022bf02295f249cf36791e1b9298565be52c950bd11a56211',
    blockNumber: '0x8adfd2',
    era: '0x2401',
    method:
      '0x050300a69ffb8d15b780999fc0ae940aabf71073498ab19a1561a4c4b473ebbe8a336a0701c086ef08',
    nonce: '0x00000c25',
    tip: '0x00000000000000000000000000000000',
    mode: 0,
    metadataHash: null,
  },
  signerPublicKey:
    '0x046f07e3e261562fc2c808f818b19841464738c218580ca373260fb0690f144a',
  signature:
    '0xfe1f11659e87849a395e134c822d9b7b387d8a2588b5cb17bcd267d699fa161a1131e841529335807bbd0ce8f3208740a936569308d36fd6faaeb5508c1ec98d',
}

const commitTimelockedMechanismWeights: OnChainFixture = {
  name: 'subtensorModule.commitTimelockedMechanismWeights (401-byte hashed payload)',
  payload: {
    ...bittensorRuntime,
    address: '5DtUJ9ytbeCMjovFieNwaxxqRP3DzT6iQPnZTyKmi3n6iXey',
    blockHash:
      '0x98ff84421e7a905e4710c6292cc756f94e727b9d4734fb0f07aa28c604c8e76a',
    blockNumber: '0x8adfd1',
    era: '0x1605',
    method:
      '0x0776070000bd04add79c4f91c9b56920e48e41d7de2bb50289966534371c16faa5a023d0052165283424fbb6f6b4121516acb75f50f2181301bd76c3df06e40409b293b2e4e6d4c5d29dfaf57239e2d21ec7a65f1fdd00905d91dee6baebc895c9deb76849c8cf2000000000000000ce281554cf945eba34e9159487c3fe6854f039ebfb99c23e56075b6782187c402000000000000000c6650336df21d47c5cbd05e202b072c38c7d9c7ff7dad2ff9811ebddb41b3e7067000000000000004b0000000000000045f7265fea37fb03a04611dac062e06e03585ba9c05a17784e6a34efb1a7f787b4b9e5c5dd615c1746f01a2806db82524a93f616fe8981c62ab4ec28fe9839b75d0608593f6f72aceaaca10c00000000000000f6e30fc8e613b20200bf45fe08000000000000004145535f47434d5fef79ed01000000000400',
    nonce: '0x000086eb',
    tip: '0x00000000000000000000000000000000',
    mode: 0,
    metadataHash: null,
  },
  signerPublicKey:
    '0x50aa5d2960d8135bcdaf080a6a8a5a592600859029b492040b74dd3c5ecbd676',
  signature:
    '0xac4179f7f518755b5cd40d1e31d02c9967a0606c0ae3c077af91147938a4ed4b82e84ab8fc6d9d5a8cfd0260ecd014c7c330cf9c7901f95c1e50a1460103a688',
}

const onChainFixtures = [
  balancesTransferKeepAlive,
  commitTimelockedMechanismWeights,
]

// Byte-level layout fixture: every field is a distinct length so a shifted
// insertion point shows up as a mismatch rather than a coincidence.
const layoutPayload: PolkadotSignerPayloadJSON = {
  ...bittensorRuntime,
  address: '5CAX2o2zUPDRbfoqEbao9dEjcr9auda7aiQxDBFHiYZJm2KS',
  blockHash:
    '0x1111111111111111111111111111111111111111111111111111111111111111',
  blockNumber: '0x01',
  era: '0x2401',
  method: '0x0503',
  nonce: '0x00000c25',
  tip: '0x00000000000000000000000000000000',
}

const layoutPrefix = u8aConcat(
  hexToU8a(layoutPayload.method),
  hexToU8a(layoutPayload.era),
  // compact(0xc25) = 2-byte mode
  new Uint8Array([0x95, 0x30]),
  // compact(0)
  new Uint8Array([0x00])
)

const layoutImplicit = u8aConcat(
  // LE-u32(0x1d3)
  new Uint8Array([0xd3, 0x01, 0x00, 0x00]),
  // LE-u32(1)
  new Uint8Array([0x01, 0x00, 0x00, 0x00]),
  hexToU8a(layoutPayload.genesisHash),
  hexToU8a(layoutPayload.blockHash)
)

const sampleMetadataHash =
  '0x2222222222222222222222222222222222222222222222222222222222222222'

describe('constructPolkadotSigningPayload', () => {
  beforeAll(async () => {
    await cryptoWaitReady()
  })

  describe('reproduces the bytes the Bittensor runtime accepted', () => {
    it.each(onChainFixtures)(
      '$name',
      ({ payload, signerPublicKey, signature }) => {
        const message = constructPolkadotSigningPayload(payload)

        const result = signatureVerify(message, signature, signerPublicKey)

        expect(result.isValid).toBe(true)
        expect(result.crypto).toBe('sr25519')
      }
    )

    it('rejects the layout without CheckMetadataHash', () => {
      const { payload, signerPublicKey, signature } = balancesTransferKeepAlive
      const withExtension = constructPolkadotSigningPayload(payload)
      const modeOffset =
        hexToU8a(payload.method).length +
        hexToU8a(payload.era).length +
        compactToU8a(parseInt(payload.nonce, 16)).length +
        compactToU8a(BigInt(payload.tip)).length
      const withoutExtension = u8aConcat(
        withExtension.slice(0, modeOffset),
        withExtension.slice(modeOffset + 1, -1)
      )

      expect(
        signatureVerify(withoutExtension, signature, signerPublicKey).isValid
      ).toBe(false)
    })
  })

  describe('CheckMetadataHash layout', () => {
    it('places mode=0 after the tip and Option::None after the block hash', () => {
      const result = constructPolkadotSigningPayload({
        ...layoutPayload,
        mode: 0,
        metadataHash: null,
      })

      expect(u8aToHex(result)).toBe(
        u8aToHex(
          u8aConcat(
            layoutPrefix,
            new Uint8Array([0x00]),
            layoutImplicit,
            new Uint8Array([0x00])
          )
        )
      )
    })

    it('places mode=1 after the tip and Option::Some(hash) after the block hash', () => {
      const result = constructPolkadotSigningPayload({
        ...layoutPayload,
        mode: 1,
        metadataHash: sampleMetadataHash,
      })

      expect(u8aToHex(result)).toBe(
        u8aToHex(
          u8aConcat(
            layoutPrefix,
            new Uint8Array([0x01]),
            layoutImplicit,
            new Uint8Array([0x01]),
            hexToU8a(sampleMetadataHash)
          )
        )
      )
    })

    it('is 34 bytes longer with a metadata hash than the pre-extension layout', () => {
      const withoutExtension = layoutPrefix.length + layoutImplicit.length
      const withHash = constructPolkadotSigningPayload({
        ...layoutPayload,
        mode: 1,
        metadataHash: sampleMetadataHash,
      })
      const withoutHash = constructPolkadotSigningPayload({
        ...layoutPayload,
        mode: 0,
        metadataHash: null,
      })

      expect(withHash.length).toBe(withoutExtension + 34)
      expect(withoutHash.length).toBe(withoutExtension + 2)
    })

    it('defaults to mode=0 and Option::None when the payload omits both fields', () => {
      const omitted = constructPolkadotSigningPayload(layoutPayload)
      const explicit = constructPolkadotSigningPayload({
        ...layoutPayload,
        mode: 0,
        metadataHash: null,
      })

      expect(u8aToHex(omitted)).toBe(u8aToHex(explicit))
    })

    it('rejects a mode other than 0 or 1', () => {
      expect(() =>
        constructPolkadotSigningPayload({ ...layoutPayload, mode: 2 })
      ).toThrow('Invalid CheckMetadataHash mode')
    })

    it('rejects a metadata hash that is not 32 bytes', () => {
      expect(() =>
        constructPolkadotSigningPayload({
          ...layoutPayload,
          mode: 1,
          metadataHash: '0x2222',
        })
      ).toThrow('Invalid metadataHash length')
    })

    it('rejects an empty metadata hash instead of treating it as None', () => {
      expect(() =>
        constructPolkadotSigningPayload({
          ...layoutPayload,
          mode: 1,
          metadataHash: '',
        })
      ).toThrow('Invalid metadataHash length')

      expect(() =>
        constructPolkadotSigningPayload({
          ...layoutPayload,
          mode: 0,
          metadataHash: '',
        })
      ).toThrow('does not match')
    })

    it('rejects mode=1 without a metadata hash', () => {
      expect(() =>
        constructPolkadotSigningPayload({ ...layoutPayload, mode: 1 })
      ).toThrow('mode 1 does not match metadataHash absence')

      expect(() =>
        constructPolkadotSigningPayload({
          ...layoutPayload,
          mode: 1,
          metadataHash: null,
        })
      ).toThrow('mode 1 does not match metadataHash absence')
    })

    it('rejects mode=0 with a metadata hash', () => {
      expect(() =>
        constructPolkadotSigningPayload({
          ...layoutPayload,
          mode: 0,
          metadataHash: sampleMetadataHash,
        })
      ).toThrow('mode 0 does not match metadataHash presence')

      expect(() =>
        constructPolkadotSigningPayload({
          ...layoutPayload,
          metadataHash: sampleMetadataHash,
        })
      ).toThrow('mode 0 does not match metadataHash presence')
    })
  })

  describe('256-byte hashing threshold', () => {
    // Size the method so that everything up to and including blockHash lands
    // on exactly 256 bytes; only the trailing Option can push it over.
    const methodLength =
      256 -
      (layoutPrefix.length - hexToU8a(layoutPayload.method).length) -
      layoutImplicit.length -
      1 // mode
    const method = `0x${'ab'.repeat(methodLength)}`

    it('hashes a payload that crosses 256 bytes only after the Option is appended', () => {
      const payload = {
        ...layoutPayload,
        method,
        mode: 1,
        metadataHash: sampleMetadataHash,
      }
      const raw = u8aConcat(
        hexToU8a(method),
        hexToU8a(layoutPayload.era),
        new Uint8Array([0x95, 0x30]),
        new Uint8Array([0x00]),
        new Uint8Array([0x01]),
        layoutImplicit,
        new Uint8Array([0x01]),
        hexToU8a(sampleMetadataHash)
      )

      expect(raw.length).toBe(256 + 33)

      const result = constructPolkadotSigningPayload(payload)

      expect(result.length).toBe(32)
      expect(u8aToHex(result)).toBe(u8aToHex(blake2AsU8a(raw, 256)))
    })

    it('leaves a payload that lands exactly on 256 bytes unhashed', () => {
      const shorterMethod = `0x${'ab'.repeat(methodLength - 1)}`
      const result = constructPolkadotSigningPayload({
        ...layoutPayload,
        method: shorterMethod,
        mode: 0,
        metadataHash: null,
      })

      expect(result.length).toBe(256)
    })
  })
})
