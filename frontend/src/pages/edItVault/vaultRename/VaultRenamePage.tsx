import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { PageSlice } from '../../../ui/page/PageSlice';
import { VStack } from '../../../lib/ui/layout/Stack';
import { FieldValues, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text } from '../../../lib/ui/text';
import {
  ButtonWithBottomSpace,
  InputField,
  InputFieldWrapper,
} from './VaultRenamePage.styles';
import { z } from 'zod';

const renameSchema = z.object({
  vaultName: z.string().min(2, 'vault_rename_page_name_error').max(50),
});

const VaultRenamePage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(renameSchema),
    mode: 'onBlur',
  });

  const onSubmit = (data: FieldValues) => {
    // TODO: @antonio to implement logic after @enrique implements the BE
  };

  const { t } = useTranslation();

  return (
    <VStack flexGrow gap={16}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>
            {t('vault_rename_page_header_title')}
          </PageHeaderTitle>
        }
      />
      <PageSlice gap={16} flexGrow={true}>
        <Text size={16} color="contrast" weight="600">
          {t('vault_rename_page_name_title')}
        </Text>
        <VStack
          flexGrow={true}
          justifyContent="space-between"
          as="form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <VStack gap={12}>
            <div>
              <InputFieldWrapper>
                <InputField
                  type="text"
                  placeholder="Type here..."
                  {...register('vaultName')}
                />
              </InputFieldWrapper>
              {errors.vaultName?.message && (
                <Text size={12} color="danger">
                  {typeof errors.vaultName.message === 'string' &&
                    t(errors.vaultName.message)}
                </Text>
              )}
            </div>
          </VStack>
          <ButtonWithBottomSpace
            isDisabled={!isValid || !isDirty}
            type="submit"
          >
            {t('vault_rename_page_submit_button_text')}
          </ButtonWithBottomSpace>
        </VStack>
      </PageSlice>
    </VStack>
  );
};

export default VaultRenamePage;
