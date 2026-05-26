import { SwapAffiliateConfig } from '@vultisig/core-chain/swap/quote/findSwapQuote'

declare const __VULTISIG_STATION_KYBER_SOURCE__: string | undefined

export const stationNativeSwapAffiliateName = 'stvs'

export const stationSwapAffiliateFeeReceiver =
  '0x649E1289fD780C2F9A3D27476511283EB0d0076D'

export const stationKyberSwapFallbackSource = 'vultisig-v0'

export const stationKyberSwapSource =
  typeof __VULTISIG_STATION_KYBER_SOURCE__ !== 'undefined' &&
  __VULTISIG_STATION_KYBER_SOURCE__
    ? __VULTISIG_STATION_KYBER_SOURCE__
    : stationKyberSwapFallbackSource

export const stationSwapAffiliateConfig = {
  native: {
    affiliateFeeAddress: stationNativeSwapAffiliateName,
    referralDiscountAffiliateFeeRateBps: 35,
    referrerFeeRateBps: 10,
  },
  oneInch: {
    referrer: stationSwapAffiliateFeeReceiver,
  },
  kyber: {
    source: stationKyberSwapSource,
    referral: stationSwapAffiliateFeeReceiver,
  },
} satisfies SwapAffiliateConfig
