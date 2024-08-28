/* eslint-disable */
import { useState } from 'react';
import { IService } from '../../services/IService';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { ISendTransaction } from '../../model/send-transaction';
import { Balance } from '../../model/balance';
import { Rate } from '../../model/price-rate';
import { CoinMeta } from '../../model/coin-meta';
import { Fiat } from '../../model/fiat';
import { ChainUtils } from '../../model/chain';
import { ServiceFactory } from '../../services/ServiceFactory';

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
  step: 'Send Crypto' | 'Verify Transaction';

  initializeService(walletCore: any, chain: string): void;
  validateForm(): Promise<boolean>;
  setMaxValues(percentage: number): void;
  convertToFiat(amount: number): Promise<void>;
  convertFromFiat(amount: number): Promise<void>;
  moveToNextView(step: string): void;
  handleCoinSelect(coin: Coin): void;
  handleAmountChange(newAmount: string): void;
  handleAmountInFiatChange(amountInFiat: string): void;
  handleToAddressChange(address: string): void;
  handleMaxPressed(percentage: number): void;
  setLoading(isLoading: boolean): void;
  setCoinPickerActive(isActive: boolean): void;
  setShowMemoField(show: boolean): void;
  setService(service: IService): void;
  setStep(step: 'Send Crypto' | 'Verify Transaction'): void;
  setShowAlert(showAlert: boolean): void;
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

  const [step, setStep] = useState<'Send Crypto' | 'Verify Transaction'>(
    'Send Crypto'
  );

  const initializeService = async (walletCore: any, chain: string) => {
    if (!walletCore) {
      console.error('WalletCore is not initialized');
      return;
    }

    if (!chain) {
      console.error('Chain is not provided');
      return;
    }

    const chainEnum = ChainUtils.stringToChain(chain);
    if (!chainEnum) {
      console.error('Chain is not supported');
      return;
    }

    const service = ServiceFactory.getService(chainEnum, walletCore);
    setService(service);
  };

  const validateForm = async (): Promise<boolean> => {
    if (!toAddress) {
      alert('To address is not provided');
      setErrorMessage('To address is not provided');
      setShowAlert(true);
      console.error('To address is not provided');
      return false;
    }

    if (!tx.coin) {
      alert('Coin is not selected');
      setErrorMessage('Coin is not selected');
      setShowAlert(true);
      console.error('Coin is not selected');
      return false;
    }

    if (!service) {
      alert('Service is not initialized');
      setErrorMessage('Service is not initialized');
      setShowAlert(true);
      console.error('Service is not initialized');
      return false;
    }

    const isAddressValid =
      await service?.addressService.validateAddress(toAddress);
    if (!isAddressValid) {
      alert('Invalid address');
      setErrorMessage('Invalid address');
      setShowAlert(true);
      console.error('Invalid address');
      return false;
    }
    return true;
  };

  const setMaxValues = (percentage: number) => {
    const balance = balances.get(tx.coin)?.rawAmount ?? 0;
    const amount = balance * (percentage / 100);
    const amountInDecimal = amount / Math.pow(10, tx.coin.decimals);
    setAmount(amountInDecimal.toString());
    convertToFiat(amountInDecimal);
    tx.amount = amountInDecimal;
    tx.amountInFiat = Number(amountInFiat);
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
      tx.amount = amount;
      tx.amountInFiat = Number(amountInFiat);
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

      tx.amount = tokenAmount;
      tx.amountInFiat = Number(amountInFiat);
    }
  };

  const moveToNextView = async (
    nextStep: 'Send Crypto' | 'Verify Transaction'
  ) => {
    if (await validateForm()) {
      setStep(nextStep);
    }
  };

  const handleCoinSelect = (coin: Coin) => {
    tx.coin = coin;
    tx.fromAddress = coin.address;
  };

  const handleAmountChange = (newAmount: string) => {
    setAmount(newAmount);
    convertToFiat(Number(newAmount));
    tx.amount = Number(amount);
  };

  const handleAmountInFiatChange = (amontInFiat: string) => {
    setAmountInFiat(amontInFiat);
    convertFromFiat(Number(amontInFiat));
    tx.amountInFiat = Number(amontInFiat);
  };

  const handleToAddressChange = (toAddress: string) => {
    setToAddress(toAddress);
    tx.toAddress = toAddress;
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
    initializeService,
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
    setShowAlert,
    setService,
    setStep,
    step,
  };
}
