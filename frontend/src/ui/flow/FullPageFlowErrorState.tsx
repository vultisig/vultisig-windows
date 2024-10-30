import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button } from '../../lib/ui/buttons/Button';
import { FilledAlertIcon } from '../../lib/ui/icons/FilledAlertIcon';
import { VStack } from '../../lib/ui/layout/Stack';
import {
  ComponentWithActionProps,
  ComponentWithMessageProps,
  TitledComponentProps,
} from '../../lib/ui/props';
import { Text } from '../../lib/ui/text';
import { makeAppPath } from '../../navigation';
import { PageContent } from '../page/PageContent';
import { PageHeader } from '../page/PageHeader';
import { PageHeaderBackButton } from '../page/PageHeaderBackButton';
import { PageHeaderTitle } from '../page/PageHeaderTitle';

export const FullPageFlowErrorState = ({
  title,
  action,
  message,
}: TitledComponentProps &
  Partial<ComponentWithActionProps> &
  ComponentWithMessageProps) => {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{title ?? t('keysign')}</PageHeaderTitle>}
      />
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
              {message}
            </Text>
          </VStack>
        </VStack>
        {action ?? (
          <Link to={makeAppPath('vault')}>
            <Button as="div">{t('try_again')}</Button>
          </Link>
        )}
      </PageContent>
    </>
  );
};
