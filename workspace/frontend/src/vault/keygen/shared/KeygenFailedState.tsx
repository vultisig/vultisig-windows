import { useTranslation } from 'react-i18next';

import { Button } from '../../../lib/ui/buttons/Button';
import { FilledAlertIcon } from '../../../lib/ui/icons/FilledAlertIcon';
import { VStack } from '../../../lib/ui/layout/Stack';
import { WarningBlock } from '../../../lib/ui/status/WarningBlock';
import { Text } from '../../../lib/ui/text';
import { match } from '../../../lib/utils/match';
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack';
import { PageContent } from '../../../ui/page/PageContent';
import { KeygenType } from '../KeygenType';
import { useCurrentKeygenType } from '../state/currentKeygenType';

type KeygenFailedStatePros = {
  message: string;
  onTryAgain?: () => void;
};

export const KeygenFailedState = ({
  message,
  onTryAgain,
}: KeygenFailedStatePros) => {
  const { t } = useTranslation();

  const keygenType = useCurrentKeygenType();

  const title = match(keygenType, {
    [KeygenType.Keygen]: () => t('keygen'),
    [KeygenType.Reshare]: () => t('reshare'),
  });

  const goBack = useNavigateBack();

  return (
    <PageContent>
      <VStack flexGrow gap={40} alignItems="center" justifyContent="center">
        <FilledAlertIcon style={{ fontSize: 66 }} />
        <VStack style={{ maxWidth: 320 }} alignItems="center" gap={8}>
          <Text
            family="mono"
            weight="700"
            size={16}
            color="contrast"
            centerHorizontally
          >
            {title}
          </Text>
          <Text centerHorizontally size={14} color="contrast">
            {message}
          </Text>
        </VStack>
      </VStack>
      <VStack fullWidth gap={12}>
        <WarningBlock>
          {t('information_note1')}
          <br />
          {t('information_note2')}
        </WarningBlock>
        <Button onClick={onTryAgain || goBack}>{t('try_again')}</Button>
      </VStack>
    </PageContent>
  );
};
