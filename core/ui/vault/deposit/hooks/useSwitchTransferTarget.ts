import { useQuery } from '@tanstack/react-query'
import { getThorchainInboundAddress } from '@vultisig/core-chain/chains/cosmos/thor/getThorchainInboundAddress'

export const useSwitchTransferTargetQuery = () =>
  useQuery({
    queryKey: ['switchTransferTarget'],
    queryFn: async () => {
      const data = await getThorchainInboundAddress()
      const gaia = data.find((item: any) => item.chain === 'GAIA')
      if (
        gaia &&
        !gaia.halted &&
        !gaia.global_trading_paused &&
        !gaia.chain_lp_actions_paused
      ) {
        return gaia.address
      }
    },
  })
