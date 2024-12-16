import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { storage } from '../../../../wailsjs/go/models';
import {
  ComponentWithForwardActionProps,
  ComponentWithValueProps,
  TitledComponentProps,
} from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { extractErrorMsg } from '../../../lib/utils/error/extractErrorMsg';
import { FlowErrorPageContent } from '../../../ui/flow/FlowErrorPageContent';
import { FlowPageHeader } from '../../../ui/flow/FlowPageHeader';
import { FlowPendingPageContent } from '../../../ui/flow/FlowPendingPageContent';
import { useSaveVaultMutation } from '../../mutations/useSaveVaultMutation';

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
      <FlowPageHeader title={title} />
      <MatchQuery
        value={mutationState}
        pending={() => <FlowPendingPageContent title={t('saving_vault')} />}
        success={() => null}
        error={error => (
          <FlowErrorPageContent
            title={t('failed_to_save_vault')}
            message={extractErrorMsg(error)}
          />
        )}
      />
    </>
  );
};
