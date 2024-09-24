/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { storage, tss } from '../../../wailsjs/go/models';
import { Keysign } from '../../../wailsjs/go/tss/TssService';
import { EventsOn } from '../../../wailsjs/runtime/runtime';
import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';
import { ChainUtils } from '../../model/chain';
import { useWalletCore } from '../../providers/WalletCoreProvider';
import { CoinServiceFactory } from '../../services/Coin/CoinServiceFactory';
import { BlockchainServiceFactory } from '../../services/Blockchain/BlockchainServiceFactory';

interface KeysignViewProps {
  vault: storage.Vault;
  sessionID: string;
  keysignCommittee: string[];
  hexEncryptionKey: string;
  messagesToSign: string[];
  keysignPayload: KeysignPayload;
  serverURL: string;
  onDone: () => void;
  onError: (err: string) => void;
}

const KeysignView: React.FC<KeysignViewProps> = ({
  vault,
  sessionID,
  keysignCommittee,
  hexEncryptionKey,
  messagesToSign,
  keysignPayload,
  serverURL,
  onDone,
  onError,
}) => {
  const { t } = useTranslation();
  const walletCore = useWalletCore();

  const [currentStatus, setCurrentStatus] = useState<string>('');
  useEffect(() => {
    EventsOn('PrepareVault', data => {
      console.log('PrepareVault', data);
      setCurrentStatus(t('prepareVault'));
    });
    EventsOn('ECDSA', data => {
      console.log('Signing with ECDSA', data);
      setCurrentStatus(t('signing_ecdsa_key'));
    });
    EventsOn('EdDSA', data => {
      console.log('Signing with EDDSA', data);
      setCurrentStatus(t('signing_eddsa_key'));
    });
  }, []);
  useEffect(() => {
    console.log('keysign committee:', keysignCommittee);
    console.log('start keygen.....');
    async function kickoffKeygen() {
      if (keysignPayload.coin === undefined) {
        onError('Coin is not defined');
        return;
      }
      if (walletCore === undefined) {
        onError('WalletCore is not defined');
        return;
      }
      const chain = ChainUtils.stringToChain(keysignPayload.coin.chain);
      if (chain === undefined) {
        onError('Chain is not defined');
        return;
      }
      const coinService = CoinServiceFactory.createCoinService(
        chain,
        walletCore!
      );
      const blockchainService = BlockchainServiceFactory.createService(
        chain,
        walletCore!
      );
      const tssType = ChainUtils.getTssKeysignType(chain);
      try {
        const sigs = await Keysign(
          vault,
          messagesToSign,
          vault.local_party_id,
          walletCore!.CoinTypeExt.derivationPath(coinService.getCoinType()),
          sessionID,
          hexEncryptionKey,
          serverURL,
          tssType.toString().toLowerCase()
        );
        console.log('sigs:', sigs);

        const signatures: { [key: string]: tss.KeysignResponse } = {};

        console.log('messagesToSign:', messagesToSign);

        messagesToSign.forEach((msg, idx) => {
          signatures[msg] = sigs[idx];
        });

        console.log('signatures:', signatures);

        const signedTx = await blockchainService.getSignedTransaction(
          vault.public_key_ecdsa,
          vault.hex_chain_code,
          keysignPayload,
          signatures
        );

        console.log('signedTx:', signedTx);

        onDone();
      } catch (e) {
        console.error(e);
        onError(String(e));
      }
    }
    kickoffKeygen();
  }, []);
  return (
    <div className="flex flex-col items-center justify-center pt-20 text-white text-sm">
      <p className="mt-5">{currentStatus}</p>
      <img
        src="/assets/icons/wifi.svg"
        alt="wifi"
        className="mx-auto mb-4 w-8"
      />
      <p>{t('devices_on_same_wifi')}</p>
    </div>
  );
};
export default KeysignView;
