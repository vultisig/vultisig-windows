import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../../lib/ui/form/utils/getFormProps';
import { PasswordInput } from '../../../../lib/ui/inputs/PasswordInput';
import { VStack } from '../../../../lib/ui/layout/Stack';
import {
  ComponentWithBackActionProps,
  ComponentWithForwardActionProps,
} from '../../../../lib/ui/props';
import { InfoBlock } from '../../../../lib/ui/status/InfoBlock';
import { Text } from '../../../../lib/ui/text';
import { PageContent } from '../../../../ui/page/PageContent';
import { PageHeader } from '../../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../../ui/page/PageHeaderTitle';
import { KeygenEducationPrompt } from '../../../keygen/shared/KeygenEducationPrompt';
import { useVaultPassword } from './state/password';

export const SetupVaultPasswordStep = ({
  onForward,
  onBack,
}: ComponentWithForwardActionProps & Partial<ComponentWithBackActionProps>) => {
  const { t } = useTranslation();
  const [value, setValue] = useVaultPassword();
  const [repeatedValue, setRepeatedValue] = useState('');

  const isDisabled = useMemo(() => {
    if (!value) {
      return t('password_required');
    }

    if (value !== repeatedValue) {
      return t('passwords_dont_match');
    }
  }, [repeatedValue, t, value]);

  return (
    <>
      <PageHeader
        title={<PageHeaderTitle>{t('password')}</PageHeaderTitle>}
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
            {t('password_backup')}
          </Text>
          <PasswordInput
            placeholder={t('enter_password')}
            value={value}
            onValueChange={setValue}
            autoFocus
          />
          <PasswordInput
            placeholder={t('verify_password')}
            value={repeatedValue}
            onValueChange={setRepeatedValue}
          />
        </VStack>
        <VStack gap={20}>
          <InfoBlock>{t('password_reason')}</InfoBlock>
          <Button type="submit" isDisabled={isDisabled}>
            {t('continue')}
          </Button>
        </VStack>
      </PageContent>
    </>
  );
};
