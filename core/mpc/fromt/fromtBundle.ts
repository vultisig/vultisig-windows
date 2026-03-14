import {
  fromt_derive_view_key,
  fromt_keyshare_birthday,
  fromt_keyshare_network,
} from '../../../lib/fromt/fromt_wasm'

export type FromtReshareResult = {
  keyPackage: Uint8Array
  pubKeyPackage: Uint8Array
}

const bundleVersion = 2
const viewKeyLength = 32

const assertWithinBounds = (
  data: Uint8Array,
  offset: number,
  length: number,
  label: string
) => {
  if (offset + length > data.length) {
    throw new Error(`fromt bundle truncated at ${label}`)
  }
}

export const extractFromtKeyPackage = (bundle: Uint8Array): Uint8Array => {
  let offset = 0
  assertWithinBounds(bundle, offset, 2, 'header')
  const version = bundle[offset]
  offset += 1
  if (version !== 1 && version !== bundleVersion) {
    throw new Error(`fromt bundle unknown version ${version}`)
  }
  offset += 1 // network
  assertWithinBounds(bundle, offset, viewKeyLength, 'view key')
  offset += viewKeyLength
  if (version >= bundleVersion) {
    assertWithinBounds(bundle, offset, 8, 'birthday')
    offset += 8
  }
  assertWithinBounds(bundle, offset, 4, 'key package length')
  const keyPackageLength = new DataView(
    bundle.buffer,
    bundle.byteOffset + offset,
    4
  ).getUint32(0, true)
  offset += 4
  assertWithinBounds(bundle, offset, keyPackageLength, 'key package')
  return bundle.slice(offset, offset + keyPackageLength)
}

export const packFromtKeyShareBundle = (params: {
  keyPackage: Uint8Array
  pubKeyPackage: Uint8Array
  viewKey: Uint8Array
  network: number
  birthday: bigint
}): Uint8Array => {
  const { keyPackage, pubKeyPackage, viewKey, network, birthday } = params
  if (viewKey.length !== viewKeyLength) {
    throw new Error(`fromt view key must be ${viewKeyLength} bytes`)
  }

  const totalLength =
    1 + 1 + viewKeyLength + 8 + 4 + keyPackage.length + 4 + pubKeyPackage.length
  const bundle = new Uint8Array(totalLength)
  const view = new DataView(bundle.buffer)
  let offset = 0

  view.setUint8(offset, bundleVersion)
  offset += 1
  view.setUint8(offset, network)
  offset += 1
  bundle.set(viewKey, offset)
  offset += viewKeyLength
  view.setBigUint64(offset, birthday, true)
  offset += 8
  view.setUint32(offset, keyPackage.length, true)
  offset += 4
  bundle.set(keyPackage, offset)
  offset += keyPackage.length
  view.setUint32(offset, pubKeyPackage.length, true)
  offset += 4
  bundle.set(pubKeyPackage, offset)

  return bundle
}

export const packFromtReshareBundle = (
  result: FromtReshareResult,
  oldBundle: Uint8Array
): Uint8Array =>
  packFromtKeyShareBundle({
    keyPackage: result.keyPackage,
    pubKeyPackage: result.pubKeyPackage,
    viewKey: fromt_derive_view_key(oldBundle),
    network: fromt_keyshare_network(oldBundle),
    birthday: fromt_keyshare_birthday(oldBundle),
  })
