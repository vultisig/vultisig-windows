import { formatUnits } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { toChainAmount } from '../../../chain/utils/toChainAmount';
import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { Erc20ApprovePayload } from '../../../gen/vultisig/keysign/v1/erc20_approve_payload_pb';
import { SwapPayloadType } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { THORChainSwapPayload } from '../../../gen/vultisig/keysign/v1/thorchain_swap_payload_pb';
import { Coin } from '../../../lib/types/coin';
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
import { useSwapQuote } from '../state/selected-quote';
import { useSwapProtocol } from '../state/swap-protocol-type';
import { useCurrentSwapCoin } from '../state/swapCoin';
import { SwapProtocolType } from '../types';

export const SwapConfirm = () => {
  const { t } = useTranslation();
  const addresses = useCurrentVaultAddreses();
  const [coinKey] = useCurrentSwapCoin();
  const coin = useCurrentVaultCoin(coinKey);
  const balanceQuery = useBalanceQuery(storageCoinToCoin(coin));

  const [fromAmount] = useSwapAmount();
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
    console.log(allowance);
    setAllowance(allowance);
    return;
  }, [coin.chain, coin.contract_address, selectedSwapQuote?.router, sender]);

  useEffect(() => {
    if (isEvmErc20Asset(coin)) {
      fetchAllowance();
    }
  }, [coin, fetchAllowance, isEvmErc20Asset]);

  const buildERC20KeysignPayload = (
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
        }),
      },
      erc20ApprovePayload: new Erc20ApprovePayload({
        amount: fromAmount ? toChainAmount(fromAmount, coin.decimals) : '0',
        spender: selectedSwapQuote?.router,
      }),
    };
  };

  const onSubmit = async () => {
    const commonTx = {
      fromAddress: sender,
      amount: +shouldBePresent(fromAmount),
      memo: selectedSwapQuote?.memo || '',
      coin: storageCoinToCoin(coin),
      sendMaxAmount: isMaxAmount,
      specificTransactionInfo: shouldBePresent(specificTxInfoQuery.data),
    };
    if (isEvmErc20Asset(coin) && fromAmount) {
      console.log(+formatUnits(allowance, coin.decimals));
      console.log(+fromAmount);
      if (+formatUnits(allowance, coin.decimals) < +fromAmount) {
        console.log('we are here');
        const tx = buildERC20KeysignPayload({
          ...commonTx,
        });
        const keysignPayload = BlockchainServiceFactory.createService(
          coin.chain as Chain,
          walletCore
        ).createKeysignPayload(
          tx,
          vault.local_party_id,
          vault.public_key_ecdsa
        );
        console.log(keysignPayload);

        navigate('keysign', {
          state: { keysignPayload },
        });
        return;
      }
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
    }
  };

  return <Button onClick={onSubmit}>{t('continue')}</Button>;
};
