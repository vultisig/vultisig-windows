import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { storage } from '../../../wailsjs/go/models';
import KeygenBackupNow from '../../components/keygen/KeygenBackupNow';
import KeygenDone from '../../components/keygen/KeygenDone';
import KeygenNameVault from '../../components/keygen/KeygenNameVault';
import KeygenPeerDiscovery from '../../components/keygen/KeygenPeerDiscovery';
import KeygenVerify from '../../components/keygen/KeygenVerify';
import KeygenView from '../../components/keygen/KeygenView';
import NavBar from '../../components/navbar/NavBar';
import { useAppPathParams } from '../../navigation/hooks/useAppPathParams';
import { Endpoint } from '../../services/Endpoint';
import { startSession } from '../../services/Keygen/Keygen';
import { KeygenType } from '../../vault/keygen/KeygenType';
import { KeygenFailedState } from '../../vault/keygen/shared/KeygenFailedState';
import { generateLocalPartyId } from '../../vault/keygen/utils/generateLocalPartyId';

const SetupVaultView: React.FC = () => {
  const { t } = useTranslation();
  const [currentScreen, setCurrentScreen] = useState<number>(0);
  const [vaultName, setVaultName] = useState<string>(t('main_vault'));
  const [sessionID, setSessionID] = useState<string>();
  const [devices, setDevices] = useState<string[]>([]);
  const [localPartyId, setLocalPartyId] = useState<string>('');
  const [keygenError, setKeygenError] = useState<string>('');
  const [{ thresholdType }] = useAppPathParams<'setupVaultInitiatingDevice'>();
  const [isRelay, setIsRelay] = useState(true);
  const [hexEncryptionKey, setHexEncryptionKey] = useState<string>('');
  const [serverURL, setServerURL] = useState<string>('http://localhost:18080');
  const vault = useRef<storage.Vault>(new storage.Vault());
  const keygenType = useRef<KeygenType>(KeygenType.Keygen);

  useEffect(() => {
    setKeygenError('');
    // when current vault's local party is empty , means it is a new vault
    if (
      vault.current.local_party_id === undefined ||
      vault.current.local_party_id === ''
    ) {
      // new vault
      vault.current.local_party_id = generateLocalPartyId();
    }
    setLocalPartyId(vault.current.local_party_id);
  }, []);

  const prevScreen = () => {
    setCurrentScreen(prev => {
      if (prev > 3) {
        return 2;
      } else {
        return prev > 0 ? prev - 1 : prev;
      }
    });
  };

  const onKeygenPeerDiscoveryContinue = (
    isRelay: boolean,
    sessionID: string,
    devices: string[],
    hexEncryptionKey: string,
    hexChainCode: string
  ) => {
    setIsRelay(isRelay);
    setServerURL(
      isRelay ? Endpoint.VULTISIG_RELAY : Endpoint.LOCAL_MEDIATOR_URL
    );
    setSessionID(sessionID);

    devices.push(localPartyId);
    setDevices(devices);
    setHexEncryptionKey(hexEncryptionKey);
    vault.current.local_party_id = localPartyId;
    vault.current.name = vaultName;
    vault.current.signers = devices;
    vault.current.hex_chain_code = hexChainCode;
    setCurrentScreen(2);
  };

  const keygenStart = async () => {
    await startSession(isRelay, sessionID!, devices).then(() => {
      setCurrentScreen(3);
    });
  };

  // screens
  // 0 - vault name setup
  // 1 - keygen peer discovery screens
  // 2 - keygen verify
  // 3 - keygen view
  // 4 - keygen done
  // 5 - keygen error
  // 6 - backup view
  const screens = [
    {
      title: t('name_your_vault'),
      content: (
        <KeygenNameVault
          onContinue={vaultName => {
            setVaultName(vaultName);

            setCurrentScreen(1);
          }}
        />
      ),
    },
    {
      title: `${t('keygen_for')} ${thresholdType} ${t('vault')}`,
      content: (
        <KeygenPeerDiscovery
          vaultName={vaultName}
          vaultType={thresholdType}
          localPartyID={localPartyId}
          onContinue={onKeygenPeerDiscoveryContinue}
        />
      ),
    },
    {
      title: t('keygen'),
      content: (
        <KeygenVerify
          localPartyId={localPartyId}
          devices={devices}
          onContinue={keygenStart}
        />
      ),
    },
    {
      title: `${t('keygen')}`,
      content: (
        <KeygenView
          vault={vault.current}
          sessionID={sessionID!}
          hexEncryptionKey={hexEncryptionKey}
          keygenType={keygenType.current}
          serverURL={serverURL}
          onDone={() => {
            setCurrentScreen(4);
          }}
          onError={(err: string) => {
            setKeygenError(err);
            setCurrentScreen(5);
          }}
        />
      ),
    },
    {
      title: `${t('join')} ${t('keygen')}`,
      content: (
        <KeygenDone
          onNext={() => {
            setCurrentScreen(6);
          }}
        />
      ),
    },
    {
      title: t('keygen'),
      content: (
        <KeygenFailedState
          message={keygenError}
          onTryAgain={() => setCurrentScreen(2)}
        />
      ),
    },
    {
      title: '',
      content: <KeygenBackupNow />,
    },
  ];

  return (
    <>
      {screens[currentScreen].title && (
        <NavBar
          title={screens[currentScreen].title}
          questionLink={
            currentScreen === 4
              ? 'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault'
              : undefined
          }
          handleBack={currentScreen !== 0 ? prevScreen : undefined}
        />
      )}
      {screens[currentScreen].content}
    </>
  );
};

export default SetupVaultView;
