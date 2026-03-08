import { Chain } from '@core/chain/Chain'
import { chainDerivationPath } from '@core/chain/derivationPath'
import { mnemonicToSeed } from '@core/mpc/frozt/mnemonicToSeed'
import { HDKey } from '@scure/bip32'

const ed25519Order = BigInt(
  '0x1000000000000000000000000000000014DEF9DEA2F79CD65812631A5CF5D3ED'
)

const scReduce32 = (key: Uint8Array): Uint8Array => {
  const reversed = new Uint8Array(key.length)
  for (let i = 0; i < key.length; i++) {
    reversed[key.length - 1 - i] = key[i]
  }

  let k = BigInt(0)
  for (const byte of reversed) {
    k = (k << BigInt(8)) | BigInt(byte)
  }
  k = k % ed25519Order

  const result = new Uint8Array(32)
  for (let i = 0; i < 32; i++) {
    result[i] = Number(k & BigInt(0xff))
    k >>= BigInt(8)
  }
  return result
}

export const mnemonicToMoneroSeed = (mnemonic: string): Uint8Array => {
  const bip39Seed = mnemonicToSeed(mnemonic)
  const master = HDKey.fromMasterSeed(bip39Seed)
  const child = master.derive(chainDerivationPath[Chain.Monero])
  return scReduce32(child.privateKey!)
}
