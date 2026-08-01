import { Address, beginCell, Cell } from '@ton/core'
import { Chain } from '@vultisig/core-chain/Chain'
import { tonAddressToBounceable } from '@vultisig/core-chain/chains/ton/address'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { Coin } from '@vultisig/core-chain/coin/Coin'

export const tonstakersPoolAddress =
  '0:a45b17f28409229b78360e3290420f13e4fe20f90d7e2bf8c4ac6703259e22fa'

export const tonstakersJettonMasterAddress =
  '0:bdf3fa8098d129b54b4f73b5bac5d1e1fd91eb054169c3916dfc8ccd536d1000'

export const tonstakersPoolBounceableAddress = tonAddressToBounceable(
  tonstakersPoolAddress
)

export const tonstakersDepositOpcode = 0x47d54391
export const tonstakersBurnOpcode = 0x595f07bc

/** Minimum user-entered stake and balance retained for pool/network fees. */
export const tonstakersMinStake = 1_000_000_000n
export const tonstakersFeeReserve = 1_000_000_000n

/** TON attached to the tsTON wallet burn request, matching the pool reference flow. */
export const tonstakersBurnMessageValue = 1_000_000_000n

export const tonstakersPositionId = 'ton-liquid-stake-tston'
export const tonNominatorPositionId = 'ton-stake-ton'
export const tonstakersNativeTicker = 'TON'

export const tonstakersReceiptCoin: Coin = {
  chain: Chain.Ton,
  id: tonstakersJettonMasterAddress,
  ticker: 'tsTON',
  decimals: 9,
  // Keep the familiar TON glyph while the card/title identifies Tonstakers.
  logo: chainFeeCoin[Chain.Ton].logo,
}

export const buildTonstakersDepositCell = (): Cell =>
  beginCell().storeUint(tonstakersDepositOpcode, 32).storeUint(0, 64).endCell()

type BuildTonstakersBurnCellInput = {
  amount: bigint
  responseAddress: string
  waitTillRoundEnd?: boolean
  fillOrKill?: boolean
}

/**
 * Builds the TEP-74 burn request consumed by the tsTON jetton wallet.
 *
 * Tonstakers forwards the referenced two-bit custom payload to its pool as
 * `wait_till_round_end` and `fill_or_kill`. The default `false/false` requests
 * an immediate withdrawal when liquid and otherwise accepts a withdrawal NFT.
 */
export const buildTonstakersBurnCell = ({
  amount,
  responseAddress,
  waitTillRoundEnd = false,
  fillOrKill = false,
}: BuildTonstakersBurnCellInput): Cell => {
  if (amount <= 0n) {
    throw new Error('Tonstakers burn amount must be positive')
  }

  const withdrawalOptions = beginCell()
    .storeBit(waitTillRoundEnd)
    .storeBit(fillOrKill)
    .endCell()

  return beginCell()
    .storeUint(tonstakersBurnOpcode, 32)
    .storeUint(0, 64)
    .storeCoins(amount)
    .storeAddress(Address.parse(responseAddress))
    .storeMaybeRef(withdrawalOptions)
    .endCell()
}

/** TonConnect expects a standard-base64, unindexed, non-CRC BoC payload. */
export const tonCellToPayload = (cell: Cell): string =>
  cell.toBoc({ idx: false, crc32: false }).toString('base64')

export const tonCellToCanonicalHex = (cell: Cell): string =>
  cell.toBoc({ idx: false, crc32: false }).toString('hex')
