import { Match } from '@lib/ui/base/Match'

import { StakeableAssetTicker, StakeableChain } from '../../../../config'
import { useDepositCoin } from '../../../../providers/DepositCoinProvider'
import { useDepositFormHandlers } from '../../../../providers/DepositFormHandlersProvider'
import { StakeSpecific } from '../StakeSpecific'
import { UnstakeTCYSpecific } from './UnstakeTCYSpecific'

export const UnstakeSpecific = () => {
  const [{ chain }] = useDepositFormHandlers()
  const [{ ticker: selectedCoinTicker }] = useDepositCoin()

  return (
    <>
      <StakeSpecific />
      <Match
        value={chain as StakeableChain}
        THORChain={() => (
          <>
            <Match
              value={selectedCoinTicker as StakeableAssetTicker}
              TCY={() => <UnstakeTCYSpecific />}
            />
          </>
        )}
        Ton={() => null}
      />
    </>
  )
}
