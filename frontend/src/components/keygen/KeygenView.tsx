import { useMutation } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { storage } from '../../../wailsjs/go/models';
import { EventsOn } from '../../../wailsjs/runtime/runtime';
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries';
import { match } from '../../lib/utils/match';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { VaultServiceFactory } from '../../services/Vault/VaultServiceFactory';
import { KeygenType } from '../../vault/keygen/KeygenType';
import { vaultsQueryKey } from '../../vault/queries/useVaultsQuery';
import RingProgress from '../ringProgress/RingProgress';

interface KeygenViewProps {
  vault: storage.Vault;
  sessionID: string;
  hexEncryptionKey: string;
  keygenType: KeygenType;
  serverURL: string;
  onDone: () => void;
  onError: (err: string) => void;
}
const KeygenView: React.FC<KeygenViewProps> = ({
  vault,
  sessionID,
  hexEncryptionKey,
  keygenType,
  serverURL,
  onDone,
  onError,
}) => {
  const { t } = useTranslation();
  const [contentIndex, setContentIndex] = useState<number>(0);
  const [currentProgress, setCurrentProgress] = useState<number>();
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const walletCore = useAssertWalletCore();
  const invalidateQueries = useInvalidateQueries();

  useEffect(() => {
    EventsOn('PrepareVault', data => {
      console.log('PrepareVault', data);
      setCurrentProgress(25);
      setCurrentStatus(t('prepareVault'));
    });
    EventsOn('ECDSA', data => {
      console.log('Generating ECDSA', data);
      setCurrentProgress(50);
      setCurrentStatus(t('generating_ecdsa_key'));
    });
    EventsOn('EdDSA', data => {
      console.log('Generating EDDSA', data);
      setCurrentProgress(70);
      setCurrentStatus(t('generating_eddsa_key'));
    });
  }, [t]);

  const { mutate: startKeygen } = useMutation({
    mutationFn: async () => {
      const vaultService = VaultServiceFactory.getService(walletCore);
      const newVault = await match(keygenType, {
        [KeygenType.Keygen]: async () => {
          return vaultService.startKeygen(
            vault,
            sessionID,
            hexEncryptionKey,
            serverURL
          );
        },
        [KeygenType.Reshare]: async () => {
          return vaultService.reshare(
            vault,
            sessionID,
            hexEncryptionKey,
            serverURL
          );
        },
      });

      if (!newVault) {
        throw new Error('Failed to start keygen');
      }

      await invalidateQueries(vaultsQueryKey);
    },
    onError,
    onSuccess: onDone,
  });

  useEffect(() => {
    startKeygen();
  }, [startKeygen]);

  const contents = [
    {
      title: t('join_keygen_slider1_title'),
      note: (
        <>
          {t('join_keygen_slider1_note1')}{' '}
          <span className="text-secondary">
            {t('join_keygen_slider1_note2')}
          </span>
          . {t('join_keygen_slider1_note3')}
        </>
      ),
      slider: '/assets/images/keygenSlider1.svg',
    },
    {
      title: t('join_keygen_slider2_title'),
      note: (
        <>
          <span className="text-secondary">
            {t('join_keygen_slider2_note1')}
          </span>
          ! {t('join_keygen_slider2_note2')}
        </>
      ),
      slider: '/assets/images/keygenSlider2.svg',
    },
    {
      title: t('join_keygen_slider3_title'),
      note: (
        <>
          {t('join_keygen_slider3_note1')}{' '}
          <span className="text-secondary">
            {t('join_keygen_slider3_note2')}
          </span>
          . {t('join_keygen_slider3_note3')}
        </>
      ),
      slider: '/assets/images/keygenSlider3.svg',
    },
    {
      title: t('join_keygen_slider4_title'),
      note: (
        <>
          {t('join_keygen_slider4_note1')}{' '}
          <span className="text-secondary">
            {t('join_keygen_slider4_note2')}
          </span>{' '}
          {t('join_keygen_slider4_note3')}
        </>
      ),
      slider: '/assets/images/keygenSlider4.svg',
    },
    {
      title: t('join_keygen_slider5_title'),
      note: (
        <>
          {t('join_keygen_slider5_note1')}{' '}
          <span className="text-secondary">
            {t('join_keygen_slider5_note2')}
          </span>{' '}
          {t('join_keygen_slider5_note3')}
        </>
      ),
      slider: '/assets/images/keygenSlider5.svg',
    },
    {
      title: t('join_keygen_slider6_title'),
      note: (
        <>
          {t('join_keygen_slider6_note1')}{' '}
          <span className="text-secondary">
            {t('join_keygen_slider6_note2')}
          </span>
          .
        </>
      ),
      slider: '/assets/images/keygenSlider6.svg',
    },
    {
      title: t('join_keygen_slider7_title'),
      note: (
        <>
          {t('join_keygen_slider7_note1')}{' '}
          <span className="text-secondary">
            {t('join_keygen_slider7_note2')}
          </span>
          {', '}
          {t('join_keygen_slider7_note3')}
        </>
      ),
      slider: '/assets/images/keygenSlider7.svg',
    },
  ];

  const runSliders = useCallback(() => {
    if (contentIndex < contents.length - 1) {
      setContentIndex(contentIndex + 1);
    } else {
      setContentIndex(0);
    }
  }, [contentIndex, contents.length]);

  useEffect(() => {
    setTimeout(runSliders, 3000);
  }, [runSliders]);

  return (
    <div className="flex flex-col items-center justify-center pt-20 text-white text-sm">
      <RingProgress size={100} strokeWidth={10} progress={currentProgress!} />
      <p className="mt-5">{currentStatus}</p>
      <p className="mt-10 font-bold text-xl">{contents[contentIndex].title}</p>
      <p className="mt-5 w-80 h-28 text-center">
        {contents[contentIndex].note}
      </p>
      <img src={contents[contentIndex].slider} alt="slider" className="mb-32" />
      <img
        src="/assets/icons/wifi.svg"
        alt="wifi"
        className="mx-auto mb-4 w-8"
      />
      <p>{t('devices_on_same_wifi')}</p>
    </div>
  );
};

export default KeygenView;
