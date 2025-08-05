import { Coin } from '@core/chain/coin/Coin'
import { PartialMatch } from '@lib/ui/base/PartialMatch'

import { ChainAction } from '../../ChainAction'
import { useDepositCoinCorrector } from '../../hooks/useDepositCoinCorrector'
import { useGetMayaChainBondableAssetsQuery } from '../../hooks/useGetMayaChainBondableAssetsQuery'
import { useDepositFormHandlers } from '../../providers/DepositFormHandlersProvider'
import { BondUnbondLPSpecific } from './BondUnboldLPSpecific/BondUnbondLPSpecific'
import { IBCTransferSpecific } from './IBCTransferSpecific/IBCTransferSpecific'
import { MergeSpecific } from './MergeSpecific/MergeSpecific'
import { MintSpecific } from './MintUnmintSpecific/MintSpecific/MintSpecific'
import { RedeemSpecific } from './MintUnmintSpecific/RedeemSpecific/RedeemSpecific'
import { StakeSpecific } from './StakeSpecific/StakeSpecific'
import { UnstakeSpecific } from './StakeSpecific/UnstakeSpecific/UnstakeSpecific'
import { SwitchSpecific } from './SwitchSpecific'
import { UnmergeSpecific } from './UnmergeSpecific/UnmergeSpecific'

type Props = {
  action: ChainAction
}

export const DepositActionSpecific = ({ action }: Props) => {
  useDepositCoinCorrector(action)
  const { data: bondableAssets = [] } = useGetMayaChainBondableAssetsQuery()
  const [{ getValues }] = useDepositFormHandlers()
  const selectedBondableAsset = getValues('bondableAsset')
  const selectedCoin = getValues('selectedCoin') as Coin | null

  return (
    <PartialMatch
      value={action}
      if={{
        bond_with_lp: () => (
          <BondUnbondLPSpecific
            assets={bondableAssets}
            selectedAsset={selectedBondableAsset}
          />
        ),
        unbond_with_lp: () => (
          <BondUnbondLPSpecific
            assets={bondableAssets}
            selectedAsset={selectedBondableAsset}
          />
        ),
        ibc_transfer: () => <IBCTransferSpecific />,
        merge: () => <MergeSpecific selectedCoin={selectedCoin} />,
        switch: () => <SwitchSpecific />,
        unstake: () => <UnstakeSpecific />,
        stake: () => <StakeSpecific />,
        unmerge: () => <UnmergeSpecific selectedCoin={selectedCoin} />,
        mint: () => <MintSpecific />,
        redeem: () => <RedeemSpecific />,
      }}
      else={() => null}
    />
  )
}
