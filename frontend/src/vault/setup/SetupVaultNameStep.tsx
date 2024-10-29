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
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
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

  const isDisabled = useMemo(() => {
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
        title={<PageHeaderTitle>{t('name_your_vault')}</PageHeaderTitle>}
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
        <VStack flexGrow>
          <TextInput
            label={t('vault_name')}
            placeholder={t('enter_vault_name')}
            value={value}
            onValueChange={setValue}
            autoFocus
          />
        </VStack>
        <Button type="submit" isDisabled={isDisabled}>
          {t('continue')}
        </Button>
      </PageContent>
    </>
  );
};
