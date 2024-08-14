/* eslint-disable */

import { ISendService } from '../ISendService';
import { ISendTransaction } from '../ISendTransaction';

export class SendServiceThorchain implements ISendService {
  setMaxValues(tx: ISendTransaction, percentage: number): void {
    throw new Error('Method not implemented.');
  }
  loadGasInfoForSending(tx: ISendTransaction): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getPriceRate(tx: ISendTransaction): Promise<number> {
    throw new Error('Method not implemented.');
  }
  convertFiatToCoin(newValue: string, tx: ISendTransaction): Promise<void> {
    throw new Error('Method not implemented.');
  }
  convertToFiat(
    newValue: string,
    tx: ISendTransaction,
    setMaxValue: boolean
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  validateAddress(tx: ISendTransaction, address: string): boolean {
    throw new Error('Method not implemented.');
  }
  validateForm(tx: ISendTransaction): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
