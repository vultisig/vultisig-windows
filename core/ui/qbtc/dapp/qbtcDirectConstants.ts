/**
 * QBTC chain constants used when building Cosmos transactions for the
 * `sign_and_broadcast` dApp method. Values mirror the SDK's QBTCHelper.ts.
 */

/** Cosmos SDK chain ID used in the SignDoc. */
export const qbtcChainId = 'qbtc'

/** Native fee denom for QBTC. */
export const qbtcFeeDenom = 'qbtc'

/** Type URL for the QBTC MLDSA public-key Any. */
export const qbtcMldsaPubKeyTypeUrl = '/cosmos.crypto.mldsa.PubKey'

/**
 * Default fee for QBTC transactions when the dApp does not supply one.
 * QBTC enforces a flat `min_tx_fee` of 800 uqbtc; gas_limit is informational
 * but kept at the SDK helper's default of 300_000 for parity.
 */
export const qbtcDefaultFeeAmount = '800'
export const qbtcDefaultGasLimit = 300000n
