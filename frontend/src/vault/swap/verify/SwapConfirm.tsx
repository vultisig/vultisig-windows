import { formatUnits } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { toChainAmount } from '../../../chain/utils/toChainAmount';
import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { Erc20ApprovePayload } from '../../../gen/vultisig/keysign/v1/erc20_approve_payload_pb';
import { THORChainSwapPayload } from '../../../gen/vultisig/keysign/v1/thorchain_swap_payload_pb';
import { Coin } from '../../../lib/types/coin';
import { SwapPayloadType } from '../../../lib/types/swap';
import { Button } from '../../../lib/ui/buttons/Button';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { Chain, EvmChain } from '../../../model/chain';
import { ISendTransaction, TransactionType } from '../../../model/transaction';
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate';
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { BlockchainServiceFactory } from '../../../services/Blockchain/BlockchainServiceFactory';
import { RpcServiceEvm } from '../../../services/Rpc/evm/RpcServiceEvm';
import { getRPCServiceEndpoint } from '../../../services/Rpc/evm/utils';
import { convertChainToChainTicker } from '../../../utils/crypto';
import { getInboundAddressForChain } from '../../../utils/midgard';
import {
  useCurrentVault,
  useCurrentVaultAddreses,
  useCurrentVaultCoin,
} from '../../state/currentVault';
import { nativeTokenForChain } from '../../utils/helpers';
import { useSpecificSendTxInfoQuery } from '../queries/useSpecificSendTxInfoQuery';
import { useSwapAmount } from '../state/amount';
import { useCoinTo } from '../state/coin-to';
import { useSwapQuote } from '../state/selected-quote';
import { useSwapProtocol } from '../state/swap-protocol-type';
import { useCurrentSwapCoin } from '../state/swapCoin';
import { SwapProtocolType } from '../types';
import { useIsSwapConfirmDisabled } from './hooks/useIsSwapConfirmDisabled';

export const SwapConfirm = () => {
  const { t } = useTranslation();
  const addresses = useCurrentVaultAddreses();
  const [coinKey] = useCurrentSwapCoin();
  const coin = useCurrentVaultCoin(coinKey);
  const balanceQuery = useBalanceQuery(storageCoinToCoin(coin));
  const isSwapConfirmDisabled = useIsSwapConfirmDisabled();

  const [fromAmount] = useSwapAmount();
  const [coinTo] = useCoinTo();
  const [swapProtocol] = useSwapProtocol();
  const [selectedSwapQuote] = useSwapQuote();
  const [allowance, setAllowance] = useState(0n);

  const navigate = useAppNavigate();

  const walletCore = useAssertWalletCore();

  const vault = useCurrentVault();

  const specificTxInfoQuery = useSpecificSendTxInfoQuery();

  const sender = addresses[coin.chain as Chain];

  const isMaya =
    swapProtocol === SwapProtocolType.MAYA_STREAMING ||
    swapProtocol === SwapProtocolType.MAYA;

  const isThorchain =
    swapProtocol === SwapProtocolType.THORPriceOptimised ||
    swapProtocol === SwapProtocolType.THORTimeOptimised;

  const isEvmErc20Asset = useCallback(
    (asset: Coin): boolean => {
      return (
        [Chain.Ethereum, Chain.Avalanche, Chain.BSC, Chain.Arbitrum].some(
          chain => chain === asset.chain
        ) &&
        nativeTokenForChain[convertChainToChainTicker(coin.chain as Chain)] !==
          asset.ticker
      );
    },
    [coin.chain]
  );

  const balance = shouldBePresent(balanceQuery.data);

  const isMaxAmount =
    fromAmount === fromChainAmount(balance.amount, coin.decimals);

  const isAssetToSend = () => {
    const isThorAsset = coin.chain === Chain.THORChain;
    const isCacao = coin.chain === Chain.MayaChain && coin.ticker === 'CACAO';
    const isMaya =
      swapProtocol === SwapProtocolType.MAYA_STREAMING ||
      swapProtocol === SwapProtocolType.MAYA;
    if (isThorAsset || isCacao) {
      if (isCacao && isMaya) {
        return false;
      } else if (isMaya) {
        return true;
      }

      return false;
    }
    return !isEvmErc20Asset(coin);
  };

  const fetchAllowance = useCallback(async () => {
    const service = new RpcServiceEvm(
      getRPCServiceEndpoint(coin.chain as EvmChain)
    );
    const allowance = await service.fetchAllowance(
      coin.contract_address,
      sender,
      selectedSwapQuote?.router as string
    );
    setAllowance(allowance);
    return;
  }, [coin.chain, coin.contract_address, selectedSwapQuote?.router, sender]);

  useEffect(() => {
    if (isEvmErc20Asset(coin)) {
      fetchAllowance();
    }
  }, [coin, fetchAllowance, isEvmErc20Asset]);

  const buildSwapKeysignPayload = (
    tx: Omit<ISendTransaction, 'transactionType' | 'toAddress'>
  ) => {
    const toAddress = selectedSwapQuote?.router;
    return {
      ...tx,
      toAddress: toAddress || '',
      transactionType: TransactionType.SWAP,
      swapPayload: {
        case: isMaya ? SwapPayloadType.MAYA : SwapPayloadType.THORCHAIN,
        value: new THORChainSwapPayload({
          fromAddress: tx.fromAddress,
          fromCoin: coin,
          routerAddress: selectedSwapQuote?.router,
          fromAmount: fromAmount ? fromAmount.toString() : '0',
          expirationTime: selectedSwapQuote?.expiry,
          streamingInterval:
            selectedSwapQuote?.streaming_swap_seconds?.toString() || '',
          streamingQuantity:
            selectedSwapQuote?.max_streaming_quantity.toString(),
          toAmountDecimal: coinTo?.decimals.toString(),
          toAmountLimit: selectedSwapQuote?.expected_amount_out,
          vaultAddress: sender,
        }),
      },
      erc20ApprovePayload:
        fromAmount && +formatUnits(allowance, coin.decimals) < +fromAmount
          ? new Erc20ApprovePayload({
              amount: fromAmount
                ? toChainAmount(fromAmount, coin.decimals).toString()
                : '0',
              spender: selectedSwapQuote?.router,
            })
          : undefined,
    };
  };

  const isDepositTransaction =
    (coin.chain === Chain.MayaChain && isMaya) ||
    (coin.chain === Chain.THORChain && isThorchain);

  const onSubmit = async () => {
    const commonTx = {
      fromAddress: sender,
      amount: +shouldBePresent(fromAmount),
      memo: selectedSwapQuote?.memo || '',
      coin: storageCoinToCoin(coin),
      sendMaxAmount: isMaxAmount,
      specificTransactionInfo: shouldBePresent(specificTxInfoQuery.data),
    };
    if (isDepositTransaction) {
      const tx = {
        fromAddress: sender,
        toAddress: '',
        amount: shouldBePresent(fromAmount),
        memo: selectedSwapQuote?.memo as string,
        coin: storageCoinToCoin(coin),
        transactionType: TransactionType.DEPOSIT,
        specificTransactionInfo: specificTxInfoQuery.data,
      };
      const keysignPayload = BlockchainServiceFactory.createService(
        coinKey.chainId,
        walletCore
      ).createKeysignPayload(tx, vault.local_party_id, vault.public_key_ecdsa);

      navigate('keysign', {
        state: { keysignPayload },
      });
      return;
    }
    if (isAssetToSend()) {
      const inboundAddress = await getInboundAddressForChain(
        convertChainToChainTicker(coin.chain as Chain),
        isMaya
      );
      const tx: ISendTransaction = {
        ...commonTx,
        transactionType: TransactionType.SEND,
        toAddress: inboundAddress?.address || '',
      };
      const keysignPayload = BlockchainServiceFactory.createService(
        coin.chain as Chain,
        walletCore
      ).createKeysignPayload(tx, vault.local_party_id, vault.public_key_ecdsa);

      navigate('keysign', {
        state: { keysignPayload },
      });
      return;
    }
    const tx = buildSwapKeysignPayload({
      ...commonTx,
    });
    const keysignPayload = BlockchainServiceFactory.createService(
      coin.chain as Chain,
      walletCore
    ).createKeysignPayload(tx, vault.local_party_id, vault.public_key_ecdsa);

    navigate('keysign', {
      state: { keysignPayload },
    });
  };

  return (
    <Button
      onClick={onSubmit}
      isDisabled={
        isEvmErc20Asset(coin)
          ? 'This type of transaction is not supported yet.'
          : isSwapConfirmDisabled
      }
    >
      {t('continue')}
    </Button>
  );
};
