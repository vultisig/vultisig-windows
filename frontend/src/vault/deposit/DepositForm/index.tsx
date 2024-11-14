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
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { WithProgressIndicator } from '../../keysign/shared/WithProgressIndicator';
import { RefreshSend } from '../../send/RefreshSend';
import {
  getChainActionSchema,
  getRequiredFields,
  resolveSchema,
} from '../utils/schema';
import {
  ChainAction,
  chainActionOptionsConfig,
  ChainWithAction,
} from './chainOptionsConfig';
import { DepositActionItemExplorer } from './DepositActionItemExplorer';
import { Container, ErrorText, InputFieldWrapper } from './DepositForm.styled';

type DepositFormProps = {
  onSubmit: (data: FieldValues, selectedChainAction: ChainAction) => void;
  coinWithActions: CoinKey;
};

export const DepositForm: FC<DepositFormProps> = ({
  onSubmit,
  coinWithActions,
}) => {
  const walletCore = useAssertWalletCore();
  const { t } = useTranslation();
  const { chainId } = coinWithActions;
  const chainActionOptions =
    chainActionOptionsConfig[chainId?.toLowerCase() as ChainWithAction];

  const [selectedChainAction, setSelectedChainAction] = useState<ChainAction>(
    chainActionOptions[0] as ChainAction
  );

  const requiredFieldsForChainAction = getRequiredFields(
    chainId,
    selectedChainAction
  );
  const chainActionSchema = getChainActionSchema(chainId, selectedChainAction);
  const schemaForChainAction = resolveSchema(
    chainActionSchema,
    chainId,
    walletCore
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: schemaForChainAction
      ? zodResolver(schemaForChainAction)
      : undefined,
    mode: 'onBlur',
  });

  const onFormSubmit = (data: FieldValues) => {
    onSubmit(data, selectedChainAction as ChainAction);
  };

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={<RefreshSend />}
        title={<PageHeaderTitle>{t('deposit')}</PageHeaderTitle>}
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
                onOptionClick={option =>
                  setSelectedChainAction(option as ChainAction)
                }
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
                    )}{' '}
                    {field.required ? (
                      <Text as="span" color="danger" size={14}>
                        *
                      </Text>
                    ) : (
                      <Text as="span" size={14}>
                        ({t('chainFunctions.optional_validation')})
                      </Text>
                    )}
                  </Text>
                  <InputFieldWrapper
                    as="input"
                    type={field.type}
                    {...register(field.name)}
                    required={field.required}
                  />
                  {errors[field.name] && (
                    <ErrorText color="danger" size={13} className="error">
                      {t(errors[field.name]?.message as string, {
                        defaultValue: t('chainFunctions.default_validation'),
                      })}
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
