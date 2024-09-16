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

  async getTokens(nativeToken: Coin): Promise<CoinMeta[]> {
    return await super.getTokens(nativeToken);
  }
}

export class RpcServiceArbitrum extends RpcServiceEvm implements ITokenService {
  constructor() {
    super(Endpoint.arbitrumOneServiceRpcService);
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

  async getTokens(nativeToken: Coin): Promise<CoinMeta[]> {
    return await super.getTokens(nativeToken);
  }
}

export class RpcServiceCronos extends RpcServiceEvm implements ITokenService {
  constructor() {
    super(Endpoint.cronosServiceRpcService);
  }

  async getTokens(nativeToken: Coin): Promise<CoinMeta[]> {
    return await super.getTokens(nativeToken);
  }
}

export class RpcServiceZksync extends RpcServiceEvm implements ITokenService {
  constructor() {
    super(Endpoint.zksyncServiceRpcService);
  }

  async getTokens(nativeToken: Coin): Promise<CoinMeta[]> {
    return await super.getTokens(nativeToken);
  }
}

export class RpcServiceBlast extends RpcServiceEvm implements ITokenService {
  constructor() {
    super(Endpoint.blastServiceRpcService);
  }

  async getTokens(nativeToken: Coin): Promise<CoinMeta[]> {
    return await super.getTokens(nativeToken);
  }
}

export class RpcServiceBsc extends RpcServiceEvm implements ITokenService {
  constructor() {
    super(Endpoint.bscServiceRpcService);
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
    super(Endpoint.arbitrumOneServiceRpcService);
  }

  async getTokens(nativeToken: Coin): Promise<CoinMeta[]> {
    return await super.getTokens(nativeToken);
  }
}
