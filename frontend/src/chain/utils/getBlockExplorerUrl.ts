import { match } from '../../lib/utils/match';
import { Chain } from '../../model/chain';

type ChainEntity = 'address' | 'tx';

type GetBlockExplorerUrlInput = {
  chainId: Chain;
  entity: ChainEntity;
  value: string;
};

export const getBlockExplorerUrl = ({
  chainId,
  entity,
  value,
}: GetBlockExplorerUrlInput): string => {
  return match(entity, {
    address: () =>
      match(chainId, {
        [Chain.Bitcoin]: () =>
          `https://blockchair.com/bitcoin/address/${value}`,
        [Chain.BitcoinCash]: () =>
          `https://blockchair.com/bitcoin-cash/address/${value}`,
        [Chain.Litecoin]: () =>
          `https://blockchair.com/litecoin/address/${value}`,
        [Chain.Dogecoin]: () =>
          `https://blockchair.com/dogecoin/address/${value}`,
        [Chain.Dash]: () => `https://blockchair.com/dash/address/${value}`,
        [Chain.THORChain]: () => `https://runescan.io/address/${value}`,
        [Chain.Solana]: () => `https://explorer.solana.com/address/${value}`,
        [Chain.Ethereum]: () => `https://etherscan.io/address/${value}`,
        [Chain.Cosmos]: () => `https://www.mintscan.io/cosmos/address/${value}`,
        [Chain.Dydx]: () => `https://www.mintscan.io/dydx/address/${value}`,
        [Chain.Kujira]: () =>
          `https://finder.kujira.network/kaiyo-1/address/${value}`,
        [Chain.Avalanche]: () => `https://snowtrace.io/address/${value}`,
        [Chain.BSC]: () => `https://bscscan.com/address/${value}`,
        [Chain.MayaChain]: () => `https://www.mayascan.org/address/${value}`,
        [Chain.Arbitrum]: () => `https://arbiscan.io/address/${value}`,
        [Chain.Base]: () => `https://basescan.org/address/${value}`,
        [Chain.Optimism]: () =>
          `https://optimistic.etherscan.io/address/${value}`,
        [Chain.Polygon]: () => `https://polygonscan.com/address/${value}`,
        [Chain.Blast]: () => `https://blastscan.io/address/${value}`,
        [Chain.CronosChain]: () => `https://cronoscan.com/address/${value}`,
        [Chain.Sui]: () => `https://suiscan.xyz/mainnet/address/${value}`,
        [Chain.Polkadot]: () => `https://polkadot.subscan.io/account/${value}`,
        [Chain.Zksync]: () => `https://explorer.zksync.io/address/${value}`,
      }),
    tx: () =>
      match(chainId, {
        [Chain.Bitcoin]: () =>
          `https://blockchair.com/bitcoin/transaction/${value}`,
        [Chain.BitcoinCash]: () =>
          `https://blockchair.com/bitcoin-cash/transaction/${value}`,
        [Chain.Litecoin]: () =>
          `https://blockchair.com/litecoin/transaction/${value}`,
        [Chain.Dogecoin]: () =>
          `https://blockchair.com/dogecoin/transaction/${value}`,
        [Chain.Dash]: () => `https://blockchair.com/dash/transaction/${value}`,
        [Chain.THORChain]: () => `https://runescan.io/tx/${value}`,
        [Chain.Solana]: () => `https://explorer.solana.com/tx/${value}`,
        [Chain.Ethereum]: () => `https://etherscan.io/tx/${value}`,
        [Chain.Cosmos]: () => `https://www.mintscan.io/cosmos/tx/${value}`,
        [Chain.Dydx]: () => `https://www.mintscan.io/dydx/tx/${value}`,
        [Chain.Kujira]: () =>
          `https://finder.kujira.network/kaiyo-1/tx/${value}`,
        [Chain.Avalanche]: () => `https://snowtrace.io/tx/${value}`,
        [Chain.BSC]: () => `https://bscscan.com/tx/${value}`,
        [Chain.MayaChain]: () => `https://www.mayascan.org/tx/${value}`,
        [Chain.Arbitrum]: () => `https://arbiscan.io/tx/${value}`,
        [Chain.Base]: () => `https://basescan.org/tx/${value}`,
        [Chain.Optimism]: () => `https://optimistic.etherscan.io/tx/${value}`,
        [Chain.Polygon]: () => `https://polygonscan.com/tx/${value}`,
        [Chain.Blast]: () => `https://blastscan.io/tx/${value}`,
        [Chain.CronosChain]: () => `https://cronoscan.com/tx/${value}`,
        [Chain.Sui]: () => `https://suiscan.xyz/mainnet/tx/${value}`,
        [Chain.Polkadot]: () =>
          `https://polkadot.subscan.io/extrinsic/${value}`,
        [Chain.Zksync]: () => `https://explorer.zksync.io/tx/${value}`,
      }),
  });
};
