import { useTranslation } from 'react-i18next';

import RingProgress from '../../../components/ringProgress/RingProgress';
import { VStack } from '../../../lib/ui/layout/Stack';
import { ComponentWithValueProps } from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { KeygenStatus } from './MatchKeygenSessionStatus';

const keygenCompletion: Record<KeygenStatus, number> = {
  prepareVault: 25,
  ecdsa: 50,
  eddsa: 70,
};

export const KeygenProgressIndicator = ({
  value,
}: ComponentWithValueProps<KeygenStatus>) => {
  const { t } = useTranslation();

  const keygenStageText: Record<KeygenStatus, string | null> = {
    prepareVault: t('prepareVault'),
    ecdsa: t('generating_ecdsa_key'),
    eddsa: t('generating_eddsa_key'),
  };

  const completion = keygenCompletion[value];
  const text = keygenStageText[value];

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
