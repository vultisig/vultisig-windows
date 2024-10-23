import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ComponentWithBackActionProps,
  ComponentWithForwardActionProps,
} from '../../../lib/ui/props';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { isEmpty } from '../../../lib/utils/array/isEmpty';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { KeygenFailedState } from '../../keygen/shared/KeygenFailedState';
import { usePeerOptionsQuery } from '../../keygen/shared/peerDiscovery/queries/usePeerOptionsQuery';
import { useVaultType } from '../shared/state/vaultType';
import { SetupFastVaultServerLoader } from './SetupFastVaultServerLoader';

export const SetupVaultWaitServerStep: React.FC<
  ComponentWithForwardActionProps & ComponentWithBackActionProps
> = ({ onForward, onBack }) => {
  const { t } = useTranslation();

  const peerOptionsQuery = usePeerOptionsQuery();

  const { data } = peerOptionsQuery;
  useEffect(() => {
    if (data && !isEmpty(data)) {
      onForward();
    }
  }, [onForward, data]);

  const type = useVaultType();

  return (
    <>
      <PageHeader
        title={
          <PageHeaderTitle>
            {t('keygen_for_vault', { type: t(type) })}
          </PageHeaderTitle>
        }
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
      />
      <QueryDependant
        query={peerOptionsQuery}
        pending={() => <SetupFastVaultServerLoader />}
        success={() => <SetupFastVaultServerLoader />}
        error={error => (
          <KeygenFailedState message={error.message} onTryAgain={onBack} />
        )}
      />
    </>
  );
};