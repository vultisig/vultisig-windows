/* eslint-disable */
import { useState } from 'react';
import { IService } from '../../services/IService';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { ISendTransaction } from '../../model/send-transaction';
import { Balance } from '../../model/balance';
import { Rate } from '../../model/price-rate';
import { CoinMeta } from '../../model/coin-meta';
import { Fiat } from '../../model/fiat';

interface SendCryptoViewModel {
  tx: ISendTransaction;
  service: IService | null;
  showAlert: boolean;
  errorMessage: string;
  amount: string;
  amountInFiat: string;
  toAddress: string;
  isLoading: boolean;
  isCoinPickerActive: boolean;
  showMemoField: boolean;

  validateForm(): Promise<boolean>;
  setMaxValues(percentage: number): void;
  convertToFiat(amount: number): Promise<void>;
  convertFromFiat(amount: number): Promise<void>;
  moveToNextView(): void;
  handleCoinSelect(coin: Coin): void;
  handleAmountChange(newAmount: string): void;
  handleAmountInFiatChange(amountInFiat: string): void;
  handleToAddressChange(address: string): void;
  handleMaxPressed(percentage: number): void;
  setLoading(isLoading: boolean): void;
  setCoinPickerActive(isActive: boolean): void;
  setShowMemoField(show: boolean): void;
  setService(service: IService): void;
}

export function useSendCryptoViewModel(
  tx: ISendTransaction,
  balances: Map<Coin, Balance>,
  priceRates: Map<string, Rate[]>
): SendCryptoViewModel {
  const [service, setService] = useState<IService | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [amountInFiat, setAmountInFiat] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [isCoinPickerActive, setCoinPickerActive] = useState(false);
  const [showMemoField, setShowMemoField] = useState(false);

  const validateForm = async (): Promise<boolean> => {
    // implement validation logic here
    return true;
  };

  const setMaxValues = (percentage: number) => {
    const balance = balances.get(tx.coin)?.rawAmount ?? 0;
    const amount = balance * (percentage / 100);
    const amountInDecimal = amount / Math.pow(10, tx.coin.decimals);
    setAmount(amountInDecimal.toString());
    convertToFiat(amountInDecimal);
  };

  const convertToFiat = async (amount: number): Promise<void> => {
    // implement convert to fiat logic here
    const toCoinMeta = CoinMeta.fromCoin(tx.coin);
    const toSortedCoin = CoinMeta.sortedStringify(toCoinMeta);
    const rates: Rate[] = priceRates.get(toSortedCoin) ?? [];

    // TODO: Get the rate for the selected fiat on settings
    const rate = rates.find(rate => {
      return rate.fiat === Fiat.USD;
    });
    if (rate) {
      const fiatAmount = amount * rate.value;
      setAmountInFiat(fiatAmount.toString());
    }
  };

  const convertFromFiat = async (amountInFiat: number): Promise<void> => {
    // implement convert to fiat logic here
    const toCoinMeta = CoinMeta.fromCoin(tx.coin);
    const toSortedCoin = CoinMeta.sortedStringify(toCoinMeta);
    const rates: Rate[] = priceRates.get(toSortedCoin) ?? [];

    // TODO: Get the rate for the selected fiat on settings
    const rate = rates.find(rate => {
      return rate.fiat === Fiat.USD;
    });
    if (rate) {
      const tokenAmount = amountInFiat / rate.value;
      setAmount(tokenAmount.toString());
    }
  };

  const moveToNextView = () => {
    // implement move to next view logic here
  };

  const handleCoinSelect = (coin: Coin) => {
    tx.coin = coin;
    tx.fromAddress = coin.address;
  };

  const handleAmountChange = (newAmount: string) => {
    setAmount(newAmount);
    convertToFiat(Number(newAmount));
  };

  const handleAmountInFiatChange = (amontInFiat: string) => {
    setAmountInFiat(amontInFiat);
    convertFromFiat(Number(amontInFiat));
  };

  const handleToAddressChange = (toAddress: string) => {
    setToAddress(toAddress);
  };

  const handleMaxPressed = (percentage: number) => {
    setMaxValues(percentage);
  };

  return {
    tx,
    service,
    showAlert,
    errorMessage,
    amount,
    amountInFiat,
    toAddress,
    isLoading,
    isCoinPickerActive,
    showMemoField,
    validateForm,
    setMaxValues,
    convertToFiat,
    convertFromFiat,
    moveToNextView,
    handleCoinSelect,
    handleAmountChange,
    handleAmountInFiatChange,
    handleToAddressChange,
    handleMaxPressed,
    setLoading,
    setCoinPickerActive,
    setShowMemoField,
    setService,
  };
}
