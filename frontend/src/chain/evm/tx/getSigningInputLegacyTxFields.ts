import { TW, WalletCore } from '@trustwallet/wallet-core';

import { Chain } from '../../../model/chain';
import { bigIntToHex } from '../../utils/bigIntToHex';
import { stripHexPrefix } from '../../utils/stripHexPrefix';
import { getCoinType } from '../../walletCore/getCoinType';

type Input = {
  chain: Chain;
  walletCore: WalletCore;
  gasPrice: bigint;
  gasLimit: bigint;
  nonce: bigint;
};

type Output = Pick<
  TW.Ethereum.Proto.SigningInput,
  'chainId' | 'nonce' | 'gasLimit' | 'gasPrice' | 'txMode'
>;

export const getSigningInputLegacyTxFields = ({
  chain,
  walletCore,
  gasPrice,
  gasLimit,
  nonce,
}: Input): Output => {
  const coinType = getCoinType({
    walletCore,
    chain,
  });

  const chainId: bigint = BigInt(walletCore.CoinTypeExt.chainId(coinType));

  return {
    chainId: Buffer.from(
      stripHexPrefix(
        chainId.toString(16).padStart(chain === Chain.Zksync ? 4 : 2, '0')
      ),
      'hex'
    ),
    nonce: Buffer.from(
      stripHexPrefix(bigIntToHex(nonce).padStart(2, '0')),
      'hex'
    ),
    txMode: TW.Ethereum.Proto.TransactionMode.Legacy,
    gasLimit: Buffer.from(stripHexPrefix(bigIntToHex(BigInt(gasLimit))), 'hex'),
    gasPrice: Buffer.from(stripHexPrefix(bigIntToHex(gasPrice)), 'hex'),
  };
};
