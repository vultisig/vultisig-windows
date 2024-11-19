import { useMutation } from '@tanstack/react-query';

import {
  confirmUserEmailVerificationCode,
  ConfirmUserEmailVerificationCodeParams,
} from '../server/utils/confirmUserEmailVerificationCode';

export const userEmailVerificationCodeQueryKey = ['userEmailVerificationCode'];

export const useUserEmailVerificationCodeMutation = () => {
  return useMutation({
    mutationKey: userEmailVerificationCodeQueryKey,
    mutationFn: async ({
      code,
      publicKeyECDSA,
    }: ConfirmUserEmailVerificationCodeParams) => {
      if (!publicKeyECDSA) {
        throw new Error('missing_public_key_ecdsa');
      }

      if (!code) {
        throw new Error('missing_verification_code');
      }

      try {
        await confirmUserEmailVerificationCode({
          code,
          publicKeyECDSA,
        });

        return { success: true };
      } catch (error: unknown) {
        throw new Error(`Error ${error}`);
      }
    },
  });
};
