import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'

import { blockTimeSec } from '../config'
import { getAffiliateVolume } from './getAffiliateVolume'
import {
  fetchUserValidName,
  ValidThorchainNameDetails,
} from './getUserValidThorchainName'

export type ReferralDashboard = ValidThorchainNameDetails & {
  collectedRune: number
  expiresOn: Date
}

export const getReferralDashboard = async (
  address: string
): Promise<ReferralDashboard | undefined> => {
  const nameDetails = await fetchUserValidName(address)

  if (!nameDetails) return undefined

  const [{ meta }] = await Promise.all([getAffiliateVolume(nameDetails.name)])

  const collectedRune = +meta.volume / chainFeeCoin.THORChain.decimals

  const expiresOn = new Date(
    Date.now() + nameDetails.remainingBlocks * blockTimeSec * 1000
  )

  return { ...nameDetails, collectedRune, expiresOn }
}
