import { IAddressService } from './Address/IAddressService';
import { IBalanceService } from './Balance/IBalanceService';
import { ICoinService } from './Coin/ICoinService';
import { IFeeService } from './Fee/IFeeService';
import { IService } from './IService';
import { IPriceService } from './Price/IPriceService';
import { IRpcService } from './Rpc/IRpcService';
import { ISendService } from './Send/ISendService';

export class Service implements IService {
  rpcService: IRpcService;
  addressService: IAddressService;
  coinService: ICoinService;
  keygenService: any;
  sendService: ISendService;
  balanceService: IBalanceService;
  priceService: IPriceService;
  feeService: IFeeService;

  constructor(
    rpcService: IRpcService,
    addressService: IAddressService,
    coinService: ICoinService,
    keygenService: any,
    sendService: ISendService,
    balanceService: IBalanceService,
    priceService: IPriceService,
    feeService: IFeeService
  ) {
    this.rpcService = rpcService;
    this.addressService = addressService;
    this.coinService = coinService;
    this.keygenService = keygenService;
    this.sendService = sendService;
    this.balanceService = balanceService;
    this.priceService = priceService;
    this.feeService = feeService;
  }
}
