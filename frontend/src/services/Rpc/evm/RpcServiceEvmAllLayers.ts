import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { CoinMeta } from '../../../model/coin-meta';
import { Endpoint } from '../../Endpoint';
import { ITokenService } from '../../Tokens/ITokenService';
import { RpcServiceEvm } from './RpcServiceEvm';

export class RpcServiceEthereum extends RpcServiceEvm implements ITokenService {
  constructor() {
    super(Endpoint.ethServiceRpcService);
  }

  async getTokens(nativeToken: Coin): Promise<CoinMeta[]> {
    return await super.getTokens(nativeToken);
  }
}

export class RpcServiceBase extends RpcServiceEvm implements ITokenService {
  constructor() {
    super(Endpoint.baseServiceRpcService);
  }

  async calculateFee(coin: Coin): Promise<number> {
    let gasLimit = 40000;
    if (!coin.isNativeToken) {
      gasLimit = 120000;
    }

    return gasLimit;
  }

  async getTokens(nativeToken: Coin): Promise<CoinMeta[]> {
    return await super.getTokens(nativeToken);
  }
}

export class RpcServiceArbitrum extends RpcServiceEvm implements ITokenService {
  constructor() {
    super(Endpoint.arbitrumOneServiceRpcService);
  }

  async calculateFee(_coin: Coin): Promise<number> {
    const gasLimit = 120000;
    return gasLimit;
  }

  async getTokens(nativeToken: Coin): Promise<CoinMeta[]> {
    return await super.getTokens(nativeToken);
  }
}

export class RpcServicePolygon extends RpcServiceEvm implements ITokenService {
  constructor() {
    super(Endpoint.polygonServiceRpcService);
  }

  async getTokens(nativeToken: Coin): Promise<CoinMeta[]> {
    return await super.getTokens(nativeToken);
  }
}

export class RpcServiceOptimism extends RpcServiceEvm implements ITokenService {
  constructor() {
    super(Endpoint.optimismServiceRpcService);
  }

  async calculateFee(coin: Coin): Promise<number> {
    let gasLimit = 40000;
    if (!coin.isNativeToken) {
      gasLimit = 120000;
    }

    return gasLimit;
  }

  async getTokens(nativeToken: Coin): Promise<CoinMeta[]> {
    return await super.getTokens(nativeToken);
  }
}

export class RpcServiceCronos extends RpcServiceEvm implements ITokenService {
  constructor() {
    super(Endpoint.cronosServiceRpcService);
  }

  async calculateFee(coin: Coin): Promise<number> {
    let gasLimit = 40000;
    if (!coin.isNativeToken) {
      gasLimit = 120000;
    }

    return gasLimit;
  }

  async getTokens(nativeToken: Coin): Promise<CoinMeta[]> {
    return await super.getTokens(nativeToken);
  }
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
}

export class RpcServiceBlast extends RpcServiceEvm implements ITokenService {
  constructor() {
    super(Endpoint.blastServiceRpcService);
  }

  async calculateFee(coin: Coin): Promise<number> {
    let gasLimit = 40000;
    if (!coin.isNativeToken) {
      gasLimit = 120000;
    }

    return gasLimit;
  }

  async getTokens(nativeToken: Coin): Promise<CoinMeta[]> {
    return await super.getTokens(nativeToken);
  }
}

export class RpcServiceBsc extends RpcServiceEvm implements ITokenService {
  constructor() {
    super(Endpoint.bscServiceRpcService);
  }

  async calculateFee(coin: Coin): Promise<number> {
    let gasLimit = 40000;
    if (!coin.isNativeToken) {
      gasLimit = 120000;
    }

    return gasLimit;
  }

  async getTokens(nativeToken: Coin): Promise<CoinMeta[]> {
    return await super.getTokens(nativeToken);
  }
}

export class RpcServiceAvalanche
  extends RpcServiceEvm
  implements ITokenService
{
  constructor() {
    super(Endpoint.avalancheServiceRpcService);
  }

  async getTokens(nativeToken: Coin): Promise<CoinMeta[]> {
    return await super.getTokens(nativeToken);
  }
}
