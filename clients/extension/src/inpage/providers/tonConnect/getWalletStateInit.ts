import { beginCell } from '@ton/core'
import { WalletContractV4 } from '@ton/ton'

/**
 * Derives the walletStateInit (StateInit cell as base64) for TON Wallet V4 R2
 * from a hex-encoded public key. Used for TON Connect connect/restoreConnection responses.
 *
 * StateInit TL-B: split_depth:(Maybe) special:(Maybe) code:(Maybe ^Cell) data:(Maybe ^Cell) library:(Maybe)
 */
export const getWalletStateInit = (publicKeyHex: string): string => {
  const publicKeyBuffer = Buffer.from(publicKeyHex, 'hex')
  const wallet = WalletContractV4.create({
    workchain: 0,
    publicKey: publicKeyBuffer,
  })
  const { code, data } = wallet.init
  const stateInitCell = beginCell()
    .storeBit(0) // no split_depth
    .storeBit(0) // no special
    .storeBit(1) // has code
    .storeRef(code)
    .storeBit(1) // has data
    .storeRef(data)
    .storeBit(0) // no library
    .endCell()
  return Buffer.from(stateInitCell.toBoc()).toString('base64')
}
