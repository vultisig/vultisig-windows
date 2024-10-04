import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EventsOn } from '../../../../wailsjs/runtime/runtime';
import { ProgressLine } from '../../../lib/ui/flow/ProgressLine';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { FancyLoader } from '../../../ui/pending/FancyLoader';

type KeysignStage = 'prepareVault' | 'ecdsa' | 'eddsa';

const keysignCompletion: Record<KeysignStage, number> = {
  prepareVault: 0.8,
  ecdsa: 0.85,
  eddsa: 0.9,
};

export const KeysignSigningState = () => {
  const { t } = useTranslation();

  const [stage, setStage] = useState<KeysignStage>('prepareVault');

  const keygenStageText: Record<KeysignStage, string> = {
    prepareVault: t('prepareVault'),
    ecdsa: t('signing_ecdsa_key'),
    eddsa: t('signing_eddsa_key'),
  };

  useEffect(() => {
    EventsOn('ECDSA', () => setStage('ecdsa'));
    EventsOn('EdDSA', () => setStage('eddsa'));
  }, []);

  const completion = keysignCompletion[stage];
  const text = keygenStageText[stage];

  return (
    <>
      <ProgressLine value={completion} />
      <VStack flexGrow alignItems="center" justifyContent="center">
        <VStack gap={8} alignItems="center">
          <Text family="mono" color="contrast" size={16} weight="700">
            {text}
          </Text>
          <FancyLoader />
        </VStack>
      </VStack>
    </>
  );
};
