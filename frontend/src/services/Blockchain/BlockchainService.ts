/* eslint-disable */
import { WalletCore } from '@trustwallet/wallet-core';
import { tss } from '../../../wailsjs/go/models';
import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';
import { Chain } from '../../model/chain';
import {
  ISendTransaction,
  ISwapTransaction,
  ITransaction,
} from '../../model/transaction';
import { AddressServiceFactory } from '../Address/AddressServiceFactory';
import { IAddressService } from '../Address/IAddressService';
import { CoinServiceFactory } from '../Coin/CoinServiceFactory';
import { IBlockchainService } from './IBlockchainService';
import { SignedTransactionResult } from './signed-transaction-result';

export class BlockchainService implements IBlockchainService {
  chain: Chain;
  walletCore: WalletCore;
  coinType: any;
  addressService: IAddressService;
  constructor(chain: Chain, walletCore: WalletCore) {
    this.chain = chain;
    this.walletCore = walletCore;
    this.coinType = CoinServiceFactory.createCoinService(
      this.chain,
      walletCore
    ).getCoinType();
    this.addressService = AddressServiceFactory.createAddressService(
      this.chain,
      walletCore
    );
  }

  createKeysignPayload(
    obj: ITransaction | ISendTransaction | ISwapTransaction,
    localPartyId: string,
    publicKeyEcdsa: string
  ): KeysignPayload {
    const payload = new KeysignPayload();
    payload.coin = obj.coin;
    payload.toAddress = obj.toAddress;
    payload.toAmount = (obj.amount * 10 ** obj.coin.decimals).toString();
    payload.memo = obj.memo;

    payload.vaultLocalPartyId = localPartyId;
    payload.vaultPublicKeyEcdsa = publicKeyEcdsa;

    return payload;
  }

  isTHORChainSpecific(obj: any): boolean {
    throw new Error('Method not implemented.');
  }

  getSwapPreSignedInputData(
    keysignPayload: KeysignPayload,
    signingInput: any
  ): Uint8Array {
    throw new Error('Method not implemented.');
  }

  getPreSignedInputData(keysignPayload: KeysignPayload): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }

  getPreSignedImageHash(keysignPayload: KeysignPayload): Promise<string[]> {
    throw new Error('Method not implemented.');
  }

  getSignedTransaction(
    vaultHexPublicKey: string,
    vaultHexChainCode: string,
    data: KeysignPayload | Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<SignedTransactionResult> {
    throw new Error('Method not implemented.');
  }
}
