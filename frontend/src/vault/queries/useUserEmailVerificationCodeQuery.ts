import { useQuery } from '@tanstack/react-query';

import {
  getUserEmailVerificationCode,
  GetUserEmailVerificationCodeParams,
} from '../server/utils/getUserEmailVerificationCode';

export const useUserEmailVerificationCodeQuery = ({
  code,
  publicKeyECDSA,
}: GetUserEmailVerificationCodeParams) => {
  return useQuery({
    queryKey: ['userEmailVerificationCode'],
    queryFn: async () => {
      if (!publicKeyECDSA) {
        throw new Error('missing_public_key_ecdsa');
      }

      if (!code) {
        throw new Error('missing_verification_code');
      }

      return await getUserEmailVerificationCode({
        code,
        publicKeyECDSA,
      });
    },
    // Prevent the query from auto-fetching on first load
    enabled: false,
  });
};
