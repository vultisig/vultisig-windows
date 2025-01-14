import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../lib/ui/form/utils/getFormProps';
import { FlowPageHeader } from '../../../ui/flow/FlowPageHeader';
import { PageContent } from '../../../ui/page/PageContent';
import { WithProgressIndicator } from '../shared/WithProgressIndicator';

export const SignCustomMessagePage = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [method] = useState('');
  const [message] = useState('');

  const isDisabled = useMemo(() => {
    if (!method) return t('method_required');
    if (!message) return t('message_required');
  }, [method, message, t]);

  return (
    <>
      <FlowPageHeader title={t('sign_message')} />
      <PageContent
        as="form"
        {...getFormProps({
          onSubmit: () => {
            navigate('keysign', {
              state: {
                keysignPayload: {
                  customMessagePayload: {
                    method,
                    message,
                  },
                },
              },
            });
          },
          isDisabled,
        })}
      >
        <WithProgressIndicator value={0.2}>
          <div>SignCustomMessagePage</div>
        </WithProgressIndicator>
        <Button isDisabled={isDisabled} type="submit">
          {t('sign')}
        </Button>
      </PageContent>
    </>
  );
};
