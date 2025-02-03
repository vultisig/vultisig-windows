import { useTranslation } from 'react-i18next';

import { ProgressLine } from '../../../lib/ui/flow/ProgressLine';
import { VStack } from '../../../lib/ui/layout/Stack';
import { ValueProp } from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { FancyLoader } from '../../../ui/pending/FancyLoader';
import { KeygenStatus } from '../../keygen/shared/MatchKeygenSessionStatus';

const keysignCompletion: Record<KeygenStatus, number> = {
  prepareVault: 0.8,
  ecdsa: 0.85,
  eddsa: 0.9,
};

export const KeysignSigningState = ({ value }: ValueProp<KeygenStatus>) => {
  const { t } = useTranslation();

  const keygenStageText: Record<KeygenStatus, string> = {
    prepareVault: t('prepareVault'),
    ecdsa: t('signing_ecdsa_key'),
    eddsa: t('signing_eddsa_key'),
  };

  const completion = keysignCompletion[value];
  const text = keygenStageText[value];

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
