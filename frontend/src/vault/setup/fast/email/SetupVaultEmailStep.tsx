import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../../lib/ui/form/utils/getFormProps';
import { TextInput } from '../../../../lib/ui/inputs/TextInput';
import { VStack } from '../../../../lib/ui/layout/Stack';
import {
  ComponentWithBackActionProps,
  ComponentWithForwardActionProps,
} from '../../../../lib/ui/props';
import { Text } from '../../../../lib/ui/text';
import { validateEmail } from '../../../../lib/utils/validation/validateEmail';
import { PageContent } from '../../../../ui/page/PageContent';
import { PageHeader } from '../../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../../ui/page/PageHeaderTitle';
import { KeygenEducationPrompt } from '../../../keygen/shared/KeygenEducationPrompt';
import { useVaultEmail } from './state/email';

export const SetupVaultEmailStep = ({
  onForward,
  onBack,
}: ComponentWithForwardActionProps & Partial<ComponentWithBackActionProps>) => {
  const { t } = useTranslation();
  const [value, setValue] = useVaultEmail();
  const [repeatedValue, setRepeatedValue] = useState('');

  const isDisabled = useMemo(() => {
    if (validateEmail(value)) {
      return t('invalid_email');
    }

    if (value !== repeatedValue) {
      return t('emails_dont_match');
    }
  }, [repeatedValue, t, value]);

  return (
    <>
      <PageHeader
        title={<PageHeaderTitle>{t('email')}</PageHeaderTitle>}
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        secondaryControls={<KeygenEducationPrompt />}
      />
      <PageContent
        as="form"
        {...getFormProps({
          isDisabled,
          onSubmit: onForward,
        })}
      >
        <VStack flexGrow gap={12}>
          <Text size={14} weight="600" color="contrast">
            {t('email_backup')}
          </Text>
          <TextInput
            placeholder={t('email')}
            value={value}
            onValueChange={setValue}
            autoFocus
          />
          <TextInput
            placeholder={t('verify_email')}
            value={repeatedValue}
            onValueChange={setRepeatedValue}
          />
        </VStack>
        <Button type="submit" isDisabled={isDisabled}>
          {t('continue')}
        </Button>
      </PageContent>
    </>
  );
};
