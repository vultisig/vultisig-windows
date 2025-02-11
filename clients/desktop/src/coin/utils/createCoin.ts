import { create } from '@bufbuild/protobuf';
import { Coin } from '@core/chain/coin/Coin';
import { CoinSchema } from '@core/communication/vultisig/keysign/v1/coin_pb';
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';
import { WalletCore } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { deriveAddress } from '../../chain/utils/deriveAddress';
import { stripHexPrefix } from '../../chain/utils/stripHexPrefix';
import { isFeeCoin } from './isFeeCoin';

type CreateCoinInput = {
  coin: Coin;
  publicKey: PublicKey;
  walletCore: WalletCore;
};

export const createCoin = ({
  coin,
  publicKey,
  walletCore,
}: CreateCoinInput) => {
  const address = deriveAddress({
    chain: coin.chain,
    publicKey,
    walletCore,
  });

  const hexPublicKey = stripHexPrefix(
    walletCore.HexCoding.encode(publicKey.data())
  );

  const isNativeToken = isFeeCoin(coin);

  return create(CoinSchema, {
    ...coin,
    address: address,
    hexPublicKey,
    isNativeToken,
    contractAddress: isNativeToken ? coin.ticker : coin.id,
  });
};
