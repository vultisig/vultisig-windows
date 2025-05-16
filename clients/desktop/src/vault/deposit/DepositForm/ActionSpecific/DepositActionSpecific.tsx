import { Chain } from '@core/chain/Chain'
import { Coin } from '@core/chain/coin/Coin'
import { Match } from '@lib/ui/base/Match'

import { ChainAction } from '../../ChainAction'
import { useGetMayaChainBondableAssetsQuery } from '../../hooks/useGetMayaChainBondableAssetsQuery'
import { useDepositFormHandlers } from '../../providers/DepositFormHandlersProvider'
import { BondUnbondLPSpecific } from './BondUnboldLPSpecific/BondUnbondLPSpecific'
import { IBCTransferSpecific } from './IBCTransferSpecific/IBCTransferSpecific'
import { MergeSpecific } from './MergeSpecific/MergeSpecific'
import { StakeSpecific } from './StakeSpecific/StakeSpecific'
import { UnstakeSpecific } from './StakeSpecific/UnstakeSpecific/UnstakeSpecific'
import { SwitchSpecific } from './SwitchSpecific'

type Props = {
  chain: Chain
  action: ChainAction
}

export const DepositActionSpecific = ({ chain, action }: Props) => {
  const { data: bondableAssets = [] } = useGetMayaChainBondableAssetsQuery()
  const [{ getValues }] = useDepositFormHandlers()
  const selectedBondableAsset = getValues('bondableAsset')
  const selectedCoin = getValues('selectedCoin') as Coin | null

  return (
    <Match
      value={action}
      bond_with_lp={() => (
        <BondUnbondLPSpecific
          assets={bondableAssets}
          selectedAsset={selectedBondableAsset}
        />
      )}
      unbond_with_lp={() => (
        <BondUnbondLPSpecific
          assets={bondableAssets}
          selectedAsset={selectedBondableAsset}
        />
      )}
      ibc_transfer={() => <IBCTransferSpecific chain={chain} />}
      merge={() => <MergeSpecific selectedCoin={selectedCoin} />}
      switch={() => <SwitchSpecific />}
      unstake_tcy={() => <UnstakeSpecific />}
      stake_tcy={() => <StakeSpecific />}
      bond={() => null}
      unbond={() => null}
      leave={() => null}
      custom={() => null}
      vote={() => null}
      stake={() => null}
      unstake={() => null}
    />
  )
}
