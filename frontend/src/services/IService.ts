import { IAddressService } from './Address/IAddressService';
import { IBalanceService } from './Balance/IBalanceService';
import { ICoinService } from './Coin/ICoinService';
import { IRpcService } from './Rpc/IRpcService';
import { ISendService } from './Send/ISendService';
import { IPriceService } from './Price/IPriceService';
import { IFeeService } from './Fee/IFeeService';

export interface IService {
  rpcService: IRpcService;
  addressService: IAddressService;
  coinService: ICoinService;
  keygenService: any;
  sendService: ISendService; // TODO: Rethink about this
  balanceService: IBalanceService;
  priceService: IPriceService;
  feeService: IFeeService;
}
