import { zodResolver } from '@hookform/resolvers/zod';
import { FC, useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { CoinKey } from '../../../coin/Coin';
import { Opener } from '../../../lib/ui/base/Opener';
import { Button } from '../../../lib/ui/buttons/Button';
import { InputContainer } from '../../../lib/ui/inputs/InputContainer';
import { HStack, VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { WithProgressIndicator } from '../../keysign/shared/WithProgressIndicator';
import { RefreshSend } from '../../send/RefreshSend';
import {
  ChainAction,
  chainActionOptionsConfig,
  ChainWithAction,
  requiredFieldsPerChainAction,
} from './chainOptionsConfig';
import { DepositActionItemExplorer } from './DepositActionItemExplorer';
import { Container, ErrorText, InputFieldWrapper } from './DepositForm.styled';

type DepositFormProps = {
  onSubmit: (data: FieldValues) => void;
  coinWithActions: CoinKey;
};

export const DepositForm: FC<DepositFormProps> = ({
  onSubmit,
  coinWithActions,
}) => {
  const { t } = useTranslation();
  const { chainId } = coinWithActions;
  const chainActionOptions =
    chainActionOptionsConfig[chainId?.toLowerCase() as ChainWithAction];

  const [selectedChainAction, setSelectedChainAction] = useState<
    (typeof chainActionOptionsConfig)[ChainWithAction][number] | undefined
  >(chainActionOptions[0]);

  const requiredFieldsForChainAction =
    chainId &&
    selectedChainAction &&
    selectedChainAction in requiredFieldsPerChainAction
      ? requiredFieldsPerChainAction[selectedChainAction as ChainAction].fields
      : [];

  const schemaForChainAction =
    chainId &&
    selectedChainAction &&
    selectedChainAction in requiredFieldsPerChainAction
      ? requiredFieldsPerChainAction[selectedChainAction as ChainAction].schema
      : undefined;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: schemaForChainAction
      ? zodResolver(schemaForChainAction)
      : undefined,
    mode: 'onChange',
  });

  const onFormSubmit = (data: FieldValues) => {
    console.log('Form submitted with data:', data);
    onSubmit(data);
  };

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={<RefreshSend />}
        title={<PageHeaderTitle>{t('send')}</PageHeaderTitle>}
      />
      <PageContent as="form" gap={40} onSubmit={handleSubmit(onFormSubmit)}>
        <WithProgressIndicator value={0.2}>
          <InputContainer>
            <InputFieldWrapper>
              {t('thorchain_message_deposit')}
            </InputFieldWrapper>
          </InputContainer>
          <Opener
            renderOpener={({ onOpen }) => (
              <Container onClick={onOpen}>
                <HStack alignItems="center" gap={8}>
                  <Text weight="400" family="mono" size={16}>
                    {t(`${selectedChainAction}`)}
                  </Text>
                </HStack>
              </Container>
            )}
            renderContent={({ onClose }) => (
              <DepositActionItemExplorer
                onClose={onClose}
                activeOption={selectedChainAction}
                options={chainActionOptions}
                onOptionClick={option => setSelectedChainAction(option)}
              />
            )}
          />
          {selectedChainAction && requiredFieldsForChainAction.length > 0 && (
            <VStack gap={12}>
              {requiredFieldsForChainAction.map(field => (
                <InputContainer key={field.name}>
                  <Text size={15} weight="400">
                    {t(
                      `chainFunctions.${selectedChainAction}.labels.${field.name}`
                    ) +
                      ' ' +
                      `${field.required ? `(${t('chainFunctions.required_validation')})` : ''}`}
                  </Text>
                  <InputFieldWrapper
                    as="input"
                    type={field.type}
                    {...register(field.name)}
                    required={field.required}
                  />
                  {errors[field.name] && (
                    <ErrorText color="danger" size={13} className="error">
                      {t(
                        `chainFunctions.${selectedChainAction}.validations.${field.name}`,
                        {
                          defaultValue: t('chainFunctions.default_validation'),
                        }
                      )}
                    </ErrorText>
                  )}
                </InputContainer>
              ))}
            </VStack>
          )}
        </WithProgressIndicator>
        <Button type="submit" disabled={!isValid}>
          {t('continue')}
        </Button>
      </PageContent>
    </>
  );
};
