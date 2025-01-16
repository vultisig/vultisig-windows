import { WalletCore } from '@trustwallet/wallet-core';
import {
  CoinType,
  PublicKey,
} from '@trustwallet/wallet-core/dist/src/wallet-core';

import { tss } from '../../../wailsjs/go/models';
import { getCoinType } from '../../chain/walletCore/getCoinType';
import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';
import { Chain } from '../../model/chain';
import {
  IBlockchainService,
  SignedTransactionResult,
} from './IBlockchainService';

export class BlockchainService implements IBlockchainService {
  chain: Chain;
  walletCore: WalletCore;
  coinType: CoinType;

  constructor(chain: Chain, walletCore: WalletCore) {
    this.chain = chain;
    this.walletCore = walletCore;
    this.coinType = getCoinType({ walletCore, chain });
  }

  getPreSignedInputData(_keysignPayload: KeysignPayload): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }

  getSignedTransaction(
    _vaultPublicKey: PublicKey,
    _txInputData: Uint8Array,
    _signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
    throw new Error('Method not implemented.');
  }
}
