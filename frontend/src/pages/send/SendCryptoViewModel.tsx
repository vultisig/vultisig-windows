/* eslint-disable */
import { useState } from 'react';
import { IService } from '../../services/IService';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Vault } from '../../gen/vultisig/vault/v1/vault_pb';
import { ISendTransaction } from '../../model/send-transaction';
import { Balance } from '../../model/balance';

interface SendCryptoViewModel {
  tx: ISendTransaction;
  service: IService | null;
  showAlert: boolean;
  errorMessage: string;
  amount: string;
  isLoading: boolean;
  isCoinPickerActive: boolean;
  showMemoField: boolean;

  validateForm(): Promise<boolean>;
  setMaxValues(percentage: number): void;
  convertToFiat(amount: string): Promise<void>;
  moveToNextView(): void;
  handleCoinSelect(coin: Coin): void;
  handleAmountChange(newAmount: string): void;
  handleMaxPressed(percentage: number): void;
  setLoading(isLoading: boolean): void;
  setCoinPickerActive(isActive: boolean): void;
  setShowMemoField(show: boolean): void;
  setService(service: IService): void;
}

export function useSendCryptoViewModel(
  tx: ISendTransaction,
  balances: Map<Coin, Balance>
): SendCryptoViewModel {
  const [service, setService] = useState<IService | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [isCoinPickerActive, setCoinPickerActive] = useState(false);
  const [showMemoField, setShowMemoField] = useState(false);

  const validateForm = async (): Promise<boolean> => {
    // implement validation logic here
    return true;
  };

  const setMaxValues = (percentage: number) => {
    // implement set max values logic here
  };

  const convertToFiat = async (amount: string): Promise<void> => {
    // implement convert to fiat logic here
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
    convertToFiat(newAmount);
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
    isLoading,
    isCoinPickerActive,
    showMemoField,
    validateForm,
    setMaxValues,
    convertToFiat,
    moveToNextView,
    handleCoinSelect,
    handleAmountChange,
    handleMaxPressed,
    setLoading,
    setCoinPickerActive,
    setShowMemoField,
    setService,
  };
}
