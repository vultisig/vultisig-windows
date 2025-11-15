import { create } from '@bufbuild/protobuf'
import { getRippleAccountInfo } from '@core/chain/chains/ripple/account/info'
import { getRippleNetworkInfo } from '@core/chain/chains/ripple/network/info'
import { RippleSpecificSchema } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt } from '@lib/utils/attempt'
import { isInError } from '@lib/utils/error/isInError'
import { maxBigInt } from '@lib/utils/math/maxBigInt'

import { getKeysignCoin } from '../../utils/getKeysignCoin'
import { GetChainSpecificResolver } from '../resolver'

const minProtocolFee = 15n
const baseFeeMultiplier = 2n

export const getRippleChainSpecific: GetChainSpecificResolver<
  'rippleSpecific'
> = async ({ keysignPayload }) => {
  const { address } = getKeysignCoin(keysignPayload)
  const toAddress = shouldBePresent(keysignPayload.toAddress)

  const [senderAccount, networkInfo, destinationAccountResult] =
    await Promise.all([
      getRippleAccountInfo(address),
      getRippleNetworkInfo(),
      attempt(getRippleAccountInfo(toAddress)),
    ])

  const { validated_ledger, load_factor, load_base } = networkInfo
  const { base_fee, reserve_base } = shouldBePresent(validated_ledger)

  const computedFee =
    ((BigInt(base_fee) * BigInt(load_factor)) / BigInt(load_base)) *
    baseFeeMultiplier

  const networkFee = maxBigInt(computedFee, minProtocolFee)

  const getAccountActivationFee = () => {
    if (
      'error' in destinationAccountResult &&
      isInError(destinationAccountResult.error, 'Account not found')
    ) {
      return BigInt(reserve_base)
    }

    return 0n
  }

  const { account_data, ledger_current_index } = senderAccount

  return create(RippleSpecificSchema, {
    sequence: BigInt(account_data.Sequence),
    lastLedgerSequence: BigInt((ledger_current_index ?? 0) + 60),
    gas: networkFee + getAccountActivationFee(),
  })
}
