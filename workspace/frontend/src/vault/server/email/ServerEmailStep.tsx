import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { ActionInsideInteractiveElement } from '../../../lib/ui/base/ActionInsideInteractiveElement';
import { Button } from '../../../lib/ui/buttons/Button';
import { iconButtonIconSizeRecord } from '../../../lib/ui/buttons/IconButton';
import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton';
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '../../../lib/ui/css/textInput';
import { CircledCloseIcon } from '../../../lib/ui/icons/CircledCloseIcon';
import { TextInput } from '../../../lib/ui/inputs/TextInput';
import { VStack } from '../../../lib/ui/layout/Stack';
import { OnBackProp, OnForwardProp } from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { validateEmail } from '@lib/utils/validation/validateEmail';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { useVaultEmail } from './state/email';

const emailSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'fastVaultSetup.emailRequired' })
    .refine(val => !validateEmail(val), {
      message: 'fastVaultSetup.emailIncorrect',
    }),
});

type EmailSchema = z.infer<typeof emailSchema>;

export const ServerEmailStep = ({
  onForward,
  onBack,
}: OnForwardProp & Partial<OnBackProp>) => {
  const { t } = useTranslation();
  const [storedEmail, setStoredEmail] = useVaultEmail();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<EmailSchema>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: storedEmail || '',
    },
    mode: 'onBlur',
  });

  const onSubmit = (data: EmailSchema) => {
    setStoredEmail(data.email);
    onForward();
  };

  return (
    <>
      <PageHeader primaryControls={<PageHeaderBackButton onClick={onBack} />} />
      <PageContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <VStack flexGrow gap={16}>
          <VStack>
            <Text variant="h1Regular">{t('fastVaultSetup.enterEmail')}</Text>
            <Text size={14} color="shy">
              {t('fastVaultSetup.emailSetupTitle')}
            </Text>
          </VStack>
          <VStack gap={4}>
            <ActionInsideInteractiveElement
              render={() => (
                <TextInput
                  {...register('email')}
                  validationState={
                    isValid ? 'valid' : errors.email ? 'invalid' : undefined
                  }
                  placeholder={t('email')}
                  autoFocus
                  onValueChange={value => setValue('email', value)}
                />
              )}
              action={
                <UnstyledButton onClick={() => setValue('email', '')}>
                  <CircledCloseIcon />
                </UnstyledButton>
              }
              actionPlacerStyles={{
                right: textInputHorizontalPadding,
                bottom: (textInputHeight - iconButtonIconSizeRecord.l) / 2,
              }}
            />

            {errors.email && errors.email.message && (
              <Text color="danger" size={12}>
                {t(errors.email.message)}
              </Text>
            )}
          </VStack>
        </VStack>
        <VStack gap={20}>
          <Button type="submit" isDisabled={!!errors.email}>
            {t('next')}
          </Button>
        </VStack>
      </PageContent>
    </>
  );
};
