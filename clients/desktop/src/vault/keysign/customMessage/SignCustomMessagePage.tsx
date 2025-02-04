import { create } from '@bufbuild/protobuf';
import { CustomMessagePayloadSchema } from '@core/communication/vultisig/keysign/v1/custom_message_payload_pb';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../lib/ui/form/utils/getFormProps';
import { TextInput } from '../../../lib/ui/inputs/TextInput';
import { VStack } from '../../../lib/ui/layout/Stack';
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate';
import { FlowPageHeader } from '../../../ui/flow/FlowPageHeader';
import { PageContent } from '../../../ui/page/PageContent';
import { WithProgressIndicator } from '../shared/WithProgressIndicator';

export const SignCustomMessagePage = () => {
  const { t } = useTranslation();

  const navigate = useAppNavigate();

  const [method, setMethod] = useState('');
  const [message, setMessage] = useState('');

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
                  custom: create(CustomMessagePayloadSchema, {
                    method,
                    message,
                  }),
                },
              },
            });
          },
          isDisabled,
        })}
      >
        <WithProgressIndicator value={0.2}>
          <VStack gap={20}>
            <TextInput
              label={t('method')}
              value={method}
              onValueChange={setMethod}
              placeholder={t('signing_method')}
            />
            <TextInput
              label={t('message')}
              value={message}
              onValueChange={setMessage}
              placeholder={t('message_to_sign')}
            />
          </VStack>
        </WithProgressIndicator>
        <Button isDisabled={isDisabled} type="submit">
          {t('sign')}
        </Button>
      </PageContent>
    </>
  );
};
