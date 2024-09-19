import { useMutation } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { storage } from '../../../wailsjs/go/models';
import DiscoveryServiceScreen from '../../components/keygen/DiscoveryService';
import JoinKeygen from '../../components/keygen/JoinKeygen';
import KeygenBackupNow from '../../components/keygen/KeygenBackupNow';
import KeygenDone from '../../components/keygen/KeygenDone';
import KeygenError from '../../components/keygen/KeygenError';
import KeygenView from '../../components/keygen/KeygenView';
import NavBar from '../../components/navbar/NavBar';
import { makeAppPath } from '../../navigation';
import { useAppPathParams } from '../../navigation/hooks/useAppPathParams';
import { Endpoint } from '../../services/Endpoint';
import { joinSession } from '../../services/Keygen/Keygen';
import { generateRandomNumber } from '../../utils/util';
import { keygenMsgRecord } from '../../vault/keygen/KeygenType';
import { useVaults } from '../../vault/queries/useVaultsQuery';

const JoinKeygenView: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState<number>(0);
  const [keygenError, setKeygenError] = useState<string>('');

  const { keygenType, keygenMsg: rawKeygenMsg } =
    useAppPathParams<'joinKeygen'>();

  const keygenMsg = useMemo(() => {
    const { fromJsonString } = keygenMsgRecord[keygenType];

    return fromJsonString(rawKeygenMsg);
  }, [keygenType, rawKeygenMsg]);

  const vaults = useVaults();

  const {
    sessionId,
    useVultisigRelay,
    vaultName,
    hexChainCode,
    serviceName,
    encryptionKeyHex,
  } = keygenMsg;

  const localPartyId = useMemo(() => {
    return 'windows-' + generateRandomNumber();
  }, []);

  const vault = useMemo(() => {
    if ('publicKeyEcdsa' in keygenMsg) {
      const existingVault = vaults.find(
        vault => vault.public_key_ecdsa === keygenMsg.publicKeyEcdsa
      );
      if (existingVault) {
        return existingVault;
      }
    }

    const vault = new storage.Vault();
    vault.name = vaultName;
    vault.hex_chain_code = hexChainCode;
    vault.local_party_id = localPartyId;

    if ('oldResharePrefix' in keygenMsg) {
      vault.reshare_prefix = keygenMsg.oldResharePrefix;
    }

    if ('oldParties' in keygenMsg) {
      vault.signers = keygenMsg.oldParties;
    }

    return vault;
  }, [hexChainCode, keygenMsg, localPartyId, vaultName, vaults]);

  const serverUrl = useVultisigRelay ? Endpoint.VULTISIG_RELAY : '';

  const { mutate: joinKeygen } = useMutation({
    mutationFn: () => {
      return joinSession(serverUrl, sessionId, localPartyId);
    },
    onSuccess: () => {
      setCurrentScreen(2);
    },
  });

  useEffect(() => {
    if (useVultisigRelay) {
      joinKeygen();
    } else {
      setCurrentScreen(1);
    }
  }, [joinKeygen, useVultisigRelay]);

  const prevScreen = () => {
    setCurrentScreen(prev => {
      if (prev > 5) {
        return 4;
      } else {
        return prev > 0 ? prev - 1 : prev;
      }
    });
  };

  const screens = [
    {
      title: t('keygen'),
      content: <JoinKeygen />,
    },
    {
      title: t('setup'),
      content: (
        <DiscoveryServiceScreen
          onContinue={() => {
            joinKeygen();
          }}
          localPartyID={localPartyId}
          serviceName={serviceName}
        />
      ),
    },
    {
      title: `${t('keygen')}`,
      content: (
        <KeygenView
          vault={vault}
          sessionID={sessionId}
          hexEncryptionKey={encryptionKeyHex}
          keygenType={keygenType}
          serverURL={serverUrl}
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
        <KeygenError
          keygenError={keygenError}
          onTryAgain={() => {
            navigate(makeAppPath('vaultList'));
          }}
        />
      ),
    },
    {
      // 5
      title: '',
      content: <KeygenBackupNow />,
    },
  ];
  return (
    <>
      {screens[currentScreen].title && (
        <NavBar
          title={screens[currentScreen].title}
          questionLink={undefined}
          handleBack={currentScreen !== 0 ? prevScreen : undefined}
        />
      )}
      {screens[currentScreen].content}
    </>
  );
};
export default JoinKeygenView;
