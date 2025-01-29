import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { tss } from '../../../../wailsjs/go/models';
import { executeCosmosTx } from '../../../chain/cosmos/tx/executeCosmosTx';
import { CosmosChain } from '../../../model/chain';
import { BlockchainService } from '../BlockchainService';
import { IBlockchainService } from '../IBlockchainService';

export class BlockchainServiceMaya
  extends BlockchainService
  implements IBlockchainService
{
  async executeTransaction(
    publicKey: PublicKey,
    txInputData: Uint8Array,
    signatures: { [key: string]: tss.KeysignResponse }
  ): Promise<string> {
    return executeCosmosTx({
      publicKey,
      txInputData,
      signatures,
      walletCore: this.walletCore,
      chain: this.chain as CosmosChain,
    });
  }
}
