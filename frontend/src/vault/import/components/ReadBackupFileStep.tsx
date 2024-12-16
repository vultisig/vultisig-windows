import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { ReadTextFile } from '../../../../wailsjs/go/main/App';
import { VaultContainer } from '../../../gen/vultisig/vault/v1/vault_container_pb';
import { Button } from '../../../lib/ui/buttons/Button';
import { ValueFinishProps } from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { extractErrorMsg } from '../../../lib/utils/error/extractErrorMsg';
import { fromBase64 } from '../../../lib/utils/fromBase64';
import { pipe } from '../../../lib/utils/pipe';
import { useAppPathState } from '../../../navigation/hooks/useAppPathState';
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack';
import { FlowErrorPageContent } from '../../../ui/flow/FlowErrorPageContent';
import { FlowPageHeader } from '../../../ui/flow/FlowPageHeader';
import { FlowPendingPageContent } from '../../../ui/flow/FlowPendingPageContent';

export const ReadBackupFileStep = ({
  onFinish,
}: ValueFinishProps<VaultContainer>) => {
  const { filePath } = useAppPathState<'importVaultFromFile'>();

  const { mutate, ...mutationState } = useMutation({
    mutationFn: async () =>
      pipe(await ReadTextFile(filePath), fromBase64, VaultContainer.fromBinary),
    onSuccess: onFinish,
  });

  const { t } = useTranslation();

  const goBack = useNavigateBack();

  useEffect(mutate, [mutate]);

  return (
    <>
      <FlowPageHeader title={t('import_vault')} />
      <MatchQuery
        value={mutationState}
        success={() => null}
        pending={() => <FlowPendingPageContent title={t('importing_vault')} />}
        error={error => (
          <FlowErrorPageContent
            action={<Button onClick={goBack}>{t('back')}</Button>}
            title={t('failed_to_import_vault')}
            message={extractErrorMsg(error)}
          />
        )}
      />
    </>
  );
};
