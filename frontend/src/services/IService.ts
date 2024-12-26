import { IBalanceService } from './Balance/IBalanceService';
import { ICoinService } from './Coin/ICoinService';
import { IPriceService } from './Price/IPriceService';
import { IRpcService } from './Rpc/IRpcService';

export interface IService {
  rpcService: IRpcService;
  coinService: ICoinService;
  balanceService: IBalanceService;
  priceService: IPriceService;
}
