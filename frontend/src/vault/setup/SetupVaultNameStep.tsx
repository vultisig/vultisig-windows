import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../../lib/ui/buttons/Button';
import { getFormProps } from '../../lib/ui/form/utils/getFormProps';
import { TextInput } from '../../lib/ui/inputs/TextInput';
import { VStack } from '../../lib/ui/layout/Stack';
import {
  ComponentWithBackActionProps,
  ComponentWithForwardActionProps,
} from '../../lib/ui/props';
import { Text } from '../../lib/ui/text';
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { useVaultNames } from '../hooks/useVaultNames';
import { KeygenEducationPrompt } from '../keygen/shared/KeygenEducationPrompt';
import { useVaultName } from './state/vaultName';

export const SetupVaultNameStep = ({
  onForward,
  onBack,
}: ComponentWithForwardActionProps & Partial<ComponentWithBackActionProps>) => {
  const { t } = useTranslation();
  const [value, setValue] = useVaultName();
  const names = useVaultNames();

  const errorMessage = useMemo(() => {
    if (!value) {
      return t('vault_name_required');
    }

    if (names.includes(value)) {
      return t('vault_name_already_exists');
    }
  }, [names, t, value]);

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        secondaryControls={<KeygenEducationPrompt />}
      />
      <PageContent
        as="form"
        {...getFormProps({
          onSubmit: onForward,
        })}
        gap={16}
      >
        <VStack>
          <Text variant="h1Regular">Name your vault</Text>
          <Text size={14} color="shy">
            You can always rename your vault later in settings
          </Text>
        </VStack>
        <VStack flexGrow gap={4}>
          <TextInput
            withResetValueBtn
            placeholder={t('enter_vault_name')}
            value={value}
            onValueChange={setValue}
            autoFocus
          />
          {errorMessage && (
            <Text color="danger" size={12}>
              {errorMessage}
            </Text>
          )}
        </VStack>
        <Button type="submit" isDisabled={Boolean(errorMessage)}>
          {t('next')}
        </Button>
      </PageContent>
    </>
  );
};
