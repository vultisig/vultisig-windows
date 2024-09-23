import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button } from '../../lib/ui/buttons/Button';
import { VStack } from '../../lib/ui/layout/Stack';
import { makeAppPath } from '../../navigation';

interface KeygenInitialProps {
  onContinue: () => void;
}

const KeygenInitial: React.FC<KeygenInitialProps> = ({ onContinue }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-around mt-48 px-20">
      <div className="w-80 h-80 bg-btn-primary rounded-2xl p-8 flex flex-col items-center justify-center">
        <img
          src="/assets/icons/initiate.svg"
          alt="create_qr"
          className="mt-12"
        />
        <p className="mt-4 text-sm text-[#BBC1C7]">{t('this_device_is_the')}</p>
        <VStack alignItems="center" gap={40}>
          <p className="mt-2 text-xl font-bold text-white">
            {t('initiating_device')}
          </p>
          <Button onClick={onContinue}>{t('create_qr')}</Button>
        </VStack>
      </div>
      <div className="w-80 h-80 bg-btn-primary rounded-2xl p-8 flex flex-col items-center justify-center">
        <img src="/assets/icons/pair.svg" alt="scan_qr" className="mt-12" />
        <p className="mt-4 text-sm text-[#BBC1C7]">{t('this_device_is_the')}</p>
        <VStack alignItems="center" gap={40}>
          <p className="mt-2 text-xl font-bold text-white">
            {t('pairing_device')}
          </p>
          <Link to={makeAppPath('importVault')}>
            <Button as="div">{t('scan_qr')}</Button>
          </Link>
        </VStack>
      </div>
    </div>
  );
};

export default KeygenInitial;
