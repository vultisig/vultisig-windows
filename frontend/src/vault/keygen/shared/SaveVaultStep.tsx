import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { storage } from '../../../../wailsjs/go/models';
import {
  ComponentWithForwardActionProps,
  ComponentWithValueProps,
  TitledComponentProps,
} from '../../../lib/ui/props';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { extractErrorMsg } from '../../../lib/utils/error/extractErrorMsg';
import { FlowPageHeader } from '../../../ui/flow/FlowPageHeader';
import { PageContent } from '../../../ui/page/PageContent';
import { useSaveVaultMutation } from '../../mutations/useSaveVaultMutation';
import { KeygenFailedState } from './KeygenFailedState';
import { PendingKeygenMessage } from './PendingKeygenMessage';

export const SaveVaultStep: React.FC<
  ComponentWithValueProps<storage.Vault> &
    ComponentWithForwardActionProps &
    TitledComponentProps
> = ({ value, onForward, title }) => {
  const { t } = useTranslation();

  const { mutate, ...mutationState } = useSaveVaultMutation({
    onSuccess: onForward,
  });

  useEffect(() => {
    mutate(value);
  }, [mutate, value]);

  return (
    <>
      <QueryDependant
        query={mutationState}
        pending={() => (
          <>
            <FlowPageHeader title={title} />
            <PageContent flexGrow alignItems="center" justifyContent="center">
              <PendingKeygenMessage>{t('saving_vault')}</PendingKeygenMessage>
            </PageContent>
          </>
        )}
        success={() => null}
        error={error => <KeygenFailedState message={extractErrorMsg(error)} />}
      />
    </>
  );
};
