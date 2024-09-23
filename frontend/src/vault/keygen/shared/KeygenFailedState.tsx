import { useTranslation } from 'react-i18next';

import { Button } from '../../../lib/ui/buttons/Button';
import { FilledAlertIcon } from '../../../lib/ui/icons/FilledAlertIcon';
import { VStack } from '../../../lib/ui/layout/Stack';
import { WarningBlock } from '../../../lib/ui/status/WarningBlock';
import { Text } from '../../../lib/ui/text';
import { PageContent } from '../../../ui/page/PageContent';

type KeygenFailedStatePros = {
  message: string;
  onTryAgain: () => void;
};

export const KeygenFailedState = ({
  message,
  onTryAgain,
}: KeygenFailedStatePros) => {
  const { t } = useTranslation();

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
            {t('keygen_failed')}
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
        <Button onClick={onTryAgain}>{t('try_again')}</Button>
      </VStack>
    </PageContent>
  );
};
