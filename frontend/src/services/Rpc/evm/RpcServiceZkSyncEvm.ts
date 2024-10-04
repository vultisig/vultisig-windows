import { ethers } from 'ethers';

import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { CoinMeta } from '../../../model/coin-meta';
import { FeeMode } from '../../../model/evm-fee-mode';
import { SpecificEvm } from '../../../model/specific-transaction-info';
import { Endpoint } from '../../Endpoint';
import { ITokenService } from '../../Tokens/ITokenService';
import { RpcServiceEvm } from './RpcServiceEvm';

interface SpecificZkEvm {
  gasLimit: number;
  gasPerPubdataLimit: number;
  maxFeePerGas: number;
  maxPriorityFeePerGas: number;
  nonce: number;
}

export class RpcServiceZksync extends RpcServiceEvm implements ITokenService {
  constructor() {
    super(Endpoint.zksyncServiceRpcService);
  }

  async calculateFee(_coin: Coin): Promise<number> {
    const gasLimit = 200000;
    return gasLimit;
  }

  async getTokens(nativeToken: Coin): Promise<CoinMeta[]> {
    return await super.getTokens(nativeToken);
  }

  async getSpecificTransactionInfo(
    coin: Coin,
    _feeMode?: FeeMode
  ): Promise<SpecificEvm> {
    try {
      const [gasPrice] = await Promise.all([
        this.provider.send('eth_gasPrice', []),
      ]);

      const zkInfo: SpecificZkEvm = await this.getGasInfoZk(
        coin.address,
        '0000000000000000000000000000000000000000',
        'ffffffff'
      );

      const specificEvm: SpecificEvm = {
        fee: zkInfo.maxFeePerGas * zkInfo.gasLimit,
        gasPrice: Number(gasPrice),
        nonce: zkInfo.nonce,
        priorityFee: zkInfo.maxPriorityFeePerGas,
        priorityFeeWei: zkInfo.maxPriorityFeePerGas,
        gasLimit: zkInfo.gasLimit,
        maxFeePerGasWei: zkInfo.maxFeePerGas,
      } as SpecificEvm;

      return specificEvm;
    } catch (error) {
      console.error('getSpecificTransactionInfo::', error);
      return {
        fee: 0,
        gasPrice: 0,
        nonce: 0,
        priorityFee: 0,
        priorityFeeWei: 0,
        gasLimit: 0,
        maxFeePerGasWei: 0,
      } as SpecificEvm;
    }
  }

  async getGasInfoZk(
    fromAddress: string,
    toAddress: string,
    memo: string = '0xffffffff'
  ): Promise<SpecificZkEvm> {
    const memoDataHex = ethers.hexlify(ethers.toUtf8Bytes(memo));
    const data = memoDataHex;
    const noncePromise = this.provider.getTransactionCount(fromAddress);
    const feeEstimatePromise = this.zksEstimateFee(
      fromAddress,
      toAddress,
      data
    );

    const [nonce, feeEstimateValue] = await Promise.all([
      noncePromise,
      feeEstimatePromise,
    ]);

    return {
      gasLimit: Number(feeEstimateValue.gasLimit),
      gasPerPubdataLimit: Number(feeEstimateValue.gasPerPubdataLimit),
      maxFeePerGas: Number(feeEstimateValue.maxFeePerGas),
      maxPriorityFeePerGas: Number(feeEstimateValue.maxPriorityFeePerGas),
      nonce: nonce,
    };
  }

  private async zksEstimateFee(
    fromAddress: string,
    toAddress: string,
    data: string
  ): Promise<{
    gasLimit: bigint;
    gasPerPubdataLimit: bigint;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
  }> {
    const result = await this.provider.send('zks_estimateFee', [
      {
        from: fromAddress,
        to: toAddress,
        data: data,
      },
    ]);

    return {
      gasLimit: BigInt(result.gas_limit),
      gasPerPubdataLimit: BigInt(result.gas_per_pubdata_limit),
      maxFeePerGas: BigInt(result.max_fee_per_gas),
      maxPriorityFeePerGas: BigInt(result.max_priority_fee_per_gas),
    };
  }
}
