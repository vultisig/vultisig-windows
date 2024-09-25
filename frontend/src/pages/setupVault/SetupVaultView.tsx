import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { storage } from '../../../wailsjs/go/models';
import KeygenBackupNow from '../../components/keygen/KeygenBackupNow';
import KeygenDone from '../../components/keygen/KeygenDone';
import KeygenPeerDiscovery from '../../components/keygen/KeygenPeerDiscovery';
import KeygenVerify from '../../components/keygen/KeygenVerify';
import KeygenView from '../../components/keygen/KeygenView';
import NavBar from '../../components/navbar/NavBar';
import { ComponentWithBackActionProps } from '../../lib/ui/props';
import { useAppPathParams } from '../../navigation/hooks/useAppPathParams';
import { Endpoint } from '../../services/Endpoint';
import { startSession } from '../../services/Keygen/Keygen';
import { KeygenType } from '../../vault/keygen/KeygenType';
import { KeygenFailedState } from '../../vault/keygen/shared/KeygenFailedState';
import { generateLocalPartyId } from '../../vault/keygen/utils/generateLocalPartyId';
import { useVaultName } from '../../vault/setup/state/vaultName';

export const SetupVaultView = ({ onBack }: ComponentWithBackActionProps) => {
  const { t } = useTranslation();
  const [currentScreen, setCurrentScreen] = useState<number>(0);
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
  const [vaultName] = useVaultName();

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
      if (prev > 2) {
        return 1;
      } else {
        return prev - 1;
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
    setCurrentScreen(1);
  };

  const keygenStart = async () => {
    await startSession(isRelay, sessionID!, devices).then(() => {
      setCurrentScreen(2);
    });
  };

  // screens
  // 0 - keygen peer discovery screens
  // 1 - keygen verify
  // 2 - keygen view
  // 3 - keygen done
  // 4 - keygen error
  // 5 - backup view
  const screens = [
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
            setCurrentScreen(3);
          }}
          onError={(err: string) => {
            setKeygenError(err);
            setCurrentScreen(4);
          }}
        />
      ),
    },
    {
      title: `${t('join')} ${t('keygen')}`,
      content: (
        <KeygenDone
          onNext={() => {
            setCurrentScreen(5);
          }}
        />
      ),
    },
    {
      title: t('keygen'),
      content: (
        <KeygenFailedState
          message={keygenError}
          onTryAgain={() => setCurrentScreen(1)}
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
          handleBack={currentScreen == 0 ? onBack : prevScreen}
        />
      )}
      {screens[currentScreen].content}
    </>
  );
};
