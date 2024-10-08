/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { storage } from '../../../wailsjs/go/models';
import { EventsOn } from '../../../wailsjs/runtime/runtime';
import { KeysignPayload } from '../../gen/vultisig/keysign/v1/keysign_message_pb';
import { ChainUtils } from '../../model/chain';
import { useWalletCore } from '../../providers/WalletCoreProvider';
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
      try {
        if (keysignPayload.coin === undefined) {
          onError('Coin is not defined');
          return;
        }

        if (walletCore === undefined || walletCore === null) {
          onError('WalletCore is not defined');
          return;
        }

        const chain = ChainUtils.stringToChain(keysignPayload.coin.chain);
        if (chain === undefined) {
          onError('Chain is not defined');
          return;
        }

        const blockchainService = BlockchainServiceFactory.createService(
          chain,
          walletCore
        );

        let txBroadcastedHash =
          await blockchainService.signAndBroadcastTransaction(
            vault,
            messagesToSign,
            sessionID,
            hexEncryptionKey,
            serverURL,
            keysignPayload
          );

        console.log('txBroadcastedHash:', txBroadcastedHash);

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
