import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { TxOverviewPanel } from '../../../chain/tx/components/TxOverviewPanel';
import {
  TxOverviewColumn,
  TxOverviewRow,
} from '../../../chain/tx/components/TxOverviewRow';
import { Button } from '../../../lib/ui/buttons/Button';
import { Text } from '../../../lib/ui/text';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { WithProgressIndicator } from '../../keysign/shared/WithProgressIndicator';
import { DepositFee } from '../DepositFee';
import { DepositFiatFee } from '../DepositFiatFee';
import {
  ChainAction,
  requiredFieldsPerChainAction,
} from '../DepositForm/chainOptionsConfig';
import { StrictText, StrictTextContrast } from './DepositVerify.styled';

type DepositVerifyProps = {
  depositFormData: Record<string, unknown>;
  selectedChainAction?: ChainAction;
  onBack: () => void;
};

export const DepositVerify: FC<DepositVerifyProps> = ({
  onBack,
  depositFormData,
  selectedChainAction,
}) => {
  const { t } = useTranslation();
  const actionFields = selectedChainAction
    ? requiredFieldsPerChainAction[selectedChainAction]?.fields
    : [];

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={<PageHeaderTitle>{t('verify')}</PageHeaderTitle>}
      />
      <PageContent gap={40}>
        <WithProgressIndicator value={0.3}>
          <TxOverviewPanel>
            {actionFields.map(field => {
              if (!depositFormData[field.name]) return null;

              return field.type === 'number' || field.type === 'percentage' ? (
                <TxOverviewRow key={field.name}>
                  <Text size={18} weight={700}>
                    {t(field.label)}
                  </Text>
                  <StrictText>{String(depositFormData[field.name])}</StrictText>
                </TxOverviewRow>
              ) : (
                <TxOverviewColumn key={field.name}>
                  <Text size={18} weight={700}>
                    {t(field.label)}
                  </Text>
                  <StrictTextContrast>
                    {String(depositFormData[field.name])}
                  </StrictTextContrast>
                </TxOverviewColumn>
              );
            })}
            <TxOverviewRow>
              <DepositFee />
            </TxOverviewRow>
            <TxOverviewRow>
              <DepositFiatFee />
            </TxOverviewRow>
          </TxOverviewPanel>
        </WithProgressIndicator>
        <Button onClick={() => {}}>{t('sign')}</Button>
      </PageContent>
    </>
  );
};
