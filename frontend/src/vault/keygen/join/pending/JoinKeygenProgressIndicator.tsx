import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EventsOn } from '../../../../../wailsjs/runtime/runtime';
import RingProgress from '../../../../components/ringProgress/RingProgress';
import { VStack } from '../../../../lib/ui/layout/Stack';
import { Text } from '../../../../lib/ui/text';

type KeygenStage = 'init' | 'prepareVault' | 'ecdsa' | 'eddsa';

const keygenCompletion: Record<KeygenStage, number> = {
  init: 0,
  prepareVault: 25,
  ecdsa: 50,
  eddsa: 70,
};

export const JoinKeygenProgressIndicator = () => {
  const { t } = useTranslation();

  const [stage, setStage] = useState<KeygenStage>('init');

  const keygenStageText: Record<KeygenStage, string | null> = {
    init: null,
    prepareVault: t('prepareVault'),
    ecdsa: t('generating_ecdsa_key'),
    eddsa: t('generating_eddsa_key'),
  };

  useEffect(() => {
    EventsOn('PrepareVault', () => setStage('prepareVault'));
    EventsOn('ECDSA', () => setStage('ecdsa'));
    EventsOn('EdDSA', () => setStage('eddsa'));
  }, []);

  const completion = keygenCompletion[stage];
  const text = keygenStageText[stage];

  return (
    <VStack gap={12} alignItems="center">
      <RingProgress size={100} strokeWidth={10} progress={completion} />
      {text && (
        <Text family="mono" color="contrast" size={14} weight="400">
          {text}
        </Text>
      )}
    </VStack>
  );
};
