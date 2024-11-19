import { IAddressService } from './Address/IAddressService';
import { IBalanceService } from './Balance/IBalanceService';
import { ICoinService } from './Coin/ICoinService';
import { IFeeService } from './Fee/IFeeService';
import { IPriceService } from './Price/IPriceService';
import { IRpcService } from './Rpc/IRpcService';

export interface IService {
  rpcService: IRpcService;
  addressService: IAddressService;
  coinService: ICoinService;
  keygenService: any;
  balanceService: IBalanceService;
  priceService: IPriceService;
  feeService: IFeeService;
}
