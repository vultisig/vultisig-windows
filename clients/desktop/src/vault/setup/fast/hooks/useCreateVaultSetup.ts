import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { useEffect } from 'react';

import { useKeygenMutation } from '../../../keygen/shared/mutations/useKeygenMutation';
import { useSaveVaultMutation } from '../../../mutations/useSaveVaultMutation';

export const useCreateVaultSetup = () => {
  const { mutate: performKeygen, ...keygenState } = useKeygenMutation();
  const { mutate: saveVault, ...saveVaultState } = useSaveVaultMutation();
  const vault = keygenState.data;

  useEffect(performKeygen, [performKeygen]);

  useEffect(() => {
    if (!keygenState.isSuccess || saveVaultState.isSuccess) return;

    saveVault(shouldBePresent(vault));
  }, [keygenState.isSuccess, saveVault, saveVaultState.isSuccess, vault]);

  return {
    vault,
    isPending: keygenState.isPending || saveVaultState.isPending,
    data: keygenState.isSuccess && saveVaultState.isSuccess ? {} : undefined,
    error: keygenState.error || saveVaultState.error,
  };
};
