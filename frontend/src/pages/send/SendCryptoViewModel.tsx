/* eslint-disable */
import { useState } from 'react';
import { IService } from '../../services/IService';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { ISendTransaction } from '../../model/transaction';
import { Balance } from '../../model/balance';
import { Rate } from '../../model/price-rate';
import { ChainUtils } from '../../model/chain';
import { ServiceFactory } from '../../services/ServiceFactory';
import { SpecificGasInfo } from '../../model/gas-info';
import { useNavigate, useNavigation } from 'react-router-dom';

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
  gasInfo: SpecificGasInfo | null;
  gas: number;
  isGasInfoLoaded: boolean;

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
  loadGasInfoForSending(tx: ISendTransaction): Promise<void>;
  setGasInfo(gasInfo: SpecificGasInfo | null): void;
  setGas(gas: number): void;
  setIsGasInfoLoaded(isLoaded: boolean): void;
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
  const [gasInfo, setGasInfo] = useState<SpecificGasInfo | null>(null);
  const [gas, setGas] = useState<number>(0);
  const [isGasInfoLoaded, setIsGasInfoLoaded] = useState(false);

  const [step, setStep] = useState<'Send Crypto' | 'Verify Transaction'>(
    'Send Crypto'
  );

  const navigate = useNavigate();

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

  const Alert = (message: string) => {
    setErrorMessage(message);
    setShowAlert(true);
    console.error(message);
  };

  const validateForm = async (): Promise<boolean> => {
    if (!toAddress) {
      Alert('To address is not provided');
      return false;
    }

    if (!tx.coin) {
      Alert('Coin is not selected');
      return false;
    }

    if (!service) {
      Alert('Service is not initialized');
      return false;
    }

    if (amount === '') {
      Alert('Amount is not provided');
      return false;
    }

    if (isNaN(Number(amount))) {
      Alert('Invalid amount');
      return false;
    }

    if (Number(amount) <= 0) {
      Alert('Amount should be greater than 0');
      return false;
    }

    const isAddressValid =
      await service?.addressService.validateAddress(toAddress);
    if (!isAddressValid) {
      Alert('Invalid address');
      return false;
    }

    return true;
  };

  const setMaxValues = (percentage: number) => {
    const amountInDecimal =
      service?.sendService.calculateMaxValue(tx, percentage, balances, 0) ?? 0;

    setAmount(amountInDecimal.toString());
    convertToFiat(amountInDecimal);
    updateTransactionAmounts();
  };

  const convertToFiat = async (amount: number): Promise<void> => {
    const fiatAmount =
      (await service?.sendService.convertToFiat(tx.coin, priceRates, amount)) ??
      0;
    setAmountInFiat(fiatAmount.toString());
    updateTransactionAmounts();
  };

  const convertFromFiat = async (amountInFiat: number): Promise<void> => {
    const tokenAmount =
      (await service?.sendService.convertFromFiat(
        tx.coin,
        priceRates,
        amountInFiat
      )) ?? 0;

    setAmount(tokenAmount.toString());
    updateTransactionAmounts();
  };

  const moveToNextView = async (
    nextStep: 'Send Crypto' | 'Verify Transaction'
  ) => {
    if (await validateForm()) {
      tx.amount = Number(amount);
      tx.amountInFiat = Number(amountInFiat);
      tx.toAddress = toAddress;
      tx.specificGasInfo = gasInfo!;

      navigate('/vault/item/send/verify', {
        state: {
          tx: tx,
        },
      });
      // setStep(nextStep);
    }
  };

  const handleCoinSelect = (coin: Coin) => {
    tx.coin = coin;
    tx.fromAddress = coin.address;
  };

  const updateTransactionAmounts = () => {
    tx.amount = Number(amount);
    tx.amountInFiat = Number(amountInFiat);
  };

  const handleAmountChange = (newAmount: string) => {
    setAmount(newAmount);
    convertToFiat(Number(newAmount));
    updateTransactionAmounts();
  };

  const handleAmountInFiatChange = (amontInFiat: string) => {
    setAmountInFiat(amontInFiat);
    convertFromFiat(Number(amontInFiat));
    updateTransactionAmounts();
  };

  const handleToAddressChange = (toAddress: string) => {
    setToAddress(toAddress);
    tx.toAddress = toAddress;
  };

  const handleMaxPressed = (percentage: number) => {
    setMaxValues(percentage);
  };

  const loadGasInfoForSending = async (tx: ISendTransaction) => {
    if (!service) {
      console.error('Service is not initialized');
      return;
    }

    try {
      const gasInfo: SpecificGasInfo = await service.feeService.getFee(tx.coin);

      console.log('Gas info: ', gasInfo);
      tx.specificGasInfo = gasInfo;
      setGasInfo(gasInfo);
      setGas(tx.specificGasInfo.gasPrice);
    } catch (ex) {
      console.error('Failed to get gas info for sending, error: ', ex);
    }
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
    gasInfo,
    gas,
    isGasInfoLoaded,
    step,
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
    loadGasInfoForSending,
    setGasInfo,
    setGas,
    setIsGasInfoLoaded,
  };
}
