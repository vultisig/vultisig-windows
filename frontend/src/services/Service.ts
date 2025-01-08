import { ICoinService } from './Coin/ICoinService';
import { IService } from './IService';
import { IPriceService } from './Price/IPriceService';
import { IRpcService } from './Rpc/IRpcService';

export class Service implements IService {
  rpcService: IRpcService;
  coinService: ICoinService;
  priceService: IPriceService;

  constructor(
    rpcService: IRpcService,
    coinService: ICoinService,
    priceService: IPriceService
  ) {
    this.rpcService = rpcService;
    this.coinService = coinService;
    this.priceService = priceService;
  }
}
