import { ISendTransaction } from './ISendTransaction';

export interface ISendService {
  setMaxValues(tx: ISendTransaction, percentage: number): void;
  loadGasInfoForSending(tx: ISendTransaction): Promise<void>;
  getPriceRate(tx: ISendTransaction): Promise<number>;
  convertFiatToCoin(newValue: string, tx: ISendTransaction): Promise<void>;
  convertToFiat(
    newValue: string,
    tx: ISendTransaction,
    setMaxValue: boolean
  ): Promise<void>;
  validateAddress(tx: ISendTransaction, address: string): boolean; // This method should call the Address Service which will validate correcly the address
  validateForm(tx: ISendTransaction): Promise<boolean>; // Each chain validates different things, so this method should be implemented in each service
}
