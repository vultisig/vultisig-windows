import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { match } from '@lib/utils/match';
import { TW } from '@trustwallet/wallet-core';
import Long from 'long';

import { UtxoChain } from '../../../model/chain';
import { utxoChainScriptType } from '../../utxo/UtxoScriptType';
import { getCoinType } from '../../walletCore/getCoinType';
import { hexEncode } from '../../walletCore/hexEncode';
import { GetPreSignedInputDataInput } from './GetPreSignedInputDataInput';

export const getUtxoPreSignedInputData = ({
  keysignPayload,
  walletCore,
  chain,
  chainSpecific,
}: GetPreSignedInputDataInput<'utxoSpecific'>) => {
  const { byteFee, sendMaxAmount } = chainSpecific;

  const coin = shouldBePresent(keysignPayload.coin);

  const coinType = getCoinType({
    walletCore,
    chain,
  });

  const lockScript = walletCore.BitcoinScript.lockScriptForAddress(
    coin.address,
    coinType
  );

  const scriptType = utxoChainScriptType[coin.chain as UtxoChain];

  const pubKeyHash = match(scriptType, {
    wpkh: () => lockScript.matchPayToWitnessPublicKeyHash(),
    pkh: () => lockScript.matchPayToPubkeyHash(),
  });

  const scriptKey = hexEncode({
    value: pubKeyHash,
    walletCore,
  });

  const script = match(scriptType, {
    wpkh: () =>
      walletCore.BitcoinScript.buildPayToWitnessPubkeyHash(pubKeyHash).data(),
    pkh: () =>
      walletCore.BitcoinScript.buildPayToPublicKeyHash(pubKeyHash).data(),
  });

  const input = TW.Bitcoin.Proto.SigningInput.create({
    hashType: walletCore.BitcoinScript.hashTypeForCoin(coinType),
    amount: Long.fromString(keysignPayload.toAmount),
    useMaxAmount: sendMaxAmount,
    toAddress: keysignPayload.toAddress,
    changeAddress: coin.address,
    byteFee: Long.fromString(byteFee),
    coinType: coinType.value,

    scripts: {
      [scriptKey]: script,
    },

    utxo: keysignPayload.utxoInfo.map(({ hash, amount, index }) =>
      TW.Bitcoin.Proto.UnspentTransaction.create({
        amount: Long.fromString(amount.toString()),
        outPoint: TW.Bitcoin.Proto.OutPoint.create({
          hash: walletCore.HexCoding.decode(hash).reverse(),
          index: index,
          sequence: 0xffffffff,
        }),
        script: lockScript.data(),
      })
    ),
  });

  if (keysignPayload.memo) {
    const encoder = new TextEncoder();
    input.outputOpReturn = encoder.encode(keysignPayload.memo);
  }

  const inputData = TW.Bitcoin.Proto.SigningInput.encode(input).finish();

  const plan = walletCore.AnySigner.plan(inputData, coinType);

  input.plan = TW.Bitcoin.Proto.TransactionPlan.decode(plan);

  return TW.Bitcoin.Proto.SigningInput.encode(input).finish();
};
