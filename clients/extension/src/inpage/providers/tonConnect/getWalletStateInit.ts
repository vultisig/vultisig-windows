import { Address, beginCell } from '@ton/core'
import { WalletContractV4, WalletContractV5R1 } from '@ton/ton'

type GetWalletStateInitInput = {
  publicKeyHex: string
  /** The account address this response advertises. */
  address: Address
}

/**
 * Derives the walletStateInit (StateInit cell as base64) for the account a TON
 * Connect response advertises, used by `connect` and `restoreConnection`.
 *
 * The contract is chosen by deriving each one we support from the public key and
 * keeping the one that lands on the advertised address, rather than assuming a
 * version. A dApp verifying `ton_proof` hashes this cell and rejects the session
 * unless it derives the address alongside it, so the two cannot be allowed to
 * come from separate decisions: a vault on W5 was advertising its W5 address
 * with V4R2 state.
 *
 * StateInit TL-B: split_depth:(Maybe) special:(Maybe) code:(Maybe ^Cell) data:(Maybe ^Cell) library:(Maybe)
 */
export const getWalletStateInit = ({
  publicKeyHex,
  address,
}: GetWalletStateInitInput): string => {
  const publicKey = Buffer.from(publicKeyHex, 'hex')
  const workchain = address.workChain

  const wallet = [
    WalletContractV4.create({ workchain, publicKey }),
    WalletContractV5R1.create({ workchain, publicKey }),
  ].find(candidate => candidate.address.equals(address))

  if (!wallet) {
    throw new Error(
      `No supported TON wallet contract derives ${address.toString()} from this public key`
    )
  }

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
