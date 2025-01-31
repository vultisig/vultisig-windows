import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Button } from '../../../lib/ui/buttons/Button';
import { TextInput } from '../../../lib/ui/inputs/TextInput';
import { VStack } from '../../../lib/ui/layout/Stack';
import {
  ComponentWithBackActionProps,
  ComponentWithForwardActionProps,
} from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { validateEmail } from '../../../lib/utils/validation/validateEmail';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { useVaultEmail } from './state/email';

const emailSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'emailRequired' })
    .refine(val => !validateEmail(val), {
      message: 'emailIncorrect',
    }),
});

type EmailSchema = z.infer<typeof emailSchema>;

export const ServerEmailStep = ({
  onForward,
  onBack,
}: ComponentWithForwardActionProps & Partial<ComponentWithBackActionProps>) => {
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
            <Text variant="h1Regular">{t('enterEmail')}</Text>
            <Text size={14} color="shy">
              {t('emailSetupTitle')}
            </Text>
          </VStack>
          <VStack gap={4}>
            <TextInput
              {...register('email')}
              withResetValueBtn
              isValid={isValid}
              isInvalid={!!errors.email}
              placeholder={t('email')}
              autoFocus
              onValueChange={value => setValue('email', value)}
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
