import { Match } from '@lib/ui/base/Match'

import { StakeableAssetTicker, StakeableChain } from '../../../../constants'
import { useDepositFormHandlers } from '../../../../providers/DepositFormHandlersProvider'
import { StakeSpecific } from '../StakeSpecific'
import { UnstakeTCYSpecific } from './UnstakeTCYSpecific'

export const UnstakeSpecific = () => {
  const [{ setValue, getValues, chain }] = useDepositFormHandlers()
  const selectedCoinTicker = getValues('selectedCoin')
    ?.ticker as StakeableAssetTicker | null

  return (
    <Match
      value={chain as StakeableChain}
      THORChain={() => (
        <>
          <StakeSpecific />
          <Match
            value={selectedCoinTicker ?? 'not-selected'}
            TCY={() => (
              <UnstakeTCYSpecific getValues={getValues} setValue={setValue} />
            )}
            not-selected={() => null}
          />
        </>
      )}
      Ton={() => null}
    />
  )
}
