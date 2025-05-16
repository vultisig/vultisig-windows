import { Match } from '@lib/ui/base/Match'

import { StakeableAssetTicker } from '../../../../constants'
import { useDepositFormHandlers } from '../../../../providers/DepositFormHandlersProvider'
import { StakeSpecific } from '../StakeSpecific'
import { UnstakeTCYSpecific } from './UnstakeTCYSpecific'

export const UnstakeSpecific = () => {
  const [{ setValue, getValues }] = useDepositFormHandlers()
  const selectedCoinTicker = getValues('selectedCoin')
    ?.ticker as StakeableAssetTicker

  return (
    <>
      <StakeSpecific />
      <Match
        value={selectedCoinTicker}
        TCY={() => (
          <UnstakeTCYSpecific getValues={getValues} setValue={setValue} />
        )}
      />
    </>
  )
}
